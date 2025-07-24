const express = require('express');
const router = express.Router();
const ContentManagement = require('../models/contentManagement');

// GET content by id
router.get('/:id', (req, res) => {
  const id = req.params.id;
  ContentManagement.getContent(id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    if (!results.length) return res.status(404).json({ error: 'Content not found' });
    res.json(results[0]);
  });
});

// PUT update content by id
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  ContentManagement.updateContent(id, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.json({ message: 'Content updated successfully' });
  });
});

module.exports = router;
