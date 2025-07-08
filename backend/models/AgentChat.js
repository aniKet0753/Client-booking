// models/AgentChat.js
const mongoose = require('mongoose');

const agentChatSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
  },
  sender: { // Who sent the message (Superadmin or Agent)
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel', // Dynamically reference 'User' or 'Agent'
    required: true,
  },
  senderModel: { // Stores the model name for 'sender' field
    type: String,
    required: true,
    enum: ['User', 'Agent'], // 'User' for Superadmin, 'Agent' for Agent
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AgentChat', agentChatSchema);