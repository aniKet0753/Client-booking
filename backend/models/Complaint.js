const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  subject: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  preferredResolution: { type: String },
  agentInfo: {
    id: { type: String, ref: 'Agent' },
    name: { type: String },
    location: { type: String }
  },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  adminReplies: [{
    message: { type: String, required: true },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    createdAt: { type: Date, default: Date.now },
    isInternal: { type: Boolean, default: false } // false = customer reply, true = agent message
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);