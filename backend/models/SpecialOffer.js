const mongoose = require('mongoose');

const specialOfferSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String }, // Stores the Base64 string
    validity: { type: Date },
    badge: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SpecialOffer', specialOfferSchema);