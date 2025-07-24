const db = require('../config/db');

const ShortlistCandidate = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM shortlist_candidates');
    return rows;
  },
  async create(candidate) {
    const sql = `INSERT INTO shortlist_candidates (candidate_id, candidate_name, candidate_email, candidate_image, job_id, job_title, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      candidate.candidate_id,
      candidate.candidate_name,
      candidate.candidate_email,
      candidate.candidate_image,
      candidate.job_id,
      candidate.job_title,
      candidate.status
    ];
    const [result] = await db.query(sql, params);
    return result;
  },
  async delete(id) {
    const [result] = await db.query('DELETE FROM shortlist_candidates WHERE id = ?', [id]);
    return result;
  }
};

module.exports = ShortlistCandidate;
