const { query } = require('../config/db');

class ReportModel {
  /**
   * 1. Operational & Executive Summary / Dashboard KPIs
   */
  static async getExecutiveSummary() {
    const today = new Date().toISOString().split('T')[0];

    // Patients census
    const [patientStats] = await query(`
      SELECT 
        COUNT(*) AS total_patients,
        SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS male_count,
        SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) AS female_count,
        SUM(CASE WHEN DATE(created_at) = ? THEN 1 ELSE 0 END) AS registered_today
      FROM patients
    `, [today]);

    // Appointments summary
    const [apptStats] = await query(`
      SELECT 
        COUNT(*) AS total_appointments,
        SUM(CASE WHEN appointment_date = ? THEN 1 ELSE 0 END) AS appointments_today,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count
      FROM appointments
    `, [today]);

    // Billing & Revenue summary
    const [revenueStats] = await query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) AS total_billed,
        COALESCE(SUM(paid_amount), 0) AS total_collected,
        COALESCE(SUM(balance_due), 0) AS outstanding_balance,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_invoices_count,
        SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid_invoices_count
      FROM bills
    `);

    // Lab requisitions status
    const [labStats] = await query(`
      SELECT 
        COUNT(*) AS total_lab_orders,
        SUM(CASE WHEN status = 'ordered' THEN 1 ELSE 0 END) AS pending_collection,
        SUM(CASE WHEN status = 'sample_collected' THEN 1 ELSE 0 END) AS processing_samples,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_tests
      FROM lab_requests
    `);

    // Pharmacy inventory overview
    const [pharmacyStats] = await query(`
      SELECT 
        (SELECT COUNT(*) FROM medicines) AS total_medicines,
        COALESCE((SELECT SUM(quantity_available) FROM medicine_batches), 0) AS total_units_in_stock,
        (SELECT COUNT(*) FROM medicine_batches WHERE quantity_available <= 20) AS low_stock_batches,
        (SELECT COUNT(*) FROM medicine_batches WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 60 DAY)) AS expiring_soon_batches
    `);

    // Staff headcount & attendance today
    const [staffStats] = await query(`
      SELECT 
        (SELECT COUNT(*) FROM employees WHERE status = 'active') AS active_staff,
        (SELECT COUNT(*) FROM attendance WHERE date = ? AND status = 'present') AS present_today,
        (SELECT COUNT(*) FROM leave_records WHERE status = 'approved' AND ? BETWEEN start_date AND end_date) AS on_leave_today
    `, [today, today]);

    return {
      patients: patientStats,
      appointments: apptStats,
      revenue: revenueStats,
      laboratory: labStats,
      pharmacy: pharmacyStats,
      staff: staffStats,
    };
  }

  /**
   * 2. Financial & Revenue Report (Daily, Monthly, Payment Methods breakdown)
   */
  static async getFinancialReport({ startDate, endDate } = {}) {
    let whereBills = '1=1';
    let wherePayments = '1=1';
    const paramsBills = [];
    const paramsPayments = [];

    if (startDate) {
      whereBills += ' AND DATE(created_at) >= ?';
      wherePayments += ' AND DATE(payment_date) >= ?';
      paramsBills.push(startDate);
      paramsPayments.push(startDate);
    }
    if (endDate) {
      whereBills += ' AND DATE(created_at) <= ?';
      wherePayments += ' AND DATE(payment_date) <= ?';
      paramsBills.push(endDate);
      paramsPayments.push(endDate);
    }

    // Revenue by day trend
    const revenueTrend = await query(`
      SELECT 
        DATE(payment_date) AS date,
        COUNT(id) AS transaction_count,
        COALESCE(SUM(amount), 0) AS total_received
      FROM payments
      WHERE ${wherePayments}
      GROUP BY DATE(payment_date)
      ORDER BY date ASC
    `, paramsPayments);

    // Revenue by payment method
    const paymentMethods = await query(`
      SELECT 
        payment_method,
        COUNT(id) AS count,
        COALESCE(SUM(amount), 0) AS total_amount
      FROM payments
      WHERE ${wherePayments}
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `, paramsPayments);

    // Revenue by service item type from bill_items
    const serviceRevenue = await query(`
      SELECT 
        item_type,
        COUNT(id) AS count,
        COALESCE(SUM(total_price), 0) AS total_amount
      FROM bill_items
      GROUP BY item_type
      ORDER BY total_amount DESC
    `);

    // Invoices aging / status breakdown
    const invoiceStatusBreakdown = await query(`
      SELECT 
        status,
        COUNT(id) AS count,
        COALESCE(SUM(total_amount), 0) AS total_amount,
        COALESCE(SUM(balance_due), 0) AS total_balance_due
      FROM bills
      WHERE ${whereBills}
      GROUP BY status
    `, paramsBills);

    return {
      revenueTrend,
      paymentMethods,
      serviceRevenue,
      invoiceStatusBreakdown,
    };
  }

  /**
   * 3. Patient Demographics & Admissions Census Report
   */
  static async getPatientReport() {
    // Patients by age bracket
    const ageDemographics = await query(`
      SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) < 18 THEN 'Pediatric (<18)'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 18 AND 40 THEN 'Young Adult (18-40)'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 41 AND 65 THEN 'Middle Age (41-65)'
          ELSE 'Senior (65+)'
        END AS age_group,
        COUNT(*) AS count
      FROM patients
      GROUP BY age_group
      ORDER BY count DESC
    `);

    // Patients by blood group
    const bloodGroupDistribution = await query(`
      SELECT 
        COALESCE(blood_group, 'Unknown') AS blood_group,
        COUNT(*) AS count
      FROM patients
      GROUP BY blood_group
      ORDER BY count DESC
    `);

    // Top diagnoses from medical records
    const topDiagnoses = await query(`
      SELECT 
        diagnosis,
        COUNT(*) AS occurrences
      FROM medical_records
      WHERE diagnosis IS NOT NULL AND diagnosis != ''
      GROUP BY diagnosis
      ORDER BY occurrences DESC
      LIMIT 10
    `);

    // New patient registrations over last 6 months
    const registrationsTrend = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS new_patients
      FROM patients
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    return {
      ageDemographics,
      bloodGroupDistribution,
      topDiagnoses,
      registrationsTrend,
    };
  }

  /**
   * 4. Laboratory Diagnostics Report
   */
  static async getLaboratoryReport() {
    // Tests by volume & catalog popularity
    const testVolumes = await query(`
      SELECT 
        lt.name AS test_name,
        lt.category,
        COUNT(lr.id) AS test_count,
        SUM(CASE WHEN lr.status = 'completed' THEN 1 ELSE 0 END) AS completed_count
      FROM lab_requests lr
      JOIN lab_tests lt ON lr.test_id = lt.id
      GROUP BY lt.id, lt.name, lt.category
      ORDER BY test_count DESC
    `);

    // Abnormal test result rates
    const abnormalRates = await query(`
      SELECT 
        COUNT(*) AS total_results,
        SUM(CASE WHEN is_abnormal = 1 THEN 1 ELSE 0 END) AS abnormal_count,
        ROUND((SUM(CASE WHEN is_abnormal = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS abnormal_percentage
      FROM lab_results
    `);

    return {
      testVolumes,
      abnormalRates: abnormalRates[0] || { total_results: 0, abnormal_count: 0, abnormal_percentage: 0 },
    };
  }

  /**
   * 5. Pharmacy & Formulary Inventory Report
   */
  static async getPharmacyReport() {
    // Low stock warnings
    const lowStockAlerts = await query(`
      SELECT 
        m.name AS medicine_name,
        m.category,
        m.dosage_form,
        b.batch_number,
        b.quantity_available,
        b.expiry_date
      FROM medicine_batches b
      JOIN medicines m ON b.medicine_id = m.id
      WHERE b.quantity_available <= 50
      ORDER BY b.quantity_available ASC
      LIMIT 20
    `);

    // Expiring within 90 days
    const expiringBatches = await query(`
      SELECT 
        m.name AS medicine_name,
        m.dosage_form,
        b.batch_number,
        b.quantity_available,
        b.expiry_date,
        DATEDIFF(b.expiry_date, CURDATE()) AS days_until_expiry
      FROM medicine_batches b
      JOIN medicines m ON b.medicine_id = m.id
      WHERE b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)
      ORDER BY b.expiry_date ASC
      LIMIT 20
    `);

    // Top prescribed medicines
    const topPrescribed = await query(`
      SELECT 
        m.name AS medicine_name,
        COUNT(pi.id) AS prescription_lines_count,
        SUM(pi.quantity_prescribed) AS total_units_prescribed
      FROM prescription_items pi
      JOIN medicines m ON pi.medicine_id = m.id
      GROUP BY m.id, m.name
      ORDER BY total_units_prescribed DESC
      LIMIT 10
    `);

    return {
      lowStockAlerts,
      expiringBatches,
      topPrescribed,
    };
  }

  /**
   * 6. Appointments & Doctor Clinical Utilization
   */
  static async getAppointmentsReport({ startDate, endDate } = {}) {
    let whereClause = '1=1';
    const params = [];
    if (startDate) {
      whereClause += ' AND a.appointment_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND a.appointment_date <= ?';
      params.push(endDate);
    }

    // Appointment volume by doctor
    const doctorUtilization = await query(`
      SELECT 
        d.id AS doctor_id,
        CONCAT('Dr. ', e.first_name, ' ', e.last_name) AS doctor_name,
        dep.name AS department_name,
        COUNT(a.id) AS total_appointments,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
        SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count
      FROM doctors d
      JOIN employees e ON d.employee_id = e.id
      JOIN departments dep ON d.department_id = dep.id
      LEFT JOIN appointments a ON d.id = a.doctor_id AND ${whereClause}
      GROUP BY d.id, doctor_name, dep.name
      ORDER BY total_appointments DESC
    `, params);

    // Appointments by status
    const statusDistribution = await query(`
      SELECT 
        a.status,
        COUNT(a.id) AS count
      FROM appointments a
      WHERE ${whereClause}
      GROUP BY a.status
    `, params);

    return {
      doctorUtilization,
      statusDistribution,
    };
  }

  /**
   * 7. Staff, Attendance & HR Report
   */
  static async getStaffReport() {
    // Headcount by department & designation
    const departmentBreakdown = await query(`
      SELECT 
        d.id AS department_id,
        d.name AS department_name,
        COUNT(e.id) AS total_employees,
        SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS active_employees,
        COALESCE(AVG(e.salary), 0) AS avg_salary,
        COALESCE(SUM(e.salary), 0) AS total_payroll
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id, d.name
      ORDER BY total_employees DESC
    `);

    // Today's attendance roster summary
    const today = new Date().toISOString().split('T')[0];
    const attendanceSummary = await query(`
      SELECT 
        status AS attendance_status,
        COUNT(*) AS count
      FROM attendance
      WHERE date = ?
      GROUP BY status
    `, [today]);

    // Leave requests summary by status
    const leaveSummary = await query(`
      SELECT 
        status,
        COUNT(*) AS count
      FROM leave_records
      GROUP BY status
    `);

    return {
      departmentBreakdown,
      attendanceSummary,
      leaveSummary,
    };
  }
}

module.exports = ReportModel;
