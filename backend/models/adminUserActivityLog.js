const db = require('../config/db');

const AdminUserActivityLog = {
  async logActivity(admin_user_id, action, details) {
    const sql = `INSERT INTO admin_user_activity_log (admin_user_id, action, details) VALUES (?, ?, ?)`;
    const [result] = await db.query(sql, [admin_user_id, action, details]);
    return result;
  },

  async getAll() {
    const [rows] = await db.query('SELECT * FROM admin_user_activity_log ORDER BY created_at DESC');
    return rows;
  },

  async getByAdminUserId(admin_user_id) {
    const [rows] = await db.query('SELECT * FROM admin_user_activity_log WHERE admin_user_id = ? ORDER BY created_at DESC', [admin_user_id]);
    return rows;
  }
};

module.exports = AdminUserActivityLog;
