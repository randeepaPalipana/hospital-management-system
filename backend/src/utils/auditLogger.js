const { query } = require('../config/db');

/**
 * Record an audit log entry in the database
 * @param {object} req - Express request object
 * @param {string} action - e.g., 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE'
 * @param {string} entityName - e.g., 'users', 'patients', 'appointments'
 * @param {number|null} entityId - primary key of affected record
 * @param {object|null} details - key-value details of the action
 */
async function logAudit(req, action, entityName, entityId = null, details = null) {
  try {
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || null;
    const userAgent = req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 255) : null;
    const detailsJson = details ? JSON.stringify(details) : null;

    const sql = `
      INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [userId, action, entityName, entityId, detailsJson, ipAddress, userAgent]);
  } catch (error) {
    // Non-blocking failure: Log to console but do not break user transaction
    console.error('Audit Logging Error:', error.message);
  }
}

module.exports = {
  logAudit,
};
