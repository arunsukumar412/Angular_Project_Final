const db = require('../config/db');

const ContentNotifications = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM content_notifications');
    return rows;
  }
};

module.exports = ContentNotifications;
