const { query, transaction } = require('../config/db');

class PharmacyModel {
  // --- Inventory & Stock Overview ---
  static async findAllMedicines({ search, category, lowStockOnly = false } = {}) {
    let sql = `
      SELECT 
        m.id, m.name, m.generic_name, m.category, m.dosage_form, m.strength,
        m.unit_price, m.reorder_level, m.created_at,
        COALESCE(SUM(b.quantity_available), 0) AS total_stock,
        COUNT(b.id) AS batch_count
      FROM medicines m
      LEFT JOIN medicine_batches b ON m.id = b.medicine_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (m.name LIKE ? OR m.generic_name LIKE ? OR m.category LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (category) {
      sql += ` AND m.category = ?`;
      params.push(category);
    }

    sql += ` GROUP BY m.id`;

    if (lowStockOnly) {
      sql += ` HAVING total_stock <= m.reorder_level`;
    }

    sql += ` ORDER BY m.name ASC`;
    return query(sql, params);
  }

  static async findMedicineById(id) {
    const sql = `
      SELECT 
        m.*,
        COALESCE(SUM(b.quantity_available), 0) AS total_stock
      FROM medicines m
      LEFT JOIN medicine_batches b ON m.id = b.medicine_id
      WHERE m.id = ?
      GROUP BY m.id
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async createMedicine({ name, generic_name, category, dosage_form, strength, unit_price, reorder_level = 50 }) {
    const sql = `
      INSERT INTO medicines (name, generic_name, category, dosage_form, strength, unit_price, reorder_level)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      name,
      generic_name || null,
      category,
      dosage_form,
      strength || null,
      unit_price || 0.00,
      reorder_level,
    ]);
    return result.insertId;
  }

  static async updateMedicine(id, data) {
    const fields = ['name', 'generic_name', 'category', 'dosage_form', 'strength', 'unit_price', 'reorder_level'];
    const updates = [];
    const params = [];

    fields.forEach((f) => {
      if (data[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(data[f]);
      }
    });

    if (updates.length === 0) return null;
    params.push(id);
    const sql = `UPDATE medicines SET ${updates.join(', ')} WHERE id = ?`;
    return query(sql, params);
  }

  // --- Medicine Batches (Stock Inflow & Expiry Tracking) ---
  static async getBatches(medicineId) {
    const sql = `
      SELECT id, medicine_id, batch_number, expiry_date, quantity_received, quantity_available, unit_cost, created_at,
             DATEDIFF(expiry_date, CURDATE()) AS days_to_expiry
      FROM medicine_batches
      WHERE medicine_id = ?
      ORDER BY expiry_date ASC
    `;
    return query(sql, [medicineId]);
  }

  static async addBatch({ medicine_id, batch_number, expiry_date, initial_quantity, purchase_price = 0.00 }) {
    const sql = `
      INSERT INTO medicine_batches 
        (medicine_id, batch_number, expiry_date, quantity_received, quantity_available, unit_cost)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      medicine_id,
      batch_number.toUpperCase(),
      expiry_date,
      initial_quantity,
      initial_quantity,
      purchase_price,
    ]);
    return result.insertId;
  }

  // Expiring Batches Alert (< 90 days)
  static async getExpiringBatches(days = 90) {
    const sql = `
      SELECT 
        b.id, b.batch_number, b.expiry_date, b.quantity_available,
        DATEDIFF(b.expiry_date, CURDATE()) AS days_left,
        m.id AS medicine_id, m.name AS medicine_name, m.generic_name, m.dosage_form
      FROM medicine_batches b
      JOIN medicines m ON b.medicine_id = m.id
      WHERE b.quantity_available > 0 AND DATEDIFF(b.expiry_date, CURDATE()) <= ?
      ORDER BY b.expiry_date ASC
    `;
    return query(sql, [days]);
  }

  // --- Prescriptions Queue & Dispensing ---
  static async getPrescriptionsQueue({ status, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT 
        pr.id, pr.medical_record_id, pr.patient_id, pr.doctor_id, pr.notes, pr.status, pr.created_at,
        p.mrn AS patient_mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
        p.gender AS patient_gender, p.blood_group,
        TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) AS patient_age,
        CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
        d.specialization AS doctor_specialization,
        COUNT(pi.id) AS total_items
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN doctors d ON pr.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      LEFT JOIN prescription_items pi ON pr.id = pi.prescription_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND pr.status = ?`;
      params.push(status);
    }

    sql += ` GROUP BY pr.id ORDER BY pr.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    return query(sql, params);
  }

  static async getPrescriptionDetail(prescriptionId) {
    const prescSql = `
      SELECT 
        pr.id, pr.medical_record_id, pr.patient_id, pr.doctor_id, pr.notes, pr.status, pr.created_at,
        p.mrn AS patient_mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
        p.gender AS patient_gender, p.blood_group, p.allergies,
        TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) AS patient_age,
        CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
        d.specialization AS doctor_specialization
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN doctors d ON pr.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      WHERE pr.id = ?
      LIMIT 1
    `;
    const rows = await query(prescSql, [prescriptionId]);
    if (rows.length === 0) return null;
    const prescription = rows[0];

    const itemsSql = `
      SELECT 
        pi.id, pi.prescription_id, pi.medicine_id, pi.dosage, pi.frequency,
        pi.duration_days, pi.quantity_prescribed, pi.quantity_dispensed, pi.instructions,
        m.name AS medicine_name, m.generic_name, m.dosage_form, m.strength, m.unit_price,
        COALESCE((SELECT SUM(b.quantity_available) FROM medicine_batches b WHERE b.medicine_id = m.id), 0) AS available_stock
      FROM prescription_items pi
      JOIN medicines m ON pi.medicine_id = m.id
      WHERE pi.prescription_id = ?
    `;
    prescription.items = await query(itemsSql, [prescription.id]);
    return prescription;
  }

  /**
   * Dispense a prescription atomically:
   * 1. Check stock for each line item
   * 2. Deduct from oldest available unexpired batch (FEFO)
   * 3. Update quantity_dispensed in prescription_items
   * 4. Mark prescription as 'dispensed'
   */
  static async dispensePrescription(prescriptionId) {
    return transaction(async (conn) => {
      // 1. Fetch prescription items
      const [items] = await conn.query(
        `SELECT id, medicine_id, quantity_prescribed FROM prescription_items WHERE prescription_id = ?`,
        [prescriptionId]
      );

      if (items.length === 0) {
        throw new Error('Prescription contains no items to dispense');
      }

      for (const item of items) {
        let remainingToDeduct = item.quantity_prescribed;

        // Fetch batches for this medicine sorted by expiry date ascending (FEFO)
        const [batches] = await conn.query(
          `SELECT id, batch_number, quantity_available, expiry_date 
           FROM medicine_batches 
           WHERE medicine_id = ? AND quantity_available > 0 
           ORDER BY expiry_date ASC`,
          [item.medicine_id]
        );

        const totalAvailable = batches.reduce((sum, b) => sum + b.quantity_available, 0);
        if (totalAvailable < remainingToDeduct) {
          const [med] = await conn.query(`SELECT name FROM medicines WHERE id = ?`, [item.medicine_id]);
          const medName = med[0]?.name || `Medicine ID ${item.medicine_id}`;
          throw new Error(`Insufficient stock for ${medName}. Required: ${remainingToDeduct}, Available: ${totalAvailable}`);
        }

        // Deduct across batches
        for (const batch of batches) {
          if (remainingToDeduct <= 0) break;

          const deductAmount = Math.min(batch.quantity_available, remainingToDeduct);
          await conn.query(
            `UPDATE medicine_batches SET quantity_available = quantity_available - ? WHERE id = ?`,
            [deductAmount, batch.id]
          );
          remainingToDeduct -= deductAmount;
        }

        // Update item dispensed quantity
        await conn.query(
          `UPDATE prescription_items SET quantity_dispensed = ? WHERE id = ?`,
          [item.quantity_prescribed, item.id]
        );
      }

      // Mark prescription as dispensed
      await conn.query(
        `UPDATE prescriptions SET status = 'dispensed' WHERE id = ?`,
        [prescriptionId]
      );

      return true;
    });
  }
}

module.exports = PharmacyModel;
