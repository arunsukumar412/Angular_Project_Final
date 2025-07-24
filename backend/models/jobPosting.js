const db = require('../config/db');

const JobPosting = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM post_job');
    return rows;
  },

  async getById(job_id) {
    const [rows] = await db.query('SELECT * FROM post_job WHERE job_id = ?', [job_id]);
    return rows[0];
  },

  async create(job) {
    const sql = `INSERT INTO post_job (title, department, location, description, status, postedDate) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [job.title, job.department, job.location, job.description, job.status, job.postedDate || new Date()];
    const [result] = await db.query(sql, params);
    return result;
  },

  async update(job_id, job) {
    const sql = `UPDATE post_job SET title=?, department=?, location=?, description=?, status=?, postedDate=? WHERE job_id=?`;
    const params = [job.title, job.department, job.location, job.description, job.status, job.postedDate, job_id];
    const [result] = await db.query(sql, params);
    return result;
  },

  async delete(job_id) {
    const [result] = await db.query('DELETE FROM post_job WHERE job_id = ?', [job_id]);
    return result;
  }
};

module.exports = JobPosting;
