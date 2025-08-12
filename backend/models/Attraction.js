const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String, required: true },
    image: { type: String }, // Stores the Base64 string
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attraction', attractionSchema);