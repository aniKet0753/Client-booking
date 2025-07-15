const express = require('express');
const crypto = require('crypto');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat); // Extend dayjs once globally

const router = express.Router();
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const Agent = require('../models/Agent');
const AgentTourStats = require('../models/AgentTourStats');
const Tours = require('../models/Tour');

// Ensure this secret is loaded from environment variables in your main app file
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// Helper function for commission rates (as provided by you)
function getCommissionRate(percentageOnboarded, level) {
    if (percentageOnboarded >= 65) {
        return level === 1 ? 10 : 5; // Level 1: 10%, Level 2 (Parent): 5%
    } else if (percentageOnboarded >= 45) {
        return level === 1 ? 8.5 : 3.5; // Level 1: 8.5%, Level 2 (Parent): 3.5%
    } else {
        return level === 1 ? 7 : 2.5; // Level 1: 7%, Level 2 (Parent): 2.5%
    }
}

// Refined transferCommission function
// This function now primarily collects commission records.
// Actual wallet updates are done in the main webhook handler.
const transferCommission = async (agentId, currentPaymentValue, updatedPercentage, commissionDeltaForDirectAgent, tourID, commissionRecords) => {
    try {
        const agent = await Agent.findById(agentId);
        if (!agent) {
            console.warn(`Agent with ID ${agentId} not found for commission transfer.`);
            return; // Exit if agent not found
        }

        // Commission for the direct agent (level 1) - this should be commissionDeltaForDirectAgent
        // as per your current logic which calculates the *increase* for the agent's earned commission
        commissionRecords.push({
            tourID,
            agentID: agent.agentID, // Use agent's public agentID
            level: 1,
            commissionAmount: commissionDeltaForDirectAgent,
            commissionRate: getCommissionRate(updatedPercentage, 1),
        });
        console.log(`Prepared Level 1 commission: ₹${commissionDeltaForDirectAgent} to ${agent.agentID}`);


        // Commission for the parent agent (level 2)
        if (agent.parentAgent) {
            const parent = await Agent.findById(agent.parentAgent);
            if (parent) {
                const parentCommissionRate = getCommissionRate(updatedPercentage, 2); // Level 2 rate
                // Parent commission should be based on the current transaction amount
                const parentCommission = (currentPaymentValue * parentCommissionRate) / 100;

                commissionRecords.push({
                    tourID,
                    agentID: parent.agentID, // Use parent's public agentID
                    level: 2,
                    commissionAmount: parentCommission,
                    commissionRate: parentCommissionRate,
                });
                console.log(`Prepared Level 2 (Parent) commission: ₹${parentCommission} to ${parent.agentID}`);
            } else {
                console.warn(`Parent agent with ID ${agent.parentAgent} not found for commission transfer.`);
            }
        }
    } catch (error) {
        console.error('Error in transferCommission:', error.message);
    }
};


