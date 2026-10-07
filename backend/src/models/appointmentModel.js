const { query } = require('../config/db');

class AppointmentModel {
  static async findAll({ doctorId, patientId, date, status, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT 
        a.id, a.patient_id, a.doctor_id, a.appointment_date, a.time_slot,
        a.status, a.reason_for_visit, a.notes, a.created_at, a.updated_at,
        p.mrn AS patient_mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
        p.phone AS patient_phone, p.gender AS patient_gender,
        CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
        d.specialization AS doctor_specialization, d.consultation_fee, d.room_number,
        dep.name AS department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      JOIN departments dep ON d.department_id = dep.id
      WHERE 1=1
    `;
    const params = [];

    if (doctorId) {
      sql += ` AND a.doctor_id = ?`;
      params.push(doctorId);
    }
    if (patientId) {
      sql += ` AND a.patient_id = ?`;
      params.push(patientId);
    }
    if (date) {
      sql += ` AND a.appointment_date = ?`;
      params.push(date);
    }
    if (status) {
      sql += ` AND a.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY a.appointment_date ASC, a.time_slot ASC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    return query(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT 
        a.id, a.patient_id, a.doctor_id, a.appointment_date, a.time_slot,
        a.status, a.reason_for_visit, a.notes, a.created_at, a.updated_at,
        p.mrn AS patient_mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
        p.phone AS patient_phone, p.email AS patient_email, p.gender AS patient_gender,
        CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
        d.specialization AS doctor_specialization, d.consultation_fee, d.room_number,
        dep.name AS department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      JOIN departments dep ON d.department_id = dep.id
      WHERE a.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async checkConflict(doctorId, date, timeSlot, excludeId = null) {
    let sql = `
      SELECT id FROM appointments 
      WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? 
        AND status IN ('scheduled')
    `;
    const params = [doctorId, date, timeSlot];
    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }
    const rows = await query(sql, params);
    return rows.length > 0;
  }

  static async create({ patient_id, doctor_id, appointment_date, time_slot, reason_for_visit, notes }) {
    const sql = `
      INSERT INTO appointments 
        (patient_id, doctor_id, appointment_date, time_slot, status, reason_for_visit, notes)
      VALUES (?, ?, ?, ?, 'scheduled', ?, ?)
    `;
    const result = await query(sql, [
      patient_id,
      doctor_id,
      appointment_date,
      time_slot,
      reason_for_visit || null,
      notes || null,
    ]);
    return result.insertId;
  }

  static async updateStatus(id, status, notes = null) {
    const updates = ['status = ?'];
    const params = [status];
    if (notes !== null) {
      updates.push('notes = ?');
      params.push(notes);
    }
    params.push(id);
    const sql = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`;
    return query(sql, params);
  }

  static async reschedule(id, { appointment_date, time_slot, notes }) {
    const updates = ['appointment_date = ?', 'time_slot = ?', "status = 'scheduled'"];
    const params = [appointment_date, time_slot];
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    params.push(id);
    const sql = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`;
    return query(sql, params);
  }

  static async getDoctorDaySchedule(doctorId, date) {
    const sql = `
      SELECT time_slot, status
      FROM appointments
      WHERE doctor_id = ? AND appointment_date = ? AND status = 'scheduled'
    `;
    return query(sql, [doctorId, date]);
  }
}

module.exports = AppointmentModel;
