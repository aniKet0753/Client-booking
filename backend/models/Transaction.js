const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  tourID: String,
  agentID: String,
  level: Number,
  commissionAmount: Number,
  commissionRate: Number,
  commissionDeductionAmount: {type:Number, default: 0}
}, { _id: false });

const transactionSchema = new mongoose.Schema({
  customerEmail: String,
  transactionId: String,
  tourPricePerHead: Number,
  totalPriceTour: Number,
  tourActualOccupancy: Number,
  tourGivenOccupancy: Number,
  tourStartDate: String,
  tourID: String,
  agentID: String,
  commissions: [commissionSchema],
  cancellationRequested: { type: Boolean, default: false },
  cancellationApproved: { type: Boolean, default: false },
  cancellationRejected: { type: Boolean, default: false },
  refundAmount: { type: Number },
  deductionPercentage: { type: Number },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
