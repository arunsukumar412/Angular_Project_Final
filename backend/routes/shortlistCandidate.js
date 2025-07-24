
const express = require('express');
const router = express.Router();
const shortlistCandidateController = require('../controllers/shortlistCandidateController');
// Test route to verify mounting
router.get('/test', (req, res) => res.json({ message: 'Shortlist route works!' }));

router.get('/', shortlistCandidateController.getAllShortlistCandidates);
router.post('/', shortlistCandidateController.createShortlistCandidate);
router.delete('/:id', shortlistCandidateController.deleteShortlistCandidate);

module.exports = router;
