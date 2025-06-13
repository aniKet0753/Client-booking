const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingID: {
        type: String, // Use String to match your bookingId format, e.g., 'BKG12345'
        required: true,
        unique: true,
        description: "Unique Booking ID"
    },
    status: {
        type: String,
        required: true,
        enum: ['confirmed', 'pending', 'cancelled', 'completed'],
        default: 'confirmed', // Assuming payment.captured means confirmed
        description: "Status of the booking"
    },
    bookingDate: {
        type: Date,
        required: true,
        default: Date.now, // Set default to current time
        description: "Date and time the booking was made"
    },
    tour: {
        tourId: {
            type: String, // Reference to a separate 'tours' collection or service
            required: true,
            description: "ID of the booked tour, used to fetch full tour details"
        },
        // Optional: you might want to store the tour name here for easier display
        // without an extra lookup in some cases, even if you fetch full details
        // name: { type: String, required: true, description: "Name of the tour" }
    },
    customer: {
        // customerId: { // Uncomment if you have a separate customer user model
        //     type: String,
        //     description: "ID of the customer who made the booking"
        // },
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
        }
    },
    travelers: [
        {
            name: { type: String, required: true },
            age: { type: Number },
            gender: { type: String, enum: ['male', 'female', 'other'] },
            
        }
    ],
    payment: {
        totalAmount: {
            type: Number,
            required: true,
            description: "Total amount of the booking"
        },
        paidAmount: {
            type: Number,
            required: true,
            description: "Amount already paid by the customer"
        },
        paymentStatus: {
            type: String,
            required: true,
            enum: ['Paid', 'Pending', 'Refunded', 'Failed'],
            default: 'paid', // Assuming payment.captured means paid
            description: "Status of the payment"
        },
        paymentMethod: {
            type: String,
            description: "Method used for payment (e.g., Credit Card, Bank Transfer)"
        },
        transactionId: {
            type: String,
            description: "Unique transaction ID from the payment gateway"
        },
        paymentDate: {
            type: Date,
            description: "Date and time of the payment"
        },
        breakdown: [
            {
                item: { type: String, required: true },
                amount: { type: Number, required: true }
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
}); 

module.exports = mongoose.model('Booking', bookingSchema);