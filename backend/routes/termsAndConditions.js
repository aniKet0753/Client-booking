const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Agent = require('../models/Agent'); // Import the Agent model
const SuperAdmin = require('../models/Superadmin'); // Import the SuperAdmin model
const Customer = require('../models/Customer'); // Import the Customer model
const TermsAndConditions = require('../models/TermsAndConditions');
const UserAgreement = require('../models/UserAgreement');
const authenticate = require('../middleware/authMiddleware');
const authenticateSuperAdmin = require('../middleware/authSuperadminMiddleware');

// Get the latest terms and conditions for a specific type (and tourId if applicable)
// For 'agents' and 'homepage', it gets the single document for that type.
// For 'tour', it gets the document for a specific tourId.
router.get('/latest', async (req, res) => {
  const { type, tourId } = req.query;

  if (!type) {
    return res.status(400).json({ message: 'Missing terms type.' });
  }

  try {
    let query = { type };

    if (type === 'tour') {
      // If a specific tourId is provided, validate it and use it.
      if (tourId) {
        if (!mongoose.Types.ObjectId.isValid(tourId)) {
          return res.status(400).json({ message: 'Invalid tourId format.' });
        }
        query.tourId = tourId; // Mongoose will handle the conversion to ObjectId
      } else {
        // If no tourId is provided for 'tour' type, we look for the default tour T&C where tourId is null.
        query.tourId = null;
      }
    } else {
      // For other types (e.g., 'agents', 'homepage'), tourId should always be null.
      query.tourId = null;
    }

    const latestTerms = await TermsAndConditions.findOne(query);

    if (!latestTerms) {
      return res.status(404).json({ message: `No terms and conditions found for type: ${type}${tourId ? ' and tourId: ' + tourId : ''}.` });
    }

    res.json(latestTerms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/default', async (req, res) => {
  const { type } = req.query;
  
  if (!type) {
    return res.status(400).json({ message: 'Missing terms type.' });
  }

  try {
    let query = { type };
    if (type === 'tour') {
      query.tourId = null; // Default tourId for tour type
    }

    const defaultTerms = await TermsAndConditions.findOne(query);

    if (!defaultTerms) {
      return res.status(404).json({ message: `No default terms and conditions found for type: ${type}.` });
    }

    res.json(defaultTerms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Record a user's agreement to the latest T&Cs for a specific type (and tourId if applicable)
router.post('/agree', authenticate, async (req, res) => {
  const { userId, userType, type, tourId } = req.body;

  if (!type) {
    return res.status(400).json({ message: 'Missing terms type.' });
  }

  try {
    let query = { type };
    if (type === 'tour') {
      if (!tourId) {
        return res.status(400).json({ message: 'Missing tourId for tour terms.' });
      }
      query.tourId = tourId;
    } else {
      query.tourId = null;
    }

    const latestTerms = await TermsAndConditions.findOne(query);

    if (!latestTerms) {
      return res.status(404).json({ message: `No terms and conditions found for type: ${type} ${tourId ? 'and tourId: ' + tourId : ''}.` });
    }

    // Check if the user has already agreed to the latest T&C document for their user type
    const existingAgreement = await UserAgreement.findOne({
      userId,
      userType,
      termsId: latestTerms._id,
    });

    if (existingAgreement) {
      return res.status(409).json({ message: 'You have already agreed to the latest terms for this type.' });
    }

    // Create a new agreement record
    const newAgreement = new UserAgreement({
      userId,
      userType,
      termsId: latestTerms._id,
    });

    await newAgreement.save();

    res.status(201).json({
      message: 'Agreement recorded successfully.',
      agreement: newAgreement,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Check a user's agreement status for the latest T&Cs
router.get('/agreement/:userId', async (req, res) => {
  const { userId } = req.params;
  const { type, userType, tourId } = req.query;

  if (!type || !userType) {
    return res.status(400).json({ message: 'Missing terms type or user type.' });
  }

  try {
    let query = { type };
    if (type === 'tour') {
      if (!tourId) {
        return res.status(400).json({ message: 'Missing tourId for tour terms.' });
      }
      query.tourId = tourId;
    } else {
      query.tourId = null;
    }

    const latestTerms = await TermsAndConditions.findOne(query);

    if (!latestTerms) {
      return res.status(404).json({ message: `No terms and conditions found for type: ${type} ${tourId ? 'and tourId: ' + tourId : ''}.` });
    }

    const agreement = await UserAgreement.findOne({
      userId: userId,
      userType: userType,
      termsId: latestTerms._id,
    });

    res.json({
      agreedToLatest: !!agreement,
      agreedAt: agreement ? agreement.agreedAt : null,
      termsType: type,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST to create or update terms and conditions for a specific type (and tourId if applicable).
// This route is protected by the SuperAdmin middleware.
router.post('/', authenticateSuperAdmin, async (req, res) => {
  const { type, tourId, mainHeader, introText, sections, footerNotes } = req.body;
  
  // Validate the incoming data
  if (!type || !mainHeader || !Array.isArray(sections) || !Array.isArray(footerNotes)) {
    return res.status(400).json({ message: 'Invalid data format. type, mainHeader, sections, and footerNotes are required.' });
  }

  // Define allowed types to prevent arbitrary data creation
  const allowedTypes = ['agents', 'homepage', 'tour'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ message: `Invalid terms type provided. Must be one of: ${allowedTypes.join(', ')}` });
  }

  // Enforce tourId for 'tour' type
  if (type === 'tour' && !tourId) {
    return res.status(400).json({ message: 'A tourId is required for terms of type "tour".' });
  }

  try {
    let query = { type };
    if (type === 'tour') {
      query.tourId = tourId;
    } else {
      query.tourId = null;
    }

    const updatedTerms = await TermsAndConditions.findOneAndUpdate(
      query,
      {
        mainHeader,
        introText,
        sections,
        footerNotes,
        lastUpdated: new Date()
      },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json({
      message: `Terms and Conditions for '${type}' ${tourId ? 'and tourId ' + tourId : ''} updated successfully.`,
      terms: updatedTerms
    });
  } catch (error) {
    console.error("Error saving terms:", error);
    res.status(500).json({ message: 'Server error while saving: ' + error.message });
  }
});


// Get all users who have agreed to a specific termsId
router.get('/agreed-users/:termsId', authenticateSuperAdmin, async (req, res) => {
  const { termsId } = req.params;

  try {
    // 1. Find all user agreements for the specified termsId
    const agreements = await UserAgreement.find({ termsId });

    if (!agreements || agreements.length === 0) {
      return res.status(404).json({ message: 'No users have agreed to these terms.' });
    }

    const agreedUsers = [];
    for (const agreement of agreements) {
      let userDetails = null;

      // 2. Fetch user details based on userType and userId
      switch (agreement.userType) {
        case 'SuperAdmin':
          userDetails = await SuperAdmin.findById(agreement.userId);
          break;
        case 'Agent':
          userDetails = await Agent.findById(agreement.userId);
          break;
        case 'Customer':
          userDetails = await Customer.findById(agreement.userId);
          break;
      }

      // If user details are found, add them to the list
      if (userDetails) {
        agreedUsers.push({
          ...userDetails._doc, // Spreads all properties from the Mongoose document
          agreedAt: agreement.agreedAt,
          userType: agreement.userType,
          termsId: agreement.termsId,
        });
      }
    }

    res.json(agreedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get user details by userId
router.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // A single user could be an Agent, SuperAdmin, or Customer.
    // We can check each model to find the user.
    let user = await Agent.findById(userId);
    if (!user) {
      user = await SuperAdmin.findById(userId);
    }
    if (!user) {
      user = await Customer.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/all-agreements', authenticateSuperAdmin, async (req, res) => {
  const { userType } = req.query;

  if (!userType) {
    return res.status(400).json({ message: 'Missing userType parameter.' });
  }

  try {
    // Find all UserAgreement documents for the given userType
    const agreements = await UserAgreement.find({ userType });

    if (!agreements || agreements.length === 0) {
      return res.status(404).json({ message: `No agreements found for user type: ${userType}.` });
    }

    const agreementsWithDetails = [];
    for (const agreement of agreements) {
      let userDetails = null;

      // Fetch user details based on userType and userId
      switch (agreement.userType) {
        case 'SuperAdmin':
          userDetails = await SuperAdmin.findById(agreement.userId);
          break;
        case 'Agent':
          userDetails = await Agent.findById(agreement.userId);
          break;
        case 'Customer':
          userDetails = await Customer.findById(agreement.userId);
          break;
      }
      
      const termsDetails = await TermsAndConditions.findById(agreement.termsId);

      if (userDetails && termsDetails) {
        agreementsWithDetails.push({
          ...agreement._doc,
          name: userDetails.name,
          email: userDetails.email,
          termsDetails: termsDetails,
        });
      }
    }

    res.json(agreementsWithDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching all agreements.' });
  }
});

// Get a specific terms and conditions document by its ID
router.get('/:termsId', async (req, res) => {
  const { termsId } = req.params;

  try {
    const terms = await TermsAndConditions.findById(termsId);

    if (!terms) {
      return res.status(404).json({ message: 'Terms and conditions document not found.' });
    }

    res.json(terms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;