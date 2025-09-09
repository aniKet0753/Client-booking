const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config(); // Make sure your .env file is configured for RAZORPAY_WEBHOOK_SECRET
const path = require('path');

// --- Configuration ---
// The URL where your webhook endpoint is listening
const webhookURL = 'http://localhost:5001/webhook'; // Adjust port if necessary

// --- IMPORTANT: REPLACE WITH ACTUAL IDs FROM YOUR DATABASE ---
// For this test to be successful, the bookingID and tourID MUST exist in your MongoDB.
// If agentID is provided, that agent MUST also exist.
const TEST_BOOKING_ID = 'BKG92766'; // <--- REPLACE WITH A REAL, EXISTING BOOKING ID FROM YOUR DB
const TEST_TOUR_ID = "683ffccfacd27af1ffd55618"; // <--- REPLACE WITH A REAL, EXISTING TOUR ID FROM YOUR DB
const TEST_AGENT_ID = '000A-032-2025-000L'; // <--- REPLACE WITH A REAL, EXISTING AGENT ID, or use '' for direct customer booking

// --- Payment Details (simulating Razorpay notes) ---
// These values should reflect the actual booking details that would be passed by your frontend
// when creating the Razorpay order.
const tourPricePerHead = 2000; // Price per person for the tour
const tourGivenOccupancy = 1; // Number of people included in THIS payment/booking
const tourActualOccupancy = 50; // Total expected occupancy for the tour (from Tour model)
const GST_PERCENTAGE = 10; // GST percentage

const baseAmountForBooking = tourPricePerHead * Number(tourGivenOccupancy); // Base amount for this specific booking
const gstAmount = (baseAmountForBooking * GST_PERCENTAGE) / 100;
const finalAmountWithGST = baseAmountForBooking + gstAmount; // Total amount to be paid (in Rupees)

// Razorpay expects amount in paisa
const razorpayAmountInPaisa = finalAmountWithGST * 100;

// Current Unix timestamp for payment creation date
const currentUnixTimestamp = Math.floor(Date.now() / 1000);

// Sample payload mimicking a 'payment.captured' event from Razorpay
const samplePayload = {
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: `pay_MOCK_${Date.now()}`, // Unique transaction ID for each test run
        amount: razorpayAmountInPaisa, // Amount in paisa
        currency: 'INR',
        status: 'captured',
        method: 'card',
        created_at: currentUnixTimestamp,
        email: 'testuser@example.com', // Customer email (can be pulled from booking later)
        contact: '9876543210', // Customer contact (can be pulled from booking later)
        notes: {
          // These notes are crucial and should match what your Razorpay order creation sends
          bookingID: TEST_BOOKING_ID,
          agentID: TEST_AGENT_ID, // Use TEST_AGENT_ID or leave empty '' for direct booking
          tourID: TEST_TOUR_ID,
          tourName: 'Varanasi Spiritual Journey', // Ensure this matches the tour name for TEST_TOUR_ID
          tourPricePerHead: String(tourPricePerHead), // Convert to string as Razorpay notes are strings
          tourActualOccupancy: String(tourActualOccupancy),
          tourGivenOccupancy: String(tourGivenOccupancy),
          tourStartDate: '2025-08-12', // YYYY-MM-DD format, or '2025-08-12T00:00:00.000Z' if your notes expect full ISO string
          GST: String(GST_PERCENTAGE),
          finalAmount: String(finalAmountWithGST), // Total amount for this specific payment (in Rupees)
        }
      }
    }
  }
};

// Function to generate the Razorpay webhook signature
const generateSignature = (body, secret) => {
  return crypto.createHmac('sha256', secret)
    .update(body)
    .digest('hex');
};

// --- Main execution block ---
(async () => {
  // Ensure Razorpay Webhook Secret is loaded from environment variables
  const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!razorpayWebhookSecret) {
    console.error("Error: RAZORPAY_WEBHOOK_SECRET environment variable is not set.");
    console.error("Please set it in your .env file or directly in the script for testing.");
    return;
  }

  try {
    // Stringify the payload for signature generation
    const payloadStr = JSON.stringify(samplePayload);
    const signature = generateSignature(payloadStr, razorpayWebhookSecret);

    console.log('--- Sending Webhook Request ---');
    console.log('Webhook URL:', webhookURL);
    console.log('Payload (notes section is key):', samplePayload.payload.payment.entity.notes);
    console.log('Generated signature:', signature);

    // Send the POST request to the webhook endpoint
    const response = await axios.post(webhookURL, samplePayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature // Include the generated signature
      },
      // This transformRequest ensures the exact stringified payload is used for signature verification
      // on the server side, mimicking how Express's `req.rawBody` would capture it.
      transformRequest: [(data) => {
        return JSON.stringify(data);
      }]
    });

    console.log('\n--- Webhook Response ---');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('------------------------');
    console.log('Test completed. Check your MongoDB and Master Data Dashboard for updates.');

  } catch (error) {
    console.error('\n--- Error Sending Webhook ---');
    if (error.response) {
      // The server responded with an error status code
      console.error('Status:', error.response.status);
      console.error('Response Data:', error.response.data);
      console.error('Response Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received (e.g., server not running)
      console.error('No response received. Is your backend server running at', webhookURL, '?');
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
    console.error('----------------------------');
  }
})();
