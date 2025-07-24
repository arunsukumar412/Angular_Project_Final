const express = require('express');
const router = express.Router();
const ContentJobs = require('../models/contentJobs');

// GET all content jobs
router.get('/', async (req, res) => {
  try {
    const results = await ContentJobs.getAll();
    const jobs = results.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      status: job.status,
      postedBy: job.posted_by,
      postedDate: job.posted_date
    }));
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
});

module.exports = router;
