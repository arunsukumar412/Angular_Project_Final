const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/users - fetch all users
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, created_at, updated_at FROM users ORDER BY id DESC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
