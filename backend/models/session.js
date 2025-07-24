const db = require('../config/db');

const Session = {
  async create(session) {
    const sql = `INSERT INTO sessions2 (session_id, user_id, user_role, ip_address, user_agent, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      session.session_id,
      session.user_id,
      session.user_role || null,
      session.ip_address || null,
      session.user_agent || null,
      session.created_at,
      session.expires_at
    ];
    const [result] = await db.query(sql, params);
    return result;
  },

  async getById(session_id) {
    const [rows] = await db.query('SELECT * FROM sessions2 WHERE session_id = ?', [session_id]);
    return rows[0];
  },

  async delete(session_id) {
    const [result] = await db.query('DELETE FROM sessions2 WHERE session_id = ?', [session_id]);
    return result;
  },

  async getByUserId(user_id) {
    const [rows] = await db.query('SELECT * FROM sessions2 WHERE user_id = ?', [user_id]);
    return rows;
  }
};

module.exports = Session;
