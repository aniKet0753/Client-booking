const express = require('express');
const router = express.Router();
const SpecialOffer = require('../models/SpecialOffer');
const authenticateSuperAdmin = require('../middleware/authSuperadminMiddleware');

// GET all special offers
router.get('/', async (req, res) => {
    try {
        const offers = await SpecialOffer.find();
        res.status(200).json(offers);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// POST a new special offer with a Base64 encoded image
router.post('/', authenticateSuperAdmin, async (req, res) => {
    try {
        const { title, description, image, validity, badge, isActive } = req.body;

        const newOffer = new SpecialOffer({
            title,
            description,
            image,
            validity,
            badge,
            isActive
        });

        const savedOffer = await newOffer.save();
        res.status(201).json(savedOffer);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
});

// PUT to update a special offer
router.put('/:id', authenticateSuperAdmin, async (req, res) => {
    try {
        const updatedOffer = await SpecialOffer.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updatedOffer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json(updatedOffer);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE a special offer
router.delete('/:id', authenticateSuperAdmin, async (req, res) => {
    try {
        const deletedOffer = await SpecialOffer.findByIdAndDelete(req.params.id);
        if (!deletedOffer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json({ message: 'Offer deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;