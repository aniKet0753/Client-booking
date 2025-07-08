const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  subject: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  preferredResolution: { type: String },
  agentInfo: {
    id: { type: String, ref: 'Agent' }, // Changed to string as agent might not be a direct Mongoose ref here
    name: { type: String },
    location: { type: String }
  },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  adminReplies: [{
    message: { type: String, required: true },
    // Dynamically references based on repliedByType
    repliedBy: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'adminReplies.repliedByType' },
    // Stores the model name (e.g., 'Customer', 'Admin', 'Superadmin', 'Agent')
    repliedByType: { type: String, required: true, enum: ['Customer', 'Admin', 'Superadmin', 'Agent'] },
    createdAt: { type: Date, default: Date.now },
    // Removed isInternal field
  }],
  agentChat: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AgentChat'
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
complaintSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);