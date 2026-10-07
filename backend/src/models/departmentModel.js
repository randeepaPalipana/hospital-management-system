const { query, transaction } = require('../config/db');

class DepartmentModel {
  static async findAll() {
    const sql = `
      SELECT 
        d.id, d.name, d.code, d.description, d.created_at,
        COUNT(doc.id) AS doctor_count
      FROM departments d
      LEFT JOIN doctors doc ON d.id = doc.department_id
      GROUP BY d.id
      ORDER BY d.name ASC
    `;
    return query(sql);
  }

  static async findById(id) {
    const sql = `
      SELECT 
        d.id, d.name, d.code, d.description, d.created_at,
        COUNT(doc.id) AS doctor_count
      FROM departments d
      LEFT JOIN doctors doc ON d.id = doc.department_id
      WHERE d.id = ?
      GROUP BY d.id
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async findByCode(code) {
    const sql = `SELECT * FROM departments WHERE code = ? LIMIT 1`;
    const rows = await query(sql, [code]);
    return rows[0] || null;
  }

  static async create({ name, code, description }) {
    const sql = `INSERT INTO departments (name, code, description) VALUES (?, ?, ?)`;
    const result = await query(sql, [name, code.toUpperCase(), description || null]);
    return result.insertId;
  }

  static async update(id, { name, code, description }) {
    const updates = [];
    const params = [];
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (code !== undefined) {
      updates.push('code = ?');
      params.push(code.toUpperCase());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (updates.length === 0) return null;
    params.push(id);
    const sql = `UPDATE departments SET ${updates.join(', ')} WHERE id = ?`;
    return query(sql, params);
  }
}

module.exports = DepartmentModel;
