const mongoose = require('mongoose');

const userAgreementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  userType: {
    type: String,
    enum: ['SuperAdmin', 'Agent', 'Customer'],
    required: true,
  },
  termsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TermsAndConditions',
    required: true,
  },
  agreedAt: {
    type: Date,
    default: Date.now,
  },
});

// // To ensure a user can only agree to a specific version once
// userAgreementSchema.index({ userId: 1, userType: 1, termsId: 1 }, { unique: true });

module.exports = mongoose.model('UserAgreement', userAgreementSchema);