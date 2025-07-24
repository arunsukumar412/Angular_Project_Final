const db = require('../config/db');

const Interview = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM interviews');
    return rows;
  },
  async create(interview) {
    const sql = `INSERT INTO interviews (candidate_id, candidate_name, candidate_email, candidate_image, job_id, job_title, interviewer_id, interviewer, date, time, status, status_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      interview.candidate_id,
      interview.candidate_name,
      interview.candidate_email,
      interview.candidate_image,
      interview.job_id,
      interview.job_title,
      interview.interviewer_id,
      interview.interviewer,
      interview.date,
      interview.time,
      interview.status,
      interview.status_color
    ];
    const [result] = await db.query(sql, params);
    return result;
  },
  async update(id, interview) {
    const sql = `UPDATE interviews SET candidate_id=?, candidate_name=?, candidate_email=?, candidate_image=?, job_id=?, job_title=?, interviewer_id=?, interviewer=?, date=?, time=?, status=?, status_color=? WHERE id=?`;
    const params = [
      interview.candidate_id,
      interview.candidate_name,
      interview.candidate_email,
      interview.candidate_image,
      interview.job_id,
      interview.job_title,
      interview.interviewer_id,
      interview.interviewer,
      interview.date,
      interview.time,
      interview.status,
      interview.status_color,
      id
    ];
    const [result] = await db.query(sql, params);
    return result;
  },
  async delete(id) {
    const [result] = await db.query('DELETE FROM interviews WHERE id = ?', [id]);
    return result;
  }
};

module.exports = Interview;
