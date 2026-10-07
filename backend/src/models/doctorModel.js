const { query, transaction } = require('../config/db');

class DoctorModel {
  static async findAll({ departmentId, search, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT 
        d.id, d.employee_id, d.department_id, d.specialization,
        d.license_number, d.consultation_fee, d.room_number, d.biography,
        d.created_at,
        e.first_name, e.last_name, e.phone, e.email, e.gender,
        e.employee_code, e.status AS employee_status,
        dep.name AS department_name, dep.code AS department_code
      FROM doctors d
      JOIN employees e ON d.employee_id = e.id
      JOIN departments dep ON d.department_id = dep.id
      WHERE 1=1
    `;
    const params = [];

    if (departmentId) {
      sql += ` AND d.department_id = ?`;
      params.push(departmentId);
    }

    if (search) {
      sql += ` AND (e.first_name LIKE ? OR e.last_name LIKE ? OR d.specialization LIKE ? OR d.license_number LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY e.first_name ASC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    return query(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT 
        d.id, d.employee_id, d.department_id, d.specialization,
        d.license_number, d.consultation_fee, d.room_number, d.biography,
        d.created_at,
        e.user_id, e.first_name, e.last_name, e.phone, e.email, e.gender,
        e.employee_code, e.hire_date, e.status AS employee_status,
        dep.name AS department_name, dep.code AS department_code
      FROM doctors d
      JOIN employees e ON d.employee_id = e.id
      JOIN departments dep ON d.department_id = dep.id
      WHERE d.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async findByLicense(licenseNumber) {
    const sql = `SELECT * FROM doctors WHERE license_number = ? LIMIT 1`;
    const rows = await query(sql, [licenseNumber]);
    return rows[0] || null;
  }

  static async createWithEmployee(data) {
    return transaction(async (connection) => {
      // 1. Generate employee code: EMP-DOC-NNNN
      const [empRows] = await connection.query(
        `SELECT employee_code FROM employees WHERE employee_code LIKE 'EMP-DOC-%' ORDER BY id DESC LIMIT 1`
      );
      let nextEmpNum = 1;
      if (empRows.length > 0) {
        const parts = empRows[0].employee_code.split('-');
        nextEmpNum = parseInt(parts[2], 10) + 1;
      }
      const employeeCode = `EMP-DOC-${String(nextEmpNum).padStart(4, '0')}`;

      // 2. Insert into employees table
      const insertEmpSql = `
        INSERT INTO employees
          (user_id, department_id, employee_code, first_name, last_name, gender, phone, email, designation, hire_date, salary, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Consultant Doctor', CURDATE(), ?, 'active')
      `;
      const [empResult] = await connection.query(insertEmpSql, [
        data.user_id || null,
        data.department_id,
        employeeCode,
        data.first_name,
        data.last_name,
        data.gender || 'Male',
        data.phone,
        data.email,
        data.salary || 0.00,
      ]);
      const employeeId = empResult.insertId;

      // 3. Insert into doctors table
      const insertDocSql = `
        INSERT INTO doctors
          (employee_id, department_id, specialization, license_number, consultation_fee, room_number, biography)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [docResult] = await connection.query(insertDocSql, [
        employeeId,
        data.department_id,
        data.specialization,
        data.license_number,
        data.consultation_fee || 0.00,
        data.room_number || null,
        data.biography || null,
      ]);

      return docResult.insertId;
    });
  }

  static async update(id, data) {
    return transaction(async (connection) => {
      // Find doctor and employee id
      const [docRows] = await connection.query(`SELECT employee_id FROM doctors WHERE id = ?`, [id]);
      if (docRows.length === 0) return null;
      const employeeId = docRows[0].employee_id;

      // Update employee fields if provided
      const empUpdates = [];
      const empParams = [];
      if (data.first_name !== undefined) { empUpdates.push('first_name = ?'); empParams.push(data.first_name); }
      if (data.last_name !== undefined) { empUpdates.push('last_name = ?'); empParams.push(data.last_name); }
      if (data.phone !== undefined) { empUpdates.push('phone = ?'); empParams.push(data.phone); }
      if (data.email !== undefined) { empUpdates.push('email = ?'); empParams.push(data.email); }
      if (data.department_id !== undefined) { empUpdates.push('department_id = ?'); empParams.push(data.department_id); }
      if (data.gender !== undefined) { empUpdates.push('gender = ?'); empParams.push(data.gender); }

      if (empUpdates.length > 0) {
        empParams.push(employeeId);
        await connection.query(`UPDATE employees SET ${empUpdates.join(', ')} WHERE id = ?`, empParams);
      }

      // Update doctor fields
      const docUpdates = [];
      const docParams = [];
      if (data.department_id !== undefined) { docUpdates.push('department_id = ?'); docParams.push(data.department_id); }
      if (data.specialization !== undefined) { docUpdates.push('specialization = ?'); docParams.push(data.specialization); }
      if (data.license_number !== undefined) { docUpdates.push('license_number = ?'); docParams.push(data.license_number); }
      if (data.consultation_fee !== undefined) { docUpdates.push('consultation_fee = ?'); docParams.push(data.consultation_fee); }
      if (data.room_number !== undefined) { docUpdates.push('room_number = ?'); docParams.push(data.room_number); }
      if (data.biography !== undefined) { docUpdates.push('biography = ?'); docParams.push(data.biography); }

      if (docUpdates.length > 0) {
        docParams.push(id);
        await connection.query(`UPDATE doctors SET ${docUpdates.join(', ')} WHERE id = ?`, docParams);
      }

      return true;
    });
  }

  // --- Schedules ---
  static async getSchedules(doctorId) {
    const sql = `
      SELECT id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients, is_active
      FROM doctor_schedules
      WHERE doctor_id = ?
      ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), start_time ASC
    `;
    return query(sql, [doctorId]);
  }

  static async addSchedule(doctorId, { day_of_week, start_time, end_time, slot_duration_minutes = 15, max_patients = 20, is_active = true }) {
    const sql = `
      INSERT INTO doctor_schedules
        (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      doctorId, day_of_week, start_time, end_time, slot_duration_minutes, max_patients, is_active
    ]);
    return result.insertId;
  }

  static async deleteSchedule(scheduleId, doctorId) {
    const sql = `DELETE FROM doctor_schedules WHERE id = ? AND doctor_id = ?`;
    return query(sql, [scheduleId, doctorId]);
  }
}

module.exports = DoctorModel;
