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
            const parent = await Agent.findById(agent.parentAgent); // parentAgent is an ObjectId ref
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

        // Extract and robustly parse numeric values from payment.notes
        const {
            bookingID,
            tourID,
            tourName,
            agentID, // This could be '' for direct customers
            tourStartDate,
        } = payment.notes;

        const parsedTourPricePerHead = parseFloat(payment.notes.tourPricePerHead) || 0;
        const parsedTourActualOccupancy = parseFloat(payment.notes.tourActualOccupancy) || 0;
        const parsedTourGivenOccupancy = parseFloat(payment.notes.tourGivenOccupancy) || 0;
        const parsedGST = parseFloat(payment.notes.GST) || 0;
        const parsedFinalAmount = parseFloat(payment.notes.finalAmount) || 0;


        const transactionId = payment.id;
        const currentPaymentAmount = parseFloat(payment.amount) / 100; // Razorpay amount is in paisa
        const paymentMethod = payment.method;

        // Basic validation for critical numbers (now using parsed values)
        if (isNaN(currentPaymentAmount) || isNaN(parsedTourPricePerHead) || isNaN(parsedTourActualOccupancy) || isNaN(parsedTourGivenOccupancy) || isNaN(parsedGST) || isNaN(parsedFinalAmount)) {
             console.error("Invalid numeric data after parsing payment notes. Check raw notes:", payment.notes);
             return res.status(400).json({ error: "Invalid numeric data in payment notes after parsing." });
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
                totalAmount: parsedFinalAmount, // Use parsedFinalAmount from notes as total
                paidAmount: currentPaymentAmount,
                paymentStatus: 'Paid',
                paymentMethod: paymentMethod,
                transactionId: transactionId,
                paymentDate: new Date(payment.created_at * 1000), // Convert Unix timestamp to Date object
                breakdown: [
                    { item: `Base Price (${parsedTourGivenOccupancy} pax)`, amount: parsedTourPricePerHead * parsedTourGivenOccupancy },
                    { item: 'GST', amount: parsedGST }
                ]
            };

            // Ensure tour subdocument exists before assigning properties
            if (!existingBooking.tour) existingBooking.tour = {};
            existingBooking.tour.tourID = tourID;
            // Assuming other tour details are already populated during booking creation
            // or will be pulled from the Tour model later if needed for the dump.

            // Calculate adults, children, and cancelled travelers from the booking's travelers array
            let adultsCount = 0;
            let childrenCount = 0;
            let cancelledTravelersCount = 0;

            existingBooking.travelers.forEach(traveler => {
                // Ensure age is a number before comparison
                const travelerAge = parseFloat(traveler.age);
                if (!isNaN(travelerAge) && travelerAge >= 12) { // Assuming 12 is the cutoff for adult
                    adultsCount++;
                } else if (!isNaN(travelerAge)) { // If age is a number but less than 12
                    childrenCount++;
                }
                if (traveler.cancellationApproved) {
                    cancelledTravelersCount++;
                }
            });


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
            tour.remainingOccupancy -= parsedTourGivenOccupancy;
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
                    const agent_db_id = agent._id; // Mongoose _id of the agent

                    let stats = await AgentTourStats.findOne({ agent: agent_db_id, tourStartDate: formattedTourStartDate, tourID }); // Use agent._id for stats lookup
                    
                    if (!stats) {
                        // Create new AgentTourStats record with all new fields
                        stats = new AgentTourStats({
                            booking: existingBooking._id, // Link to Booking ObjectId
                            bookingStringID: existingBooking.bookingID, // Store string booking ID
                            agent: agent_db_id, // Link to Agent ObjectId
                            agentID: agent.agentID, // Store string agent ID
                            tourStartDate: formattedTourStartDate,
                            tourID,
                            tourName: tourName, // Use tourName from notes
                            tourPricePerHead: parsedTourPricePerHead, // From notes
                            totalOccupancy: parsedTourActualOccupancy, // From notes
                            bookingDate: existingBooking.bookingDate, // From booking
                            customerGiven: 0, // Will be updated below
                            commissionReceived: 0, // Will be updated below
                            CommissionPaid: false,
                            CommissionPaidDate: null,
                            commissionRate: 0, // Will be updated below
                            commissionDeductionAmount: 0,
                            adultsCount: 0, // Will be updated below
                            childrenCount: 0, // Will be updated below
                            cancelledTravelersCount: 0, // Will be updated below
                        });
                    }

                    // Ensure stats.finalAmount and stats.commissionReceived are numbers before calculation
                    // This is the fix for the NaN error
                    stats.finalAmount = stats.finalAmount || 0;
                    stats.commissionReceived = stats.commissionReceived || 0;


                    // Update stats (for both new and existing records)
                    const givenCustomerCount = parsedTourGivenOccupancy;
                    const addedAmountToStats = givenCustomerCount * parsedTourPricePerHead; // Base price without GST for commission calculation
                    
                    const newCustomerGiven = stats.customerGiven + givenCustomerCount;
                    
                    let updatedPercentage = 0;
                    if (parsedTourActualOccupancy > 0) { // Prevent division by zero
                        updatedPercentage = (newCustomerGiven / parsedTourActualOccupancy) * 100;
                    }
                    // If updatedPercentage still becomes NaN (e.g., 0/0), default it to 0
                    if (isNaN(updatedPercentage)) {
                        updatedPercentage = 0;
                    }

                    const newTotalAmountForStats = stats.finalAmount + addedAmountToStats; // Cumulative amount for stats
                    const newCommissionRateForStats = getCommissionRate(updatedPercentage, 1); // Rate for the direct agent based on *new* cumulative percentage
                    const newTotalEligibleCommissionForStats = (newTotalAmountForStats * newCommissionRateForStats) / 100; // New cumulative eligible commission

                    // Debugging logs for commission calculation
                    console.log(`--- Commission Calculation Debug for Agent ${agent.agentID} ---`);
                    console.log(`  stats.customerGiven (before): ${stats.customerGiven}`);
                    console.log(`  givenCustomerCount: ${givenCustomerCount}`);
                    console.log(`  newCustomerGiven: ${newCustomerGiven}`);
                    console.log(`  parsedTourActualOccupancy: ${parsedTourActualOccupancy}`);
                    console.log(`  updatedPercentage: ${updatedPercentage}`);
                    console.log(`  stats.finalAmount (before): ${stats.finalAmount}`);
                    console.log(`  addedAmountToStats: ${addedAmountToStats}`);
                    console.log(`  newTotalAmountForStats: ${newTotalAmountForStats}`);
                    console.log(`  newCommissionRateForStats: ${newCommissionRateForStats}`);
                    console.log(`  newTotalEligibleCommissionForStats: ${newTotalEligibleCommissionForStats}`);
                    console.log(`  stats.commissionReceived (before): ${stats.commissionReceived}`);
                    console.log(`-------------------------------------------------`);


                    // This is the actual commission to *add* to the direct agent's wallet for *this* payment
                    const commissionDelta = newTotalEligibleCommissionForStats - stats.commissionReceived;

                    if (commissionDelta > 0) {
                        await transferCommission(agent_db_id, currentPaymentAmount, updatedPercentage, commissionDelta, tourID, commissionRecords);
                    }
                    directAgentCommissionAmount = commissionDelta; // Store for the transaction model

                    // Update and save agent stats
                    stats.customerGiven = newCustomerGiven;
                    stats.finalAmount = newTotalAmountForStats;
                    stats.commissionReceived = newTotalEligibleCommissionForStats;
                    stats.commissionRate = newCommissionRateForStats; // Store the current commission rate
                    stats.adultsCount = adultsCount; // Update with current booking's adult count
                    stats.childrenCount = childrenCount; // Update with current booking's children count
                    stats.cancelledTravelersCount = cancelledTravelersCount; // Update with current booking's cancelled travelers count

                    await stats.save();
                    console.log(`AgentTourStats updated for agent ${agent.agentID}.`);

                    // Also update the agent's commission in the existing booking
                    // This will store the commission for THIS specific booking in the booking record
                    if (existingBooking.agent) {
                        existingBooking.agent.commission = directAgentCommissionAmount;
                        await existingBooking.save(); // Save booking again to persist agent commission update
                        console.log(`Booking ${existingBooking.bookingID} agent commission updated.`);
                    }
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
                tourPricePerHead: parsedTourPricePerHead, // Use parsed value
                tourActualOccupancy: parsedTourActualOccupancy, // Use parsed value
                tourGivenOccupancy: parsedTourGivenOccupancy, // Use parsed value
                tourStartDate: formattedTourStartDate,
                commissions: commissionRecords,
                finalAmount: currentPaymentAmount, // Final amount of this specific transaction
                travelers: travelersFromBooking, // Add travelers from the existing booking
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
