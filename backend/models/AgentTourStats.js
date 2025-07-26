// models/AgentTourStats.js
const mongoose = require('mongoose');

const agentTourStatsSchema = new mongoose.Schema({
    // Link to the specific booking document (using its ObjectId)
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true // Ensures one AgentTourStats record per booking
    },
    // Denormalized bookingID string for convenience and CSV generation
    bookingStringID: {
        type: String,
        required: true, // This will store the string bookingID from the Booking model
        unique: true // Should also be unique as it's tied to a unique booking
    },
    // Link to the agent document (using its ObjectId)
    agent: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Agent', 
        required: true
    },
    // Denormalized agentID string for convenience and CSV generation
    agentID: {
        type: String,
        required: true // This will store the string agentID from the Agent model
    },
    // Denormalized fields from Booking/Tour for convenience in this model
    tourID: { type: String, required: true }, // From booking.tour.tourID (this is also a string ID for the tour)
    tourName: { type: String }, // From booking.tour.name
    tourStartDate: { type: String }, // From booking.tour.startDate
    tourPricePerHead: { type: Number }, // From booking.tour.pricePerHead
    totalOccupancy: { type: Number }, // From booking.tour.occupancy
    bookingDate: { type: String }, // From booking.bookingDate
    customerGiven: { type: Number }, // Number of travelers in the booking, excluding the main customer if applicable
    commissionReceived: { type: Number, default: 0 },
    CommissionPaid: { type: Boolean, default: false },
    CommissionPaidDate: { type: String },
    commissionRate: { type: Number }, // Percentage or fixed rate
    commissionDeductionAmount: {type:Number, default: 0}, // Amount deducted due to cancellations
    // Fields for tracking adults/children from the booking's travelers array
    adultsCount: { type: Number, default: 0 },
    childrenCount: { type: Number, default: 0 },
    cancelledTravelersCount: { type: Number, default: 0 }, // Count of travelers cancelled within this booking
}, { timestamps: true });

module.exports = mongoose.model('AgentTourStats', agentTourStatsSchema);