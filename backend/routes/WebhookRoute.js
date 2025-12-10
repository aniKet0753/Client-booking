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
// Import the new models
const TermsAndConditions = require('../models/TermsAndConditions');
const UserAgreement = require('../models/UserAgreement');

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

function getCommissionRate(percentageOnboarded, level) {
    if (percentageOnboarded >= 65) {
        return level === 1 ? 10 : 5;// 10% for agent, 5% for parent
    } else if (percentageOnboarded >= 45) {
        return level === 1 ? 8.5 : 3.5;// 8.5% for agent, 3.5% for parent
    } else {
        return level === 1 ? 7 : 2.5;// 7% for agent, 2.5% for parentc
    }
}

const transferCommission = async (agentId, currentPaymentValue, updatedPercentage, commissionDeltaForDirectAgent, tourID, commissionRecords) => {
    try {
        const agent = await Agent.findById(agentId);
        if (!agent) {
            console.warn(`Agent with ID ${agentId} not found for commission transfer.`);
            return;
        }

        commissionRecords.push({
            tourID,
            agentID: agent.agentID,
            level: 1,
            commissionAmount: commissionDeltaForDirectAgent,
            commissionRate: getCommissionRate(updatedPercentage, 1),
        });
        console.log(`Prepared Level 1 commission: ₹${commissionDeltaForDirectAgent} to ${agent.agentID}`);

        if (agent.parentAgent) {
            const parent = await Agent.findById(agent.parentAgent);
            if (parent) {
                const parentCommissionRate = getCommissionRate(updatedPercentage, 2);
                const parentCommission = (currentPaymentValue * parentCommissionRate) / 100;

                commissionRecords.push({
                    tourID,
                    agentID: parent.agentID,
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
    const payload = req.rawBody.toString();

    console.log("Received payload:", payload);

    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

    if (razorpaySignature !== expectedSignature) {
        console.error('Invalid Razorpay webhook signature. Expected:', expectedSignature, 'Received:', razorpaySignature);
        return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;

        if (!payment.notes || !payment.notes.bookingID || !payment.notes.tourID || !payment.notes.tourName) {
            console.error("Missing critical payment notes data (bookingID, tourID, or tourName). Notes:", payment.notes);
            return res.status(400).json({ error: "Missing critical payment notes data (bookingID, tourID, or tourName)." });
        }

        const {
            bookingID,
            tourID,
            tourName,
            agentID,
            tourStartDate,
        } = payment.notes;

        const parsedTourPricePerHead = parseFloat(payment.notes.tourPricePerHead) || 0;
        const parsedTourActualOccupancy = parseFloat(payment.notes.tourActualOccupancy) || 0;
        const parsedTourGivenOccupancy = parseFloat(payment.notes.tourGivenOccupancy) || 0;
        const parsedGST = parseFloat(payment.notes.GST) || 0;
        const parsedFinalAmount = parseFloat(payment.notes.finalAmount) || 0;

        const transactionId = payment.id;
        const currentPaymentAmount = parseFloat(payment.amount) / 100;
        const paymentMethod = payment.method;

        if (isNaN(currentPaymentAmount) || isNaN(parsedTourPricePerHead) || isNaN(parsedTourActualOccupancy) || isNaN(parsedTourGivenOccupancy) || isNaN(parsedGST) || isNaN(parsedFinalAmount)) {
             console.error("Invalid numeric data after parsing payment notes. Check raw notes:", payment.notes);
             return res.status(400).json({ error: "Invalid numeric data in payment notes after parsing." });
        }


        try {
            const existingBooking = await Booking.findOne({ bookingID: bookingID });

            if (!existingBooking) {
                console.error(`Booking with ID ${bookingID} not found. Cannot update.`);
                return res.status(404).json({ error: `Booking with ID ${bookingID} not found.` });
            }
            
            // --- NEW T&C AGREEMENT LOGIC ADDED HERE ---
            try {
            let query = { type: 'tour' };
            if (tourID) {
                query.tourId = tourID;
            } else {
                query.tourId = null;
            }

            const latestTerms = await TermsAndConditions.findOne(query);

            if (!latestTerms) {
                console.warn(`No terms and conditions found for type: tour and tourId: ${tourID}. Skipping T&C agreement record.`);
            } else {
                // Correctly extract the customer ID, ensuring it exists
                const customerId = existingBooking.customer.id;

                if (!customerId) {
                    console.warn(`Customer ID not found in booking ${existingBooking.bookingID}. Skipping T&C agreement record.`);
                    // Exit the T&C block gracefully without throwing an error
                } else {
                    const existingAgreement = await UserAgreement.findOne({
                        userId: customerId,
                        userType: 'Customer',
                        termsId: latestTerms._id,
                    });

                    if (existingAgreement) {
                        console.log('User has already agreed to the latest T&C for this tour.');
                    } else {
                        const newAgreement = new UserAgreement({
                            userId: customerId,
                            userType: 'Customer',
                            termsId: latestTerms._id,
                        });

                        await newAgreement.save();
                        console.log(`New T&C agreement recorded for customer ${customerId} and terms ID ${latestTerms._id}.`);
                    }
                }
            }
            } catch (err) {
            console.error('Error during T&C agreement process:', err);
            }
            // --- END OF NEW T&C AGREEMENT LOGIC ---

            existingBooking.status = 'confirmed';
            existingBooking.utrNumber = transactionId;
            existingBooking.payment = {
                totalAmount: parsedFinalAmount,
                paidAmount: currentPaymentAmount,
                paymentStatus: 'Paid',
                paymentMethod: paymentMethod,
                transactionId: transactionId,
                paymentDate: new Date(payment.created_at * 1000),
                breakdown: [
                    { item: `Base Price (${parsedTourGivenOccupancy} pax)`, amount: parsedTourPricePerHead * parsedTourGivenOccupancy },
                    { item: 'GST', amount: parsedGST }
                ]
            };

            if (!existingBooking.tour) existingBooking.tour = {};
            existingBooking.tour.tourID = tourID;

            let adultsCount = 0;
            let childrenCount = 0;
            let cancelledTravelersCount = 0;

            existingBooking.travelers.forEach(traveler => {
                const travelerAge = parseFloat(traveler.age);
                if (!isNaN(travelerAge) && travelerAge >= 12) {
                    adultsCount++;
                } else if (!isNaN(travelerAge)) {
                    childrenCount++;
                }
                if (traveler.cancellationApproved) {
                    cancelledTravelersCount++;
                }
            });

            await existingBooking.save();
            console.log("Existing booking updated successfully:", existingBooking.bookingID);

            const customerEmail = existingBooking.customer.email;
            const travelersFromBooking = existingBooking.travelers;

            const formattedTourStartDate = dayjs(tourStartDate).format('YYYY-MM-DD');

            const tour = await Tours.findById(tourID);
            if (!tour) {
                console.error(`Tour with ID ${tourID} not found for occupancy update.`);
                return res.status(404).json({ error: 'Tour not found' });
            }

            tour.remainingOccupancy -= parsedTourGivenOccupancy;
            if (tour.remainingOccupancy < 0) {
                tour.remainingOccupancy = 0;
            }
            await tour.save();
            console.log(`Tour ${tourID} remaining occupancy updated to: ${tour.remainingOccupancy}`);


            const commissionRecords = [];
            let directAgentCommissionAmount = 0;

            if (agentID && agentID !== '') {
                const agent = await Agent.findOne({ agentID });
                if (!agent) {
                    console.error(`Agent with agentID ${agentID} not found.`);
                } else {
                    const agent_db_id = agent._id;

                    let stats = await AgentTourStats.findOne({ agent: agent_db_id, tourStartDate: formattedTourStartDate, tourID });
                    
                    if (!stats) {
                        stats = new AgentTourStats({
                            booking: existingBooking._id,
                            bookingStringID: existingBooking.bookingID,
                            agent: agent_db_id,
                            agentID: agent.agentID,
                            tourStartDate: formattedTourStartDate,
                            tourID,
                            tourName: tourName,
                            tourPricePerHead: parsedTourPricePerHead,
                            totalOccupancy: parsedTourActualOccupancy,
                            bookingDate: existingBooking.bookingDate,
                            customerGiven: 0,
                            commissionReceived: 0,
                            CommissionPaid: false,
                            CommissionPaidDate: null,
                            commissionRate: 0,
                            commissionDeductionAmount: 0,
                            adultsCount: 0,
                            childrenCount: 0,
                            cancelledTravelersCount: 0,
                        });
                    }

                    // stats.finalAmount = stats.finalAmount || 0;
                    // stats.commissionReceived = stats.commissionReceived || 0;

                    const givenCustomerCount = parsedTourGivenOccupancy;
                    // const addedAmountToStats = givenCustomerCount * parsedTourPricePerHead;
                    
                    const newCustomerGiven = stats.customerGiven + givenCustomerCount;
                    
                    let updatedPercentage = 0;
                    if (parsedTourActualOccupancy > 0) {
                        updatedPercentage = (newCustomerGiven / parsedTourActualOccupancy) * 100;
                    }
                    if (isNaN(updatedPercentage)) {
                        updatedPercentage = 0;
                    }

                    // const newTotalAmountForStats = stats.finalAmount + addedAmountToStats;
                    const newCommissionRateForStats = getCommissionRate(updatedPercentage, 1);
                    // const newTotalEligibleCommissionForStats = (newTotalAmountForStats * newCommissionRateForStats) / 100;
                    const newTotalEligibleCommissionForStats = (currentPaymentAmount * newCommissionRateForStats) / 100;
                    console.log(`--- Commission Calculation Debug for Agent ${agent.agentID} ---`);

                    // console.log(`  stats.customerGiven (before): ${stats.customerGiven}`);
                    // console.log(`  givenCustomerCount: ${givenCustomerCount}`);
                    // console.log(`  newCustomerGiven: ${newCustomerGiven}`);
                    // console.log(`  parsedTourActualOccupancy: ${parsedTourActualOccupancy}`);
                    // console.log(`  updatedPercentage: ${updatedPercentage}`);
                    // console.log(`  stats.finalAmount (before): ${stats.finalAmount}`);
                    // console.log(`  addedAmountToStats: ${addedAmountToStats}`);
                    // console.log(`  newTotalAmountForStats: ${newTotalAmountForStats}`);
                    console.log(`  newCommissionRateForStats: ${newCommissionRateForStats}`);
                    console.log(`  newTotalEligibleCommissionForStats: ${newTotalEligibleCommissionForStats}`);
                    // console.log(`  stats.commissionReceived (before): ${stats.commissionReceived}`);
                    console.log(`-------------------------------------------------`);

                    // const commissionDelta = newTotalEligibleCommissionForStats - stats.commissionReceived;

                    // if (commissionDelta > 0) {
                        await transferCommission(agent_db_id, currentPaymentAmount, updatedPercentage,
                            //  commissionDelta,
                             newTotalEligibleCommissionForStats,
                             tourID, commissionRecords);
                    // }
                    directAgentCommissionAmount = newTotalEligibleCommissionForStats;

                    stats.customerGiven = newCustomerGiven;
                    stats.finalAmount = currentPaymentAmount;
                    stats.commissionReceived = newTotalEligibleCommissionForStats;
                    stats.commissionRate = newCommissionRateForStats;
                    stats.adultsCount = adultsCount;
                    stats.childrenCount = childrenCount;
                    stats.cancelledTravelersCount = cancelledTravelersCount;

                    await stats.save();
                    console.log(`AgentTourStats updated for agent ${agent.agentID}.`);

                    if (existingBooking.agent) {
                        existingBooking.agent.commission = directAgentCommissionAmount;
                        await existingBooking.save();
                        console.log(`Booking ${existingBooking.bookingID} agent commission updated.`);
                    }
                }
            } else {
                console.log("Direct customer booking - no agent involved.");
            }

            const newTransaction = new Transaction({
                tourID,
                agentID: agentID || 'N/A',
                customerEmail,
                transactionId,
                tourPricePerHead: parsedTourPricePerHead,
                tourActualOccupancy: parsedTourActualOccupancy,
                tourGivenOccupancy: parsedTourGivenOccupancy,
                tourStartDate: formattedTourStartDate,
                commissions: commissionRecords,
                finalAmount: currentPaymentAmount,
                travelers: travelersFromBooking,
            });
            
            await newTransaction.save();
            console.log('Transaction saved successfully:', newTransaction.transactionId);
            
            for (const record of commissionRecords) {
                const agentToUpdate = await Agent.findOneAndUpdate(
                    { agentID: record.agentID },
                    { $inc: { walletBalance: record.commissionAmount } },
                    { new: true }
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