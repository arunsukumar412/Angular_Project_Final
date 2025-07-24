const ShortlistCandidate = require('../models/shortlistCandidate');

exports.getAllShortlistCandidates = async (req, res) => {
  try {
    const candidates = await ShortlistCandidate.getAll();
    // Map DB fields to camelCase for frontend compatibility
    const mapped = candidates.map(item => ({
      id: item.id,
      candidateId: item.candidate_id,
      candidateName: item.candidate_name,
      candidateEmail: item.candidate_email,
      candidateImage: item.candidate_image,
      jobId: item.job_id,
      jobTitle: item.job_title,
      status: item.status
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createShortlistCandidate = async (req, res) => {
  try {
    const candidate = req.body;
    await ShortlistCandidate.create(candidate);
    res.status(201).json({ message: 'Candidate shortlisted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteShortlistCandidate = async (req, res) => {
  try {
    const id = req.params.id;
    await ShortlistCandidate.delete(id);
    res.json({ message: 'Shortlist candidate deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