router.post('/', express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }), async (req, res) => {
    console.log("Razorpay webhook hit.");
    const razorpaySignature = req.headers['x-razorpay-signature'];
    const payload = req.rawBody.toString(); // Convert buffer to string for HMAC

    console.log("Received payload:", payload); // Log full payload for debugging
    // console.log("Received signature:", razorpaySignature);

    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

    if (razorpaySignature !== expectedSignature) {
        console.error('Invalid Razorpay webhook signature. Expected:', expectedSignature, 'Received:', razorpaySignature);
        return res.status(400).send('Invalid signature'); // Send status directly without JSON
    }

    const event = req.body;

    if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;

        // Ensure notes exist and have required data
        if (!payment.notes || !payment.notes.bookingID || !payment.notes.tourID || !payment.notes.tourName) {
            console.error("Missing critical payment notes data (bookingID, tourID, or tourName). Notes:", payment.notes);
            return res.status(400).json({ error: "Missing critical payment notes data (bookingID, tourID, or tourName)." });
        }

        const {
            bookingID,
            tourID,
            tourName,
            agentID, // This could be '' for direct customers
            tourPricePerHead,
            tourActualOccupancy,
            tourGivenOccupancy,
            tourStartDate,
            GST,
            finalAmount, // Total amount from Razorpay order creation (includes base + GST)
        } = payment.notes;

        const transactionId = payment.id;
        const currentPaymentAmount = parseFloat(payment.amount) / 100; // Razorpay amount is in paisa
        const paymentMethod = payment.method;

        // Basic validation for critical numbers
        if (isNaN(currentPaymentAmount) || isNaN(parseFloat(tourPricePerHead)) || isNaN(parseFloat(tourActualOccupancy)) || isNaN(parseFloat(tourGivenOccupancy)) || isNaN(parseFloat(GST)) || isNaN(parseFloat(finalAmount))) {
             console.error("Invalid numeric data in payment notes:", payment.notes);
             return res.status(400).json({ error: "Invalid numeric data in payment notes." });
        }


        try {
            // Find the existing booking
            const existingBooking = await Booking.findOne({ bookingID: bookingID });

            if (!existingBooking) {
                console.error(`Booking with ID ${bookingID} not found. Cannot update.`);
                return res.status(404).json({ error: `Booking with ID ${bookingID} not found.` });
            }

            // Update the existing booking's status and payment information
            existingBooking.status = 'confirmed';
            existingBooking.payment = {
                totalAmount: parseFloat(finalAmount), // Use finalAmount from notes as total
                paidAmount: currentPaymentAmount,
                paymentStatus: 'Paid',
                paymentMethod: paymentMethod,
                transactionId: transactionId,
                paymentDate: new Date(payment.created_at * 1000), // Convert Unix timestamp to Date object
                breakdown: [
                    { item: `Base Price (${tourGivenOccupancy} pax)`, amount: parseFloat(tourPricePerHead) * parseFloat(tourGivenOccupancy) },
                    { item: 'GST', amount: parseFloat(GST) }
                ]
            };

            if (!existingBooking.tour) existingBooking.tour = {};
            existingBooking.tour.tourID = tourID;

            await existingBooking.save();
            console.log("Existing booking updated successfully:", existingBooking.bookingID);

            // Now, get customer and travelers details FROM THE UPDATED BOOKING
            const customerEmail = existingBooking.customer.email; // Get email from existing booking
            const travelersFromBooking = existingBooking.travelers; // Get travelers from existing booking

            // Format tour start date
            const formattedTourStartDate = dayjs(tourStartDate).format('YYYY-MM-DD');

            // Find the tour to update remaining occupancy
            const tour = await Tours.findById(tourID);
            if (!tour) {
                console.error(`Tour with ID ${tourID} not found for occupancy update.`);
                return res.status(404).json({ error: 'Tour not found' });
            }

            // Update tour's remaining occupancy
            tour.remainingOccupancy -= parseFloat(tourGivenOccupancy);
            if (tour.remainingOccupancy < 0) {
                tour.remainingOccupancy = 0; // Ensure it doesn't go below zero
            }
            await tour.save();
            console.log(`Tour ${tourID} remaining occupancy updated to: ${tour.remainingOccupancy}`);


            const commissionRecords = []; // To collect all commissions for the transaction
            let directAgentCommissionAmount = 0; // To store the commission for the direct agent for the booking model

            if (agentID && agentID !== '') {
                // Booking via agent
                const agent = await Agent.findOne({ agentID });
                if (!agent) {
                    console.error(`Agent with agentID ${agentID} not found.`);
                } else {
                    const agent_db_id = agent._id; // Mongoose _id
                    // __________________
                        // let check1 = await AgentTourStats.findOne({agentID: agent.agentID});
                        // let check2 = await AgentTourStats.findOne({tourStartDate: formattedTourStartDate});
                        // let check3 = await AgentTourStats.findOne({tourID});

                        // if(check1)
                        // console.log("object1");
                        // if(check2)
                        // console.log("object2");
                        // if(check3)
                        // console.log("object3");
                    // __________________
                    let stats = await AgentTourStats.findOne({ agentID: agent.agentID, tourStartDate: formattedTourStartDate, tourID }); // Use agent.agentID for stats lookup
                    if (!stats) {
                        stats = new AgentTourStats({
                            agentID: agent.agentID,
                            tourStartDate: formattedTourStartDate,
                            tourID,
                            customerGiven: 0,
                            finalAmount: 0,
                            commissionReceived: 0,
                        });
                    }

                    // Update stats
                    const givenCustomerCount = parseFloat(tourGivenOccupancy);
                    const addedAmountToStats = givenCustomerCount * parseFloat(tourPricePerHead); // Base price without GST for commission calculation
                    const newCustomerGiven = stats.customerGiven + givenCustomerCount;
                    const updatedPercentage = (newCustomerGiven / parseFloat(tourActualOccupancy)) * 100;

                    const newTotalAmountForStats = stats.finalAmount + addedAmountToStats; // Cumulative amount for stats
                    console.log(newTotalAmountForStats, stats.finalAmount, addedAmountToStats)
                    const newCommissionRateForStats = getCommissionRate(updatedPercentage, 1); // Rate for the direct agent based on *new* cumulative percentage
                    const newTotalEligibleCommissionForStats = (newTotalAmountForStats * newCommissionRateForStats) / 100; // New cumulative eligible commission

                    // console.log(newTotalAmountForStats, newCommissionRateForStats);
                    // This is the actual commission to *add* to the direct agent's wallet for *this* payment
                    const commissionDelta = newTotalEligibleCommissionForStats - stats.commissionReceived;

                    if (commissionDelta > 0) {
                        await transferCommission(agent_db_id, currentPaymentAmount, updatedPercentage, commissionDelta, tourID, commissionRecords);
                    }
                    directAgentCommissionAmount = commissionDelta; // Store for the transaction model

                    // Update and save agent stats

                    console.log(newTotalEligibleCommissionForStats)
                    stats.customerGiven = newCustomerGiven;
                    stats.finalAmount = newTotalAmountForStats;
                    stats.commissionReceived = newTotalEligibleCommissionForStats;
                    console.log("stats:",stats);
                    await stats.save();
                    console.log(`AgentTourStats updated for agent ${agent.agentID}.`);

                    // Also update the agent's commission in the existing booking if it was provided
                    // Note: If you want to sum commissions in the booking, you'd need to modify existingBooking.agent.commission += directAgentCommissionAmount;
                    // For now, we are just using it to save into the transaction.
                }
            } else {
                console.log("Direct customer booking - no agent involved.");
            }

            // Create and save the Transaction
            const newTransaction = new Transaction({
                tourID,
                agentID: agentID || 'N/A', // Save agentID or 'N/A' for direct
                customerEmail,
                transactionId,
                tourPricePerHead,
                tourActualOccupancy,
                tourGivenOccupancy,
                tourStartDate: formattedTourStartDate,
                commissions: commissionRecords,
                finalAmount: currentPaymentAmount, // Final amount of this specific transaction
                travelers: travelersFromBooking, // <<< NEW: Add travelers from the existing booking
            });

            await newTransaction.save();
            console.log('Transaction saved successfully:', newTransaction.transactionId);

            // Update agent wallet balances based on collected commission records
            for (const record of commissionRecords) {
                const agentToUpdate = await Agent.findOneAndUpdate(
                    { agentID: record.agentID },
                    { $inc: { walletBalance: record.commissionAmount } },
                    { new: true } // Return the updated document
                );
                if (agentToUpdate) {
                    console.log(`Successfully added ₹${record.commissionAmount.toFixed(2)} to the wallet of agent ${agentToUpdate.agentID} (${agentToUpdate.name}). New balance: ₹${agentToUpdate.walletBalance.toFixed(2)}`);
                } else {
                    console.warn(`Could not find agent ${record.agentID} to update wallet balance.`);
                }
            }

            res.status(200).json({ received: true, bookingId: existingBooking.bookingID, transactionId: newTransaction.transactionId });

        } catch (err) {
            console.error('Error processing Razorpay payment.captured webhook:', err);
            // Log full error details for debugging
            if (err.name === 'ValidationError') {
                console.error('Mongoose Validation Error:', err.errors);
                return res.status(400).json({ error: 'Validation error saving data.', details: err.message });
            }
            res.status(500).json({ error: 'Internal server error processing webhook.', details: err.message });
        }
    } else {
        console.log(`Webhook event received: ${event.event}, but not handled.`);
        res.status(200).json({ message: 'Webhook received but event not handled' });
    }
});


module.exports = router;