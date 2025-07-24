const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Register Route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed]
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Try normal users table first
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    let user = users[0];
    let userType = 'user';
    if (!user) {
      // Try admin_users table if not found in users
      const [admins] = await db.query("SELECT * FROM admin_users WHERE email = ?", [email]);
      user = admins[0];
      userType = 'admin';
    }
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    // Password field is different for admin_users
    const passwordHash = userType === 'admin' ? user.password_hash : user.password;
    const match = await bcrypt.compare(password, passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    // Compose user object for frontend
    let userObj;
    if (userType === 'admin') {
      userObj = {
        id: user.user_id,
        username: user.name,
        email: user.email,
        role: user.role || 'admin'
      };
    } else {
      userObj = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'jobseeker'
      };
    }

    const token = jwt.sign({ id: userObj.id, email: userObj.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
