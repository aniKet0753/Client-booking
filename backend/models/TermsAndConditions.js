const mongoose = require('mongoose');

const tableDataSchema = new mongoose.Schema({
  headers: [{ type: String, required: true }],
  rows: [[{ type: String, required: true }]]
});

const sectionSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  type: { type: String, enum: ['paragraph', 'table'], required: true },
  content: { type: String }, // Used for paragraph sections
  tableData: tableDataSchema // Used for table sections
});

const termsAndConditionsSchema = new mongoose.Schema({
  mainHeader: { type: String, required: true },
  introText: { type: String },
  sections: [sectionSchema],
  footerNotes: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ['agents', 'homepage', 'tour'],
    required: true,
  },
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour', // Assuming you have a Tour model
    required: function() { return this.type === 'tour'; } // tourId is required only if type is 'tour'
  }
});

// To ensure a unique T&C document for each type (and tourId where applicable).
termsAndConditionsSchema.index({ type: 1, tourId: 1 }, { unique: true });

module.exports = mongoose.model('TermsAndConditions', termsAndConditionsSchema);