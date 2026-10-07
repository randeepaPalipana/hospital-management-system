const { query, transaction } = require('../config/db');

class MedicalRecordModel {
  static async findAll({ patientId, doctorId, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT 
        mr.id, mr.patient_id, mr.doctor_id, mr.appointment_id, mr.encounter_date,
        mr.chief_complaint, mr.vitals_bp, mr.vitals_pulse, mr.vitals_temp_c,
        mr.vitals_spo2, mr.vitals_weight_kg, mr.examination_notes, mr.diagnosis,
        mr.treatment_plan, mr.created_at,
        p.mrn AS patient_mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
        p.gender AS patient_gender, p.blood_group,
        TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) AS patient_age,
        CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
        d.specialization AS doctor_specialization,
        dep.name AS department_name,
        pr.id AS prescription_id, pr.status AS prescription_status
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN doctors d ON mr.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      JOIN departments dep ON d.department_id = dep.id
      LEFT JOIN prescriptions pr ON mr.id = pr.medical_record_id
      WHERE 1=1
    `;
    const params = [];

    if (patientId) {
      sql += ` AND mr.patient_id = ?`;
      params.push(patientId);
    }
    if (doctorId) {
      sql += ` AND mr.doctor_id = ?`;
      params.push(doctorId);
    }

    sql += ` ORDER BY mr.encounter_date DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    return query(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT 
        mr.id, mr.patient_id, mr.doctor_id, mr.appointment_id, mr.encounter_date,
        mr.chief_complaint, mr.vitals_bp, mr.vitals_pulse, mr.vitals_temp_c,
        mr.vitals_spo2, mr.vitals_weight_kg, mr.examination_notes, mr.diagnosis,
        mr.treatment_plan, mr.created_at,
        p.mrn AS patient_mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
        p.dob AS patient_dob, p.gender AS patient_gender, p.blood_group, p.allergies,
        TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) AS patient_age,
        CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
        d.specialization AS doctor_specialization,
        dep.name AS department_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN doctors d ON mr.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      JOIN departments dep ON d.department_id = dep.id
      WHERE mr.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Create an EMR record with optional prescriptions in an atomic transaction
   */
  static async createWithPrescription(data) {
    return transaction(async (conn) => {
      // 1. Insert medical record
      const recordSql = `
        INSERT INTO medical_records
          (patient_id, doctor_id, appointment_id, encounter_date, chief_complaint,
           vitals_bp, vitals_pulse, vitals_temp_c, vitals_spo2, vitals_weight_kg,
           examination_notes, diagnosis, treatment_plan)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [recordResult] = await conn.query(recordSql, [
        data.patient_id,
        data.doctor_id,
        data.appointment_id || null,
        data.encounter_date || new Date(),
        data.chief_complaint,
        data.vitals_bp || null,
        data.vitals_pulse || null,
        data.vitals_temp_c || null,
        data.vitals_spo2 || null,
        data.vitals_weight_kg || null,
        data.examination_notes || null,
        data.diagnosis,
        data.treatment_plan || null,
      ]);
      const recordId = recordResult.insertId;

      // 2. If appointment_id is supplied, update appointment status to 'completed'
      if (data.appointment_id) {
        await conn.query(
          `UPDATE appointments SET status = 'completed', notes = ? WHERE id = ?`,
          [data.diagnosis ? `Completed: ${data.diagnosis}` : 'Completed', data.appointment_id]
        );
      }

      // 3. Insert prescription if items are provided
      let prescriptionId = null;
      if (data.prescription_items && data.prescription_items.length > 0) {
        const prescSql = `
          INSERT INTO prescriptions (medical_record_id, patient_id, doctor_id, notes, status)
          VALUES (?, ?, ?, ?, 'pending')
        `;
        const [prescResult] = await conn.query(prescSql, [
          recordId,
          data.patient_id,
          data.doctor_id,
          data.prescription_notes || null,
        ]);
        prescriptionId = prescResult.insertId;

        // Insert line items
        for (const item of data.prescription_items) {
          await conn.query(
            `INSERT INTO prescription_items
              (prescription_id, medicine_id, dosage, frequency, duration_days, quantity_prescribed, instructions)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              prescriptionId,
              item.medicine_id,
              item.dosage,
              item.frequency,
              item.duration_days || 5,
              item.quantity_prescribed || 1,
              item.instructions || null,
            ]
          );
        }
      }

      return { recordId, prescriptionId };
    });
  }

  // --- Prescriptions & Items Queries ---
  static async getPrescriptionByRecordId(medicalRecordId) {
    const prescSql = `
      SELECT 
        pr.id, pr.medical_record_id, pr.patient_id, pr.doctor_id, pr.notes, pr.status, pr.created_at,
        p.mrn AS patient_mrn, CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        CONCAT(e.first_name, ' ', e.last_name) AS doctor_name, d.specialization AS doctor_specialization
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN doctors d ON pr.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      WHERE pr.medical_record_id = ?
      LIMIT 1
    `;
    const prescRows = await query(prescSql, [medicalRecordId]);
    if (prescRows.length === 0) return null;
    const prescription = prescRows[0];

    const itemsSql = `
      SELECT 
        pi.id, pi.prescription_id, pi.medicine_id, pi.dosage, pi.frequency,
        pi.duration_days, pi.quantity_prescribed, pi.quantity_dispensed, pi.instructions,
        m.name AS medicine_name, m.generic_name, m.dosage_form, m.strength, m.unit_price
      FROM prescription_items pi
      JOIN medicines m ON pi.medicine_id = m.id
      WHERE pi.prescription_id = ?
    `;
    prescription.items = await query(itemsSql, [prescription.id]);
    return prescription;
  }

  static async getPrescriptionById(prescriptionId) {
    const prescSql = `
      SELECT 
        pr.id, pr.medical_record_id, pr.patient_id, pr.doctor_id, pr.notes, pr.status, pr.created_at,
        p.mrn AS patient_mrn, CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        CONCAT(e.first_name, ' ', e.last_name) AS doctor_name, d.specialization AS doctor_specialization
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN doctors d ON pr.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      WHERE pr.id = ?
      LIMIT 1
    `;
    const prescRows = await query(prescSql, [prescriptionId]);
    if (prescRows.length === 0) return null;
    const prescription = prescRows[0];

    const itemsSql = `
      SELECT 
        pi.id, pi.prescription_id, pi.medicine_id, pi.dosage, pi.frequency,
        pi.duration_days, pi.quantity_prescribed, pi.quantity_dispensed, pi.instructions,
        m.name AS medicine_name, m.generic_name, m.dosage_form, m.strength, m.unit_price
      FROM prescription_items pi
      JOIN medicines m ON pi.medicine_id = m.id
      WHERE pi.prescription_id = ?
    `;
    prescription.items = await query(itemsSql, [prescription.id]);
    return prescription;
  }

  static async updatePrescriptionStatus(prescriptionId, status) {
    const sql = `UPDATE prescriptions SET status = ? WHERE id = ?`;
    return query(sql, [status, prescriptionId]);
  }
}

module.exports = MedicalRecordModel;
