const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

router.get('/test', (req, res) => res.json({ message: 'Interview route is working' }));
router.get('/', interviewController.getAllInterviews);
router.post('/', interviewController.createInterview);
router.put('/:id', interviewController.updateInterview);
router.delete('/:id', interviewController.deleteInterview);

module.exports = router;
