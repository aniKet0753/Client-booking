const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    tourID: { type: String, required: true },
    agentID: { type: String, default: 'N/A' }, // Can be N/A for direct bookings
    customerEmail: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    tourPricePerHead: { type: Number, required: true },
    tourActualOccupancy: { type: Number, required: true },
    tourGivenOccupancy: { type: Number, required: true },
    tourStartDate: { type: String, required: true }, // Or Date type if you prefer
    commissions: [
        {
            tourID: String,
            agentID: String,
            level: Number,
            commissionAmount: Number,
            commissionRate: Number,
            commissionPaid: {type: Boolean, default: false},
            commissionPaidDate: { type: String }, // Or Date type if you prefer,
            commissionDeductionAmount: {type:Number, default: 0}
        }
    ],
    finalAmount: { type: Number, required: true },
    travelers: [
        {
            name: { type: String, required: true },
            age: { type: Number },
            gender: { type: String, enum: ['male', 'female', 'other'] },
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);

// const mongoose = require('mongoose');

// const commissionSchema = new mongoose.Schema({
//   tourID: String,
//   agentID: String,
//   level: Number,
//   commissionAmount: Number,
//   commissionRate: Number,
//   commissionDeductionAmount: {type:Number, default: 0}
// }, { _id: false });

// const transactionSchema = new mongoose.Schema({
//   customerEmail: String,
//   transactionId: String,
//   tourPricePerHead: Number,
//   totalPriceTour: Number,
//   tourActualOccupancy: Number,
//   tourGivenOccupancy: Number,
//   tourStartDate: String,
//   tourID: String,
//   agentID: String,
//   commissions: [commissionSchema],
//   cancellationRequested: { type: Boolean, default: false },
//   cancellationApproved: { type: Boolean, default: false },
//   cancellationRejected: { type: Boolean, default: false },
//   refundAmount: { type: Number },
//   deductionPercentage: { type: Number },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Transaction', transactionSchema);
