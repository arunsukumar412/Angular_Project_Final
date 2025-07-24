const express = require('express');
const router = express.Router();
const ContentNotifications = require('../models/contentNotifications');

// GET all content notifications
router.get('/', async (req, res) => {
  try {
    const results = await ContentNotifications.getAll();
    const notifications = results.map(n => ({
      id: n.id,
      message: n.message,
      time: n.time,
      icon: n.icon
    }));
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
});

module.exports = router;
