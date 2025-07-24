const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/reports
// Use admin_reports table and parse skills as array
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM admin_reports');
    // Convert skills CSV to array for frontend compatibility
    const parsedRows = rows.map(row => ({
      ...row,
      skills: row.skills ? row.skills.split(',') : []
    }));
    res.json(parsedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT /api/reports/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      title, type, date, status, user, hrId, candidateId, role, email, phone, department, location, experience, skills, priority, jobId, position, tag, folder
    } = req.body;
    const skillsStr = Array.isArray(skills) ? skills.join(',') : (skills || '');
    await db.query(
      `UPDATE admin_reports SET title=?, type=?, date=?, status=?, user=?, hrId=?, candidateId=?, role=?, email=?, phone=?, department=?, location=?, experience=?, skills=?, priority=?, jobId=?, position=?, tag=?, folder=? WHERE id=?`,
      [title, type, date, status, user, hrId, candidateId, role, email, phone, department, location, experience, skillsStr, priority, jobId, position, tag, folder, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM admin_reports WHERE id = ?', [req.params.id]);
    const updatedReport = rows[0];
    updatedReport.skills = updatedReport.skills ? updatedReport.skills.split(',') : [];
    res.json(updatedReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM admin_reports WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// POST /api/reports
router.post('/', async (req, res) => {
  try {
    const {
      title, type, date, status, user, hrId, candidateId, role, email, phone, department, location, experience, skills, priority, jobId, position, tag, folder
    } = req.body;
    // Convert skills array to CSV string if needed
    const skillsStr = Array.isArray(skills) ? skills.join(',') : (skills || '');
    const [result] = await db.query(
      `INSERT INTO admin_reports (title, type, date, status, user, hrId, candidateId, role, email, phone, department, location, experience, skills, priority, jobId, position, tag, folder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, type, date, status, user, hrId, candidateId, role, email, phone, department, location, experience, skillsStr, priority, jobId, position, tag, folder]
    );
    const [rows] = await db.query('SELECT * FROM admin_reports WHERE id = ?', [result.insertId]);
    const newReport = rows[0];
    newReport.skills = newReport.skills ? newReport.skills.split(',') : [];
    res.status(201).json(newReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
