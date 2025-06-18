// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingID: {
        type: String,
        required: true,
        unique: true,
        description: "Unique Booking ID, e.g., 'BKG12345'"
    },
    status: {
        type: String,
        required: true,
        enum: ['confirmed', 'pending', 'cancelled', 'completed'],
        default: 'pending',
        description: "Status of the booking"
    },
    bookingDate: {
        type: Date,
        required: true,
        default: Date.now,
        description: "Date and time the booking was made"
    },
    tour: {
        tourID: { type: mongoose.Schema.Types.ObjectId, required: true }, // Tour ID reference
        name: { type: String, required: true },
        image: { type: String, required: true },
        categoryType: { type: String, required: true },
        country: { type: String, required: true },
        tourType: { type: String, required: true },
        pricePerHead: { type: Number, required: true },
        GST: { type: Number, required: true },
        duration: { type: Number, required: true },
        occupancy: { type: Number, required: true },
        remainingOccupancy: { type: Number, required: true },
        startDate: { type: Date, required: true },
        description: { type: String, required: true },
        highlights: [{ type: String }],
        inclusions: [{ type: String }],
        exclusions: [{ type: String }],
        thingsToPack: [{ type: String }],
        itinerary: [
        {
            dayNumber: { type: Number, required: true },
            title: { type: String, required: true },
            description: { type: String },
            activities: [ // Array of activity objects
            {
                type: { type: String, required: true },
                title: { type: String, required: true },
                description: String,
                time: String
            }
            ]
        }
        ],
        gallery: [{ type: String }]
    },
    customer: {
        id:{ type: mongoose.Schema.Types.ObjectId , required: true},
        name: {
            type: String,
            required: true,
            description: "Full name of the customer"
        },
        email: {
            type: String,
            required: true,
            description: "Email address of the customer"
        },
        phone: {
            type: String,
            description: "Phone number of the customer"
        },
        address: {
            type: String,
            description: "Full address of the customer"
        },
        altPhone: String,
        dob: String,
        age: String,
        gender: String,
        aadhar: String,
        pan: String,
        whatsapp: String,
        disability: String,
        medicalCondition: String,
        medicalInsurance: String,
    },
    travelers: [
        {
            name: { type: String, required: true },
            age: { type: Number, required: true },
            gender: { type: String, enum: ['male', 'female', 'other'], required: true },
            idType: { type: String },
            idNumber: { type: String },
        }
    ],
    payment: {
        totalAmount: {
            type: Number,
            required: false,
            description: "Total amount of the booking"
        },
        paidAmount: {
            type: Number,
            required: false,
            description: "Amount already paid by the customer"
        },
        paymentStatus: {
            type: String,
            required: false,
            enum: ['Paid', 'Pending', 'Refunded', 'Failed'],
            description: "Status of the payment"
        },
        paymentMethod: {
            type: String,
            required: false,
            description: "Method used for payment (e.g., Credit Card, Bank Transfer)"
        },
        transactionId: {
            type: String,
            required: false,
            description: "Unique transaction ID from the payment gateway"
        },
        paymentDate: {
            type: Date,
            required: false,
            description: "Date and time of the payment"
        },
        breakdown: [
            {
                item: { type: String, required: false },
                amount: { type: Number, required: false }
            }
        ]
    },
    agent: {
        agentId: {
            type: String,
            description: "ID of the booking agent"
        },
        name: {
            type: String,
            description: "Name of the booking agent/agency"
        },
        commission: {
            type: Number,
            description: "Commission amount for the agent"
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);