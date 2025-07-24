const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM jobs_management');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new job (expects req.body and req.file for resume)
router.post('/', async (req, res) => {
  try {
    const { job_title, company, department, location } = req.body;
    const application = req.file ? req.file.filename : null; // if using multer for file upload
    const [result] = await db.query(
      'INSERT INTO jobs_management (job_title, company, department, location, application) VALUES (?, ?, ?, ?, ?)',
      [job_title, company, department, location, application]
    );
    res.status(201).json({ id: result.insertId, job_title, company, department, location, application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a job
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM jobs_management WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
