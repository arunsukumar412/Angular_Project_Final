const Session = require('../models/session');
const { v4: uuidv4 } = require('uuid');

exports.createSession = async (req, res) => {
  try {
    const { user_id, user_role } = req.body;
    const session_id = uuidv4();
    const created_at = new Date();
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    // Get IP and user agent from request
    const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || null;
    const user_agent = req.headers['user-agent'] || null;
    await Session.create({ session_id, user_id, user_role, ip_address, user_agent, created_at, expires_at });
    res.status(201).json({ session_id, expires_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSession = async (req, res) => {
  try {
    const { session_id } = req.params;
    const session = await Session.getById(session_id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { session_id } = req.params;
    await Session.delete(session_id);
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSessionsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const sessions = await Session.getByUserId(user_id);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
