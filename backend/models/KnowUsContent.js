const mongoose = require('mongoose');

const knowUsContentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'mainKnowUsDoc'
  },
  heading: {
    type: String,
    required: true,
    default: 'Get to Know Us'
  },
  paragraph1: {
    type: String,
    required: true,
    default: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
  },
  paragraph2: {
    type: String,
    required: true,
    default: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...'
  },
  paragraph3: {
    type: String,
    required: true,
    default: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...'
  },
  // Changed fields to store Base64 image data
  image1Base64: {
    type: String,
    default: ""
  },
  image2Base64: {
    type: String,
    default: ""
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

// Pre-save hook to ensure only one document with _id 'mainKnowUsDoc'
knowUsContentSchema.pre('save', async function(next) {
  if (this.isNew && this._id !== 'mainKnowUsDoc') {
    this._id = 'mainKnowUsDoc';
  }
  next();
});

module.exports = mongoose.model('KnowUsContent', knowUsContentSchema);
