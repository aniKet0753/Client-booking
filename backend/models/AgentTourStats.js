const mongoose = require('mongoose');

const agentTourStatsSchema = new mongoose.Schema({
  tourID: String,
  agentID: {type: String, ref:'Agent'},
  tourStartDate: String,
  customerGiven: { type: Number, default: 0 },
  finalAmount: { type: Number, default: 0 },
  commissionReceived: { type: Number, default: 0 },
  CommissionPaid:{ type: Boolean , default: false },
  CommissionPaidDate:{type: String}
});

module.exports = mongoose.model('AgentTourStats', agentTourStatsSchema);