const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const webhookURL = 'http://localhost:5001/webhook';

// --- IMPORTANT: REPLACE WITH AN ACTUAL BOOKING ID FROM YOUR DATABASE ---
// This booking ID must exist in your MongoDB for the webhook to find and update it.
const TEST_BOOKING_ID = 'BKG48020'; // <--- MUST CHANGE THIS TO A REAL BOOKING ID

const tourPricePerHead = 9000;
const tourGivenOccupancy = 1 ;
const tourActualOccupancy = 50;
const totalAmount = tourPricePerHead * Number(tourGivenOccupancy); // in ₹
const GST = 18;
const gstAmount = (totalAmount * GST) / 100;
const finalAmount = totalAmount + gstAmount;
const currentUnixTimestamp = Math.floor(Date.now() / 1000);

const samplePayload = {
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: 'pay_MOCK123458', // Unique transaction ID for this test
        amount: finalAmount * 100, // Razorpay amount is in paisa
        currency: 'INR',
        status: 'captured',
        method: 'card',
        created_at: currentUnixTimestamp,
        email: 'testuser@example.com',
        contact: '9876543210',
        notes: {
          bookingID: TEST_BOOKING_ID, // <--- ADDED THIS CRITICAL FIELD
          agentID: '', // Keep empty for direct customer test, or put an existing agentID
          tourID: '683ed99b3a44a7ade21e2d31', // <--- REPLACE WITH AN ACTUAL TOUR ID FROM YOUR DATABASE
          tourName: 'Digha', // <--- ADDED THIS CRITICAL FIELD (match tourID's name)
          tourPricePerHead: String(tourPricePerHead),
          tourActualOccupancy: String(tourActualOccupancy),
          tourGivenOccupancy: String(tourGivenOccupancy),
          tourStartDate: '2025-08-12T00:00:00.000Z', // Or '2025-08-12'
          GST: String(GST),
          finalAmount: String(finalAmount),
          // Customer and Travelers details are usually part of the Booking document itself,
          // but if your system passes them in notes for initial booking creation, keep them.
          // For webhook updates, typically the bookingID is enough to find the associated data.
        }
      }
    }
  }
};

const generateSignature = (body, secret) => {
  return crypto.createHmac('sha256', secret)
    .update(body)
    .digest('hex');
};

(async () => {
  try {
    const payloadStr = JSON.stringify(samplePayload);
    const signature = generateSignature(payloadStr, process.env.RAZORPAY_WEBHOOK_SECRET);

    console.log('Sending webhook payload:', samplePayload);
    console.log('Generated signature:', signature);

    const response = await axios.post(webhookURL, samplePayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      },
      transformRequest: [(data) => {
        // This simulates Express's `req.rawBody` for webhook signature verification.
        // It ensures the exact stringified payload is used for signature generation.
        return JSON.stringify(data);
      }]
    });

    console.log('\n--- Webhook Response ---');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('------------------------');

  } catch (error) {
    console.error('\n--- Error Sending Webhook ---');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    console.error('----------------------------');
  }
})();