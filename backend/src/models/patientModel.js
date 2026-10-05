const { query, transaction } = require('../config/db');

class PatientModel {
  /**
   * Generate a unique Medical Record Number: HOSP-YYYY-NNNNN
   */
  static async generateMRN() {
    const year = new Date().getFullYear();
    const prefix = `HOSP-${year}-`;
    const sql = `
      SELECT mrn FROM patients 
      WHERE mrn LIKE ? 
      ORDER BY id DESC 
      LIMIT 1
    `;
    const rows = await query(sql, [`${prefix}%`]);
    let nextNum = 1;
    if (rows.length > 0) {
      const lastMRN = rows[0].mrn; // e.g. HOSP-2026-00042
      const lastNum = parseInt(lastMRN.split('-')[2], 10);
      nextNum = lastNum + 1;
    }
    return `${prefix}${String(nextNum).padStart(5, '0')}`;
  }

  /**
   * Create a new patient record
   */
  static async create(data) {
    const mrn = await PatientModel.generateMRN();
    const sql = `
      INSERT INTO patients 
        (mrn, first_name, last_name, dob, gender, blood_group, phone, email,
         address, emergency_contact_name, emergency_contact_phone, 
         emergency_contact_relation, allergies)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      mrn,
      data.first_name,
      data.last_name,
      data.dob,
      data.gender,
      data.blood_group || 'Unknown',
      data.phone,
      data.email || null,
      data.address || null,
      data.emergency_contact_name || null,
      data.emergency_contact_phone || null,
      data.emergency_contact_relation || null,
      data.allergies || null,
    ]);
    return { insertId: result.insertId, mrn };
  }

  /**
   * Find patient by ID (full profile)
   */
  static async findById(id) {
    const sql = `
      SELECT 
        p.*,
        TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) AS age
      FROM patients p
      WHERE p.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Find patient by MRN
   */
  static async findByMRN(mrn) {
    const sql = `SELECT * FROM patients WHERE mrn = ? LIMIT 1`;
    const rows = await query(sql, [mrn]);
    return rows[0] || null;
  }

  /**
   * Search and list patients with pagination
   */
  static async findAll({ search, gender, limit = 20, offset = 0 } = {}) {
    let sql = `
      SELECT 
        id, mrn, first_name, last_name, gender, dob,
        TIMESTAMPDIFF(YEAR, dob, CURDATE()) AS age,
        blood_group, phone, email, created_at
      FROM patients
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (mrn LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    if (gender) {
      sql += ` AND gender = ?`;
      params.push(gender);
    }

    sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    return query(sql, params);
  }

  /**
   * Count total patients (with filters)
   */
  static async countAll({ search, gender } = {}) {
    let sql = `SELECT COUNT(*) AS total FROM patients WHERE 1=1`;
    const params = [];

    if (search) {
      sql += ` AND (mrn LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    if (gender) {
      sql += ` AND gender = ?`;
      params.push(gender);
    }

    const rows = await query(sql, params);
    return rows[0]?.total || 0;
  }

  /**
   * Update patient record
   */
  static async update(id, data) {
    const fields = [
      'first_name', 'last_name', 'dob', 'gender', 'blood_group',
      'phone', 'email', 'address',
      'emergency_contact_name', 'emergency_contact_phone',
      'emergency_contact_relation', 'allergies',
    ];
    const updates = [];
    const params = [];

    fields.forEach((field) => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
    });

    if (updates.length === 0) return null;

    params.push(id);
    const sql = `UPDATE patients SET ${updates.join(', ')} WHERE id = ?`;
    return query(sql, params);
  }

  /**
   * Get patient's appointment history (summary)
   */
  static async getAppointmentHistory(patientId) {
    const sql = `
      SELECT 
        a.id, a.appointment_date, a.time_slot, a.status, a.reason_for_visit,
        CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
        d.specialization,
        dep.name AS department
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      JOIN departments dep ON d.department_id = dep.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC
      LIMIT 20
    `;
    return query(sql, [patientId]);
  }

  /**
   * Get patient's medical records summary
   */
  static async getMedicalHistory(patientId) {
    const sql = `
      SELECT 
        mr.id, mr.encounter_date, mr.chief_complaint, mr.diagnosis,
        mr.vitals_bp, mr.vitals_pulse, mr.vitals_temp_c, mr.vitals_weight_kg,
        CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
        d.specialization
      FROM medical_records mr
      JOIN doctors d ON mr.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      WHERE mr.patient_id = ?
      ORDER BY mr.encounter_date DESC
      LIMIT 20
    `;
    return query(sql, [patientId]);
  }
}

module.exports = PatientModel;
