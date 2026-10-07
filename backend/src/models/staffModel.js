const { query, transaction } = require('../config/db');

class StaffModel {
  /**
   * Generate employee code: EMP-YYYY-NNNN
   */
  static async generateEmployeeCode() {
    const year = new Date().getFullYear();
    const prefix = `EMP-${year}-`;
    const sql = `SELECT employee_code FROM employees WHERE employee_code LIKE ? ORDER BY id DESC LIMIT 1`;
    const rows = await query(sql, [`${prefix}%`]);
    let nextNum = 1;
    if (rows.length > 0) {
      const last = rows[0].employee_code;
      nextNum = parseInt(last.split('-')[2], 10) + 1;
    }
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  }

  // --- Employees Management ---
  static async findAllEmployees({ departmentId, status, search, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT 
        e.id, e.user_id, e.department_id, e.employee_code, e.first_name, e.last_name,
        e.gender, e.phone, e.email, e.designation, e.hire_date, e.salary, e.status, e.created_at,
        d.name AS department_name, d.code AS department_code,
        u.username, r.name AS role_name
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (departmentId) {
      sql += ` AND e.department_id = ?`;
      params.push(departmentId);
    }
    if (status) {
      sql += ` AND e.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_code LIKE ? OR e.designation LIKE ? OR e.email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    sql += ` ORDER BY e.first_name ASC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    return query(sql, params);
  }

  static async findEmployeeById(id) {
    const sql = `
      SELECT 
        e.id, e.user_id, e.department_id, e.employee_code, e.first_name, e.last_name,
        e.gender, e.phone, e.email, e.designation, e.hire_date, e.salary, e.status, e.created_at,
        d.name AS department_name, d.code AS department_code,
        u.username, r.name AS role_name
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE e.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async createEmployee({
    user_id, department_id, first_name, last_name, gender, phone, email,
    designation, hire_date, salary = 0.00, status = 'active'
  }) {
    const employee_code = await StaffModel.generateEmployeeCode();
    const sql = `
      INSERT INTO employees
        (user_id, department_id, employee_code, first_name, last_name, gender, phone, email, designation, hire_date, salary, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      user_id || null,
      department_id,
      employee_code,
      first_name,
      last_name,
      gender || 'Male',
      phone,
      email,
      designation,
      hire_date || new Date().toISOString().split('T')[0],
      salary,
      status,
    ]);
    return result.insertId;
  }

  static async updateEmployee(id, data) {
    const fields = ['department_id', 'first_name', 'last_name', 'gender', 'phone', 'email', 'designation', 'hire_date', 'salary', 'status'];
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
    const sql = `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`;
    return query(sql, params);
  }

  // --- Attendance Management ---
  static async getAttendance({ date, departmentId } = {}) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    let sql = `
      SELECT 
        e.id AS employee_id, e.employee_code, e.first_name, e.last_name, e.designation,
        d.name AS department_name,
        a.id AS attendance_id, a.date, a.clock_in, a.clock_out,
        COALESCE(a.status, 'absent') AS attendance_status,
        a.remarks
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = ?
      WHERE e.status = 'active'
    `;
    const params = [targetDate];

    if (departmentId) {
      sql += ` AND e.department_id = ?`;
      params.push(departmentId);
    }

    sql += ` ORDER BY e.first_name ASC`;
    return query(sql, params);
  }

  static async recordAttendance({ employee_id, date, clock_in, clock_out, status = 'present', remarks }) {
    const attDate = date || new Date().toISOString().split('T')[0];
    const sql = `
      INSERT INTO attendance (employee_id, date, clock_in, clock_out, status, remarks)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        clock_in = VALUES(clock_in),
        clock_out = VALUES(clock_out),
        status = VALUES(status),
        remarks = VALUES(remarks)
    `;
    const result = await query(sql, [
      employee_id,
      attDate,
      clock_in || null,
      clock_out || null,
      status,
      remarks || null,
    ]);
    return result;
  }

  // --- Leave Records Management ---
  static async getLeaves({ status, employeeId, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT 
        l.id, l.employee_id, l.leave_type, l.start_date, l.end_date, l.reason,
        l.status, l.approved_by, l.decision_notes, l.created_at,
        DATEDIFF(l.end_date, l.start_date) + 1 AS days_count,
        e.employee_code, e.first_name, e.last_name, e.designation,
        d.name AS department_name,
        u.username AS approved_by_username
      FROM leave_records l
      JOIN employees e ON l.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON l.approved_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND l.status = ?`;
      params.push(status);
    }
    if (employeeId) {
      sql += ` AND l.employee_id = ?`;
      params.push(employeeId);
    }

    sql += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    return query(sql, params);
  }

  static async applyLeave({ employee_id, leave_type, start_date, end_date, reason }) {
    const sql = `
      INSERT INTO leave_records (employee_id, leave_type, start_date, end_date, reason, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    const result = await query(sql, [
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason,
    ]);
    return result.insertId;
  }

  static async decideLeave(id, { status, approved_by, decision_notes }) {
    const sql = `
      UPDATE leave_records
      SET status = ?, approved_by = ?, decision_notes = ?, updated_at = NOW()
      WHERE id = ?
    `;
    return query(sql, [status, approved_by, decision_notes || null, id]);
  }
}

module.exports = StaffModel;
