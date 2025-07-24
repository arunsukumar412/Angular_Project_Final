const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

// GET all users
router.get('/', adminUserController.getAllUsers);

// GET user by ID
router.get('/:id', adminUserController.getUserById);

// CREATE user
router.post('/', adminUserController.createUser);

// UPDATE user
router.put('/:id', adminUserController.updateUser);

// DELETE user
router.delete('/:id', adminUserController.deleteUser);

module.exports = router;
