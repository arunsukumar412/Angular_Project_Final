const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all shortlisted candidates
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM shortlist_candidates');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new shortlisted candidate
router.post('/', async (req, res) => {
  try {
    const { candidate_id, candidate_name, candidate_email, candidate_image, job_id, job_title, status } = req.body;
    const [result] = await db.query(
      `INSERT INTO shortlist_candidates (candidate_id, candidate_name, candidate_email, candidate_image, job_id, job_title, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [candidate_id, candidate_name, candidate_email, candidate_image, job_id, job_title, status]
    );
    const [rows] = await db.query('SELECT * FROM shortlist_candidates WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a shortlisted candidate
router.put('/:id', async (req, res) => {
  try {
    const { candidate_id, candidate_name, candidate_email, candidate_image, job_id, job_title, status } = req.body;
    await db.query(
      `UPDATE shortlist_candidates SET candidate_id=?, candidate_name=?, candidate_email=?, candidate_image=?, job_id=?, job_title=?, status=? WHERE id=?`,
      [candidate_id, candidate_name, candidate_email, candidate_image, job_id, job_title, status, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM shortlist_candidates WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a shortlisted candidate
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM shortlist_candidates WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
