const db = require('../config/db');

const ContentJobs = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM content_jobs');
    return rows;
  }
};

module.exports = ContentJobs;
