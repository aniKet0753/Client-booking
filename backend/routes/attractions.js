const express = require('express');
const router = express.Router();
const Attraction = require('../models/Attraction');
const authenticateSuperAdmin = require('../middleware/authSuperadminMiddleware');
// GET all attractions
router.get('/', async (req, res) => {
    try {
        const attractions = await Attraction.find();
        res.status(200).json(attractions);
        console.log("object");
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// POST a new attraction with a Base64 encoded image
router.post('/', authenticateSuperAdmin, async (req, res) => {
    try {
        console.log("object")
        const { title, description, icon, image } = req.body;

        const newAttraction = new Attraction({
            title,
            description,
            icon,
            image,
        });

        const savedAttraction = await newAttraction.save();
        res.status(201).json(savedAttraction);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
});

// PUT to update an attraction
router.put('/:id', authenticateSuperAdmin, async (req, res) => {
    try {
        const updatedAttraction = await Attraction.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updatedAttraction) {
            return res.status(404).json({ message: 'Attraction not found' });
        }
        res.status(200).json(updatedAttraction);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE an attraction
router.delete('/:id', authenticateSuperAdmin, async (req, res) => {
    try {
        const deletedAttraction = await Attraction.findByIdAndDelete(req.params.id);
        if (!deletedAttraction) {
            return res.status(404).json({ message: 'Attraction not found' });
        }
        res.status(200).json({ message: 'Attraction deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;