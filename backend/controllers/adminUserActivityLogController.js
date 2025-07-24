const AdminUserActivityLog = require('../models/adminUserActivityLog');

exports.logActivity = async (req, res) => {
  try {
    const { admin_user_id, action, details } = req.body;
    if (!admin_user_id || !action) {
      return res.status(400).json({ error: 'admin_user_id and action are required' });
    }
    await AdminUserActivityLog.logActivity(admin_user_id, action, details || null);
    res.status(201).json({ message: 'Activity logged' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const logs = await AdminUserActivityLog.getAll();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByAdminUserId = async (req, res) => {
  try {
    const { admin_user_id } = req.params;
    const logs = await AdminUserActivityLog.getByAdminUserId(admin_user_id);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
