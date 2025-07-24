const express = require('express');
const router = express.Router();
const jobPostingController = require('../controllers/jobPostingController');

// GET all job postings
router.get('/', jobPostingController.getAllJobPostings);

// GET job posting by ID
router.get('/:id', jobPostingController.getJobPostingById);

// CREATE job posting
router.post('/', jobPostingController.createJobPosting);

// UPDATE job posting
router.put('/:id', jobPostingController.updateJobPosting);

// DELETE job posting
router.delete('/:id', jobPostingController.deleteJobPosting);

module.exports = router;
