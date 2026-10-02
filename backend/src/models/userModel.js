const { query } = require('../config/db');

class UserModel {
  /**
   * Find user by username or email (includes password hash for authentication)
   */
  static async findByUsernameOrEmail(identifier) {
    const sql = `
      SELECT 
        u.id, 
        u.role_id, 
        u.username, 
        u.email, 
        u.password_hash, 
        u.is_active, 
        u.last_login,
        r.name AS role_name,
        e.id AS employee_id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE (u.username = ? OR u.email = ?)
      LIMIT 1
    `;
    const rows = await query(sql, [identifier, identifier]);
    return rows[0] || null;
  }

  /**
   * Find sanitized user by ID (excludes password hash)
   */
  static async findById(id) {
    const sql = `
      SELECT 
        u.id, 
        u.role_id, 
        u.username, 
        u.email, 
        u.is_active, 
        u.last_login,
        u.created_at,
        r.name AS role_name,
        e.id AS employee_id,
        e.first_name,
        e.last_name,
        e.employee_code,
        e.department_id
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id) {
    const sql = `UPDATE users SET last_login = NOW() WHERE id = ?`;
    return query(sql, [id]);
  }

  /**
   * Update user password
   */
  static async updatePassword(id, passwordHash) {
    const sql = `UPDATE users SET password_hash = ? WHERE id = ?`;
    return query(sql, [passwordHash, id]);
  }

  /**
   * List all users with pagination and role filter
   */
  static async findAll({ roleId, search, limit = 20, offset = 0 } = {}) {
    let sql = `
      SELECT 
        u.id, 
        u.role_id, 
        u.username, 
        u.email, 
        u.is_active, 
        u.last_login,
        u.created_at,
        r.name AS role_name,
        CONCAT(IFNULL(e.first_name, ''), ' ', IFNULL(e.last_name, '')) AS employee_name,
        e.employee_code
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE 1=1
    `;
    const params = [];

    if (roleId) {
      sql += ` AND u.role_id = ?`;
      params.push(roleId);
    }

    if (search) {
      sql += ` AND (u.username LIKE ? OR u.email LIKE ? OR e.first_name LIKE ? OR e.last_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY u.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    return query(sql, params);
  }

  /**
   * Count total users for pagination
   */
  static async countAll({ roleId, search } = {}) {
    let sql = `
      SELECT COUNT(*) AS total
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE 1=1
    `;
    const params = [];

    if (roleId) {
      sql += ` AND u.role_id = ?`;
      params.push(roleId);
    }

    if (search) {
      sql += ` AND (u.username LIKE ? OR u.email LIKE ? OR e.first_name LIKE ? OR e.last_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const rows = await query(sql, params);
    return rows[0]?.total || 0;
  }

  /**
   * Create new user
   */
  static async create({ role_id, username, email, password_hash, is_active = true }) {
    const sql = `
      INSERT INTO users (role_id, username, email, password_hash, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [role_id, username, email, password_hash, is_active]);
    return result.insertId;
  }

  /**
   * Update user status or role
   */
  static async update(id, { role_id, is_active }) {
    const updates = [];
    const params = [];

    if (role_id !== undefined) {
      updates.push(`role_id = ?`);
      params.push(role_id);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = ?`);
      params.push(is_active);
    }

    if (updates.length === 0) return null;

    params.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    return query(sql, params);
  }
}

module.exports = UserModel;
