const express = require('express');
const router = express.Router();
const KnowUsContent = require('../models/KnowUsContent');
const authenticateSuperAdmin = require('../middleware/authSuperadminMiddleware');

router.get('/', async (req, res) => {
  try {
    // Attempt to find the single about content document by its fixed _id
    let content = await KnowUsContent.findById('mainKnowUsDoc');

    if (!content) {
      // If no document exists, create a default one
      content = new KnowUsContent({ _id: 'mainKnowUsDoc' }); // Schema defaults will apply
      await content.save();
    }
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.put('/', authenticateSuperAdmin, async (req, res) => {
  const { heading, paragraph1, paragraph2, paragraph3, image1Base64, image2Base64 } = req.body;

  // Build content fields object to update
  const contentFields = {};
  if (heading) contentFields.heading = heading;
  if (paragraph1) contentFields.paragraph1 = paragraph1;
  if (paragraph2) contentFields.paragraph2 = paragraph2;
  if (paragraph3) contentFields.paragraph3 = paragraph3;
  // Added new fields for Base64 data
  if (image1Base64) contentFields.image1Base64 = image1Base64;
  if (image2Base64) contentFields.image2Base64 = image2Base64;

  try {
    let content = await KnowUsContent.findByIdAndUpdate(
      'mainKnowUsDoc',
      { $set: contentFields },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(content);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ errors: err });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
