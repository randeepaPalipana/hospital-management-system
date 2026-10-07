const { query, transaction } = require('../config/db');

class BillingModel {
  /**
   * Generate Invoice Number: INV-YYYY-NNNNN
   */
  static async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const sql = `SELECT invoice_number FROM bills WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1`;
    const rows = await query(sql, [`${prefix}%`]);
    let nextNum = 1;
    if (rows.length > 0) {
      const last = rows[0].invoice_number;
      nextNum = parseInt(last.split('-')[2], 10) + 1;
    }
    return `${prefix}${String(nextNum).padStart(5, '0')}`;
  }

  /**
   * Generate Payment Receipt Number: RCP-YYYY-NNNNN
   */
  static async generateReceiptNumber() {
    const year = new Date().getFullYear();
    const prefix = `RCP-${year}-`;
    const sql = `SELECT receipt_number FROM payments WHERE receipt_number LIKE ? ORDER BY id DESC LIMIT 1`;
    const rows = await query(sql, [`${prefix}%`]);
    let nextNum = 1;
    if (rows.length > 0) {
      const last = rows[0].receipt_number;
      nextNum = parseInt(last.split('-')[2], 10) + 1;
    }
    return `${prefix}${String(nextNum).padStart(5, '0')}`;
  }

  // --- Bills Querying ---
  static async findAll({ status, patientId, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT 
        b.id, b.invoice_number, b.patient_id, b.total_amount, b.discount_amount,
        b.tax_amount, b.net_amount, b.paid_amount, b.balance_due, b.status,
        b.due_date, b.created_at, b.updated_at,
        p.mrn AS patient_mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
        p.phone AS patient_phone, p.email AS patient_email,
        COUNT(bi.id) AS item_count
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      LEFT JOIN bill_items bi ON b.id = bi.bill_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND b.status = ?`;
      params.push(status);
    }
    if (patientId) {
      sql += ` AND b.patient_id = ?`;
      params.push(patientId);
    }

    sql += ` GROUP BY b.id ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    return query(sql, params);
  }

  static async findById(id) {
    const billSql = `
      SELECT 
        b.id, b.invoice_number, b.patient_id, b.total_amount, b.discount_amount,
        b.tax_amount, b.net_amount, b.paid_amount, b.balance_due, b.status,
        b.due_date, b.created_at, b.updated_at,
        p.mrn AS patient_mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
        p.phone AS patient_phone, p.email AS patient_email, p.address AS patient_address
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      WHERE b.id = ?
      LIMIT 1
    `;
    const rows = await query(billSql, [id]);
    if (rows.length === 0) return null;
    const bill = rows[0];

    // Fetch line items
    const itemsSql = `
      SELECT id, bill_id, item_type, reference_id, description, quantity, unit_price, total_price
      FROM bill_items
      WHERE bill_id = ?
    `;
    bill.items = await query(itemsSql, [id]);

    // Fetch payments made
    const paySql = `
      SELECT py.id, py.receipt_number, py.amount, py.payment_method, py.transaction_reference,
             py.payment_date, py.notes, u.username AS received_by
      FROM payments py
      LEFT JOIN users u ON py.received_by_user_id = u.id
      WHERE py.bill_id = ?
      ORDER BY py.payment_date DESC
    `;
    bill.payments = await query(paySql, [id]);

    return bill;
  }

  /**
   * Create an invoice with itemized line items in an atomic transaction
   */
  static async createInvoice({ patient_id, items, discount_amount = 0, tax_amount = 0, due_date }) {
    return transaction(async (conn) => {
      const invoiceNumber = await BillingModel.generateInvoiceNumber();

      // Calculate total amounts
      let totalAmount = 0;
      for (const item of items) {
        const itemTotal = (item.quantity || 1) * parseFloat(item.unit_price || 0);
        totalAmount += itemTotal;
      }

      const discount = parseFloat(discount_amount) || 0;
      const tax = parseFloat(tax_amount) || 0;
      const netAmount = Math.max(0, totalAmount - discount + tax);
      const balanceDue = netAmount;

      // Insert into bills
      const dueDateVal = due_date ? new Date(due_date).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const billSql = `
        INSERT INTO bills 
          (invoice_number, patient_id, total_amount, discount_amount, tax_amount, net_amount, paid_amount, balance_due, status, due_date)
        VALUES (?, ?, ?, ?, ?, ?, 0.00, ?, 'unpaid', ?)
      `;
      const [billResult] = await conn.query(billSql, [
        invoiceNumber,
        patient_id,
        totalAmount,
        discount,
        tax,
        netAmount,
        balanceDue,
        dueDateVal,
      ]);
      const billId = billResult.insertId;

      // Insert line items
      for (const item of items) {
        const qty = item.quantity || 1;
        const price = parseFloat(item.unit_price || 0);
        const itemTotal = qty * price;

        await conn.query(
          `INSERT INTO bill_items (bill_id, item_type, reference_id, description, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            billId,
            item.item_type || 'consultation',
            item.reference_id || null,
            item.description,
            qty,
            price,
            itemTotal,
          ]
        );
      }

      return billId;
    });
  }

  /**
   * Record a payment and automatically recalculate balance and status
   */
  static async recordPayment({ bill_id, received_by_user_id, amount, payment_method = 'cash', transaction_reference, notes }) {
    return transaction(async (conn) => {
      const [billRows] = await conn.query(`SELECT * FROM bills WHERE id = ? FOR UPDATE`, [bill_id]);
      if (billRows.length === 0) {
        throw new Error('Invoice not found');
      }
      const bill = billRows[0];

      const payAmount = parseFloat(amount);
      if (payAmount <= 0) {
        throw new Error('Payment amount must be greater than zero');
      }
      if (payAmount > parseFloat(bill.balance_due)) {
        throw new Error(`Payment amount ($${payAmount.toFixed(2)}) exceeds outstanding balance ($${parseFloat(bill.balance_due).toFixed(2)})`);
      }

      const receiptNumber = await BillingModel.generateReceiptNumber();

      // Normalize method to enum: 'cash', 'credit_card', 'debit_card', 'bank_transfer', 'mobile_money'
      const methodMap = {
        'cash': 'cash',
        'credit card': 'credit_card',
        'credit_card': 'credit_card',
        'debit card': 'debit_card',
        'debit_card': 'debit_card',
        'bank transfer': 'bank_transfer',
        'bank_transfer': 'bank_transfer',
        'mobile money': 'mobile_money',
        'mobile_money': 'mobile_money',
      };
      const normalizedMethod = methodMap[payment_method.toLowerCase()] || 'cash';

      // Insert payment
      const paySql = `
        INSERT INTO payments (receipt_number, bill_id, received_by_user_id, amount, payment_method, transaction_reference, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [payResult] = await conn.query(paySql, [
        receiptNumber,
        bill_id,
        received_by_user_id,
        payAmount,
        normalizedMethod,
        transaction_reference || null,
        notes || null,
      ]);

      // Update bill paid_amount, balance_due and status
      const newPaid = parseFloat(bill.paid_amount) + payAmount;
      const newBalance = Math.max(0, parseFloat(bill.net_amount) - newPaid);
      const newStatus = newBalance <= 0 ? 'paid' : 'partially_paid';

      await conn.query(
        `UPDATE bills SET paid_amount = ?, balance_due = ?, status = ? WHERE id = ?`,
        [newPaid, newBalance, newStatus, bill_id]
      );

      return payResult.insertId;
    });
  }

  // --- Billable Source Lookups (Unbilled Items Helper) ---
  static async getUnbilledPatientServices(patientId) {
    // 1. Unbilled Appointments
    const apptsSql = `
      SELECT a.id, a.appointment_date, a.time_slot,
             CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
             d.specialization, d.consultation_fee
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      WHERE a.patient_id = ? AND a.status = 'completed'
      LIMIT 10
    `;
    const appointments = await query(apptsSql, [patientId]);

    // 2. Unbilled Lab Requests
    const labsSql = `
      SELECT lr.id, lr.ordered_at, lt.name AS test_name, lt.standard_cost
      FROM lab_requests lr
      JOIN lab_tests lt ON lr.test_id = lt.id
      WHERE lr.patient_id = ? AND lr.status = 'completed'
      LIMIT 10
    `;
    const labRequests = await query(labsSql, [patientId]);

    // 3. Unbilled Prescriptions
    const prescSql = `
      SELECT pi.id, pi.prescription_id, pi.quantity_prescribed,
             m.name AS medicine_name, m.unit_price,
             (pi.quantity_prescribed * m.unit_price) AS total_medicine_cost
      FROM prescription_items pi
      JOIN prescriptions pr ON pi.prescription_id = pr.id
      JOIN medicines m ON pi.medicine_id = m.id
      WHERE pr.patient_id = ? AND pr.status = 'dispensed'
      LIMIT 15
    `;
    const prescriptions = await query(prescSql, [patientId]);

    return { appointments, labRequests, prescriptions };
  }
}

module.exports = BillingModel;
