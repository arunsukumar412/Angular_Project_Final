const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/adminUserActivityLogController');

// Log a new activity
router.post('/', activityLogController.logActivity);

// Get all activity logs
router.get('/', activityLogController.getAll);

// Get activity logs by admin user id
router.get('/:admin_user_id', activityLogController.getByAdminUserId);

module.exports = router;
