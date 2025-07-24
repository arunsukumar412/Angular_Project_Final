const db = require('../config/db');

const AdminUser = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM admin_users');
    return rows;
  },

  async getById(user_id) {
    const [rows] = await db.query('SELECT * FROM admin_users WHERE user_id = ?', [user_id]);
    return rows[0];
  },

  async create(user) {
    const sql = `INSERT INTO admin_users (user_id, name, email, phone, role, status, password_hash, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [user.user_id, user.name, user.email, user.phone, user.role, user.status, user.password_hash, user.avatar_url];
    const [result] = await db.query(sql, params);
    return result;
  },

  async update(user_id, user) {
    const sql = `UPDATE admin_users SET name=?, email=?, phone=?, role=?, status=?, password_hash=?, avatar_url=? WHERE user_id=?`;
    const params = [user.name, user.email, user.phone, user.role, user.status, user.password_hash, user.avatar_url, user_id];
    const [result] = await db.query(sql, params);
    return result;
  },

  async delete(user_id) {
    const [result] = await db.query('DELETE FROM admin_users WHERE user_id = ?', [user_id]);
    return result;
  }
};

module.exports = AdminUser;
