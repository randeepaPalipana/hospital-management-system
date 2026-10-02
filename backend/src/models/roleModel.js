const { query } = require('../config/db');

class RoleModel {
  static async findAll() {
    const sql = `SELECT id, name, description FROM roles ORDER BY id ASC`;
    return query(sql);
  }

  static async findById(id) {
    const sql = `SELECT id, name, description FROM roles WHERE id = ?`;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }
}

module.exports = RoleModel;
