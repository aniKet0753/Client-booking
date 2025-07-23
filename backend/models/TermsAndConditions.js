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
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TermsAndConditions', termsAndConditionsSchema);