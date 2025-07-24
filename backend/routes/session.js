const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Create session
router.post('/', sessionController.createSession);
// Get session by ID
router.get('/:session_id', sessionController.getSession);
// Delete session
router.delete('/:session_id', sessionController.deleteSession);
// Get all sessions for a user
router.get('/user/:user_id', sessionController.getSessionsByUser);

module.exports = router;
