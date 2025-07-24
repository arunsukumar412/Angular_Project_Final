const AdminUser = require('../models/adminUser');
const { v4: uuidv4 } = require('uuid');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await AdminUser.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await AdminUser.getById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = req.body;
    user.user_id = uuidv4();
    user.avatar_url = user.avatar_url || 'https://png.pngtree.com/png-vector/20250109/ourlarge/pngtree-smiling-professional-avatar-png-image_14851558.png';
    const result = await AdminUser.create(user);
    res.status(201).json({ user_id: user.user_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = req.body;
    const result = await AdminUser.update(req.params.id, user);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await AdminUser.delete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
