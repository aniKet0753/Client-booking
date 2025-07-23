const express = require('express');
const router = express.Router();
const TermsAndConditions = require('../models/TermsAndConditions');

// GET request to fetch the latest T&C content
router.get('/', async (req, res) => {
  try {
    const terms = await TermsAndConditions.findOne().sort({ lastUpdated: -1 });
    if (!terms) {
      return res.status(404).json({ message: 'Terms and conditions not found. You can create a new one.' });
    }
    res.json(terms);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// POST or PATCH request to create or update the T&C content
router.post('/', async (req, res) => {
  const { mainHeader, introText, sections, footerNotes } = req.body;

  if (!mainHeader || !Array.isArray(sections) || !Array.isArray(footerNotes)) {
    return res.status(400).json({ message: 'Invalid data format. mainHeader, sections, and footerNotes are required.' });
  }

  try {
    // Upsert a new document or update the existing one
    const updatedTerms = await TermsAndConditions.findOneAndUpdate(
      {},
      { mainHeader, introText, sections, footerNotes, lastUpdated: Date.now() },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json(updatedTerms);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error while saving: ' + error.message });
  }
});

module.exports = router;