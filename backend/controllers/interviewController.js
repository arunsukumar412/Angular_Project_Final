const Interview = require('../models/interview');
const ShortlistCandidate = require('../models/shortlistCandidate');

exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.getAll();
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createInterview = async (req, res) => {
  try {
    const interview = req.body;
    await Interview.create(interview);

    // Prepare candidate data for shortlist
    const candidate = {
      candidate_id: interview.candidate_id || interview.candidateId,
      candidate_name: interview.candidate_name || interview.candidateName,
      candidate_email: interview.candidate_email || interview.candidateEmail,
      candidate_image: interview.candidate_image || interview.candidateImage,
      job_id: interview.job_id || interview.jobId,
      job_title: interview.job_title || interview.jobTitle,
      status: 'Shortlisted'
    };

    // Try to add to shortlist_candidates (ignore duplicate error)
    try {
      await ShortlistCandidate.create(candidate);
    } catch (err) {
      // If duplicate entry, ignore; else log error
      if (!err.message.includes('Duplicate')) {
        console.error('Shortlist add error:', err.message);
      }
    }

    res.status(201).json({ message: 'Interview scheduled and candidate shortlisted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInterview = async (req, res) => {
  try {
    const id = req.params.id;
    const interview = req.body;
    await Interview.update(id, interview);
    res.json({ message: 'Interview updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInterview = async (req, res) => {
  try {
    const id = req.params.id;
    await Interview.delete(id);
    res.json({ message: 'Interview deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
