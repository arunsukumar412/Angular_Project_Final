const JobPosting = require('../models/jobPosting');
const { v4: uuidv4 } = require('uuid');

exports.getAllJobPostings = async (req, res) => {
  try {
    const jobs = await JobPosting.getAll();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getJobPostingById = async (req, res) => {
  try {
    const job = await JobPosting.getById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createJobPosting = async (req, res) => {
  try {
    const job = req.body;
    // job_id is auto-increment in DB, do not set manually
    job.postedDate = job.postedDate || new Date();
    const result = await JobPosting.create(job);
    res.status(201).json({ message: 'Job created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateJobPosting = async (req, res) => {
  try {
    const job = req.body;
    job.postedDate = job.postedDate || new Date();
    const result = await JobPosting.update(req.params.id, job);
    res.json({ message: 'Job updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteJobPosting = async (req, res) => {
  try {
    const result = await JobPosting.delete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
