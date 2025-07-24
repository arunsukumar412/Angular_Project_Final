const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/post-job - fetch all jobs from post_job table
router.get('/', async (req, res) => {
  try {
    const [jobs] = await db.query('SELECT * FROM post_job ORDER BY job_id DESC');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
