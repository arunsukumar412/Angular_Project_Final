const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/hr-metrics
router.get('/', async (req, res) => {
  try {
    // Example: Replace with your own logic/queries
    const [metrics] = await db.query('SELECT COUNT(*) as hrCount FROM hr');
    res.json({
      totalInterviews: 0,
      hrCount: metrics[0].hrCount,
      activeCandidates: 0,
      jobOpenings: 0,
      reportsGenerated: 0,
      hiringSuccessRate: 0,
      hrHiringCapacity: 0,
      usersAppliedJobs: 0,
      hrHiredPeople: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
