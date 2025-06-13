const express = require('express');
const crypto = require('crypto');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const Agent = require('../models/Agent'); 
const AgentTourStats = require('../models/AgentTourStats');
const Tours = require('../models/Tour');
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

dayjs.extend(customParseFormat);

function getCommissionRate(percentageOnboarded, level) {
  if (percentageOnboarded >= 65) {
    return level === 1 ? 10 : 5;
  } else if (percentageOnboarded >= 45) {
    return level === 1 ? 8.5 : 3.5;
  } else {
    return level === 1 ? 7 : 2.5;
  }
}

const transferCommission = async (agent_id, amount, updatedPercentage, commissionDelta, level, commissionRecords, tourID) => {
  try {
    const agent = await Agent.findById(agent_id);
    if (!agent) throw new Error("Agent not found");

    const rate = getCommissionRate(updatedPercentage, level);
    const commission = commissionDelta;

    commissionRecords.push({
      tourID,
      agentID: agent.agentID,
      level,
      commissionAmount: commission,
      commissionRate: rate,
    });

    if (level === 1 && agent.parentAgent) {
      const parentCommissionRate = getCommissionRate(updatedPercentage, level + 1);
      const parentCommission = (amount * parentCommissionRate) / 100;

      const parent = await Agent.findById(agent.parentAgent);
      if (parent) {
        commissionRecords.push({
          tourID,
          agentID: parent.agentID,
          level: level + 1,
          commissionAmount: parentCommission,
          commissionRate: parentCommissionRate,
        });
      }
    }
  } catch (error) {
    console.error('Error in commission transfer:', error.message);
  }
};

// --- REMOVED express.json() MIDDLEWARE FROM HERE ---
router.post('/', async (req, res) => { // Removed the `express.json()` call here
  console.log("Webhook hit");
  const razorpaySignature = req.headers['x-razorpay-signature'];
  const payload = req.rawBody; // This is set by index.js's bodyParser.json()
  console.log("Raw Webhook Payload:", payload.toString());


  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (razorpaySignature !== expectedSignature) {
    console.error('Invalid Razorpay webhook signature');
    return res.sendStatus(400);
  }

  const event = req.body; // This is the already parsed JavaScript object from index.js's middleware
  console.log("Parsed Webhook Event (req.body):", JSON.stringify(event, null, 2));


  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;

    let tourID, agentID, tourPricePerHead, tourActualOccupancy, tourGivenOccupancy,
        tourStartDate, GST, finalAmount, customerNotes, travelersNotes, tourName; 

    if (payment && payment.notes) {
        ({
            tourID,
            agentID,
            tourPricePerHead,
            tourActualOccupancy,
            tourGivenOccupancy,
            tourStartDate,
            GST,
            finalAmount,
            customer: customerNotes, 
            travelers: travelersNotes, 
            tourName 
        } = payment.notes);
    }

    console.log("Webhook received notes customer (object):", customerNotes);
    console.log("Webhook received notes travelers (array):", travelersNotes);
    console.log("Webhook received notes tourName:", tourName); 

    if (!payment || !payment.notes || !tourID || typeof finalAmount === 'undefined' || !customerNotes || !travelersNotes || typeof payment.amount === 'undefined' || typeof payment.created_at === 'undefined') {
        console.error('Missing or invalid critical payment data in Razorpay payload or notes. Details:', {
            paymentNotes: payment.notes,
            paymentAmount: payment.amount,
            paymentCreatedAt: payment.created_at,
            tourID,
            finalAmount,
            customerNotes, 
            travelersNotes 
        });
        return res.status(400).json({ error: "Missing or invalid critical payment data from Razorpay." });
    }

    const transactionId = payment.id;
    const paymentMethod = payment.method;

    const parsedTourPricePerHead = parseFloat(tourPricePerHead);
    const parsedTourActualOccupancy = parseFloat(tourActualOccupancy);
    const parsedTourGivenOccupancy = parseFloat(tourGivenOccupancy);
    const parsedGST = parseFloat(GST);
    const parsedFinalAmount = parseFloat(finalAmount);
    const paidAmountValue = parseFloat(payment.amount) / 100;

    if (isNaN(parsedTourPricePerHead) || isNaN(parsedTourActualOccupancy) || isNaN(parsedTourGivenOccupancy) || isNaN(parsedGST) || isNaN(parsedFinalAmount) || isNaN(paidAmountValue)) {
        console.error('Invalid numeric data in payment notes or Razorpay payload. Details:', {
            tourPricePerHead, tourActualOccupancy, tourGivenOccupancy, GST, finalAmount, paymentAmount: payment.amount
        });
        return res.status(400).json({ error: "Invalid numeric data in payment notes." });
    }

    const paymentDateValue = new Date(payment.created_at * 1000);
    if (isNaN(paymentDateValue.getTime())) {
        console.error('Invalid payment date timestamp from Razorpay:', payment.created_at);
        return res.status(400).json({ error: "Invalid payment creation timestamp." });
    }

    const formattedDate = dayjs(tourStartDate).format('YYYY-MM-DD');

    // --- CUSTOMER DATA PROCESSING (DIRECTLY USE THE OBJECT) ---
    let customerData = {
        name: customerNotes.name || 'N/A',
        email: customerNotes.email || 'unknown@example.com',
        phone: customerNotes.phone || 'N/A',
        address: customerNotes.address || 'Not provided'
    };


    // --- TRAVELERS DATA PROCESSING (DIRECTLY USE THE ARRAY, handle gender) ---
    let processedTravelers = [];
    if (Array.isArray(travelersNotes)) { 
        processedTravelers = travelersNotes.map(t => {
            let gender = t.gender ? String(t.gender).toLowerCase() : 'unknown';
            if (gender === 'm') gender = 'male';
            if (gender === 'f') gender = 'female';

            const validGenders = ['male', 'female', 'other'];
            const finalGender = validGenders.includes(gender) ? gender : 'unknown';

            return {
                name: t.name || 'N/A',
                age: t.age ? parseInt(t.age) : 0,
                gender: finalGender
            };
        });
    } else {
        console.warn('travelersNotes is not an array after express.json() parsing:', travelersNotes);
        processedTravelers = [{ name: customerData.name, age: 0, gender: 'unknown' }];
    }
    if (processedTravelers.length === 0) {
        processedTravelers.push({
            name: customerData.name,
            age: 0,
            gender: 'unknown'
        });
    }

    const bookingId = `BKG-${Date.now()}`;

    const commonBookingData = {
        bookingID: bookingId,
        status: 'confirmed',
        bookingDate: new Date(),
        tour: {
            tourId: tourID,
        },
        customer: customerData, 
        travelers: processedTravelers,
        payment: {
            totalAmount: parsedFinalAmount,
            paidAmount: paidAmountValue,
            paymentStatus: 'Paid',
            paymentMethod: paymentMethod,
            transactionId: transactionId,
            paymentDate: paymentDateValue,
            breakdown: [
                { item: `Base Price (${parsedTourGivenOccupancy} pax)`, amount: parsedTourPricePerHead * parsedTourGivenOccupancy },
                { item: 'GST', amount: parsedGST }
            ]
        }
    };

    try {
      if (!agentID || agentID === '') {
        const newBooking = new Booking(commonBookingData);
        await newBooking.save();
        console.log("Direct customer booking saved successfully:", bookingId);

        const commissionRecords = [];
        
        const newTransaction = new Transaction({
          tourID,
          agentID: null, 
          customerEmail: customerData.email,
          transactionId,
          tourPricePerHead: parsedTourPricePerHead,
          tourActualOccupancy: parsedTourActualOccupancy,
          tourGivenOccupancy: parsedTourGivenOccupancy,
          tourStartDate: formattedDate,
          commissions: commissionRecords,
          finalAmount: parsedFinalAmount 
        });

        console.log("Direct transaction through customer saved successfully. No agent involved")
        await newTransaction.save();

        const tour = await Tours.findById(tourID);
        if (!tour) {  
          console.warn(`Tour with ID ${tourID} not found for occupancy update during direct booking.`);
        } else {
          tour.remainingOccupancy -= parsedTourGivenOccupancy;
          if (tour.remainingOccupancy < 0) {
            tour.remainingOccupancy = 0;
          }
          await tour.save();
          console.log(`Tour ${tourID} remaining occupancy updated to ${tour.remainingOccupancy}`);
        }

        return res.status(200).json({ received: true, bookingId: bookingId });

      } else {
        const agent = await Agent.findOne({ agentID });
        if (!agent) {
          console.error(`Agent with ID ${agentID} not found.`);
          return res.status(404).json({ error: 'Agent not found' });
        }

        const agent_id = agent._id;
        const statsKey = { agentID, tourStartDate: formattedDate, tourID };

        let stats = await AgentTourStats.findOne(statsKey);
        if (!stats) {
          stats = new AgentTourStats(statsKey);
        }

        const givenCustomerCount = parsedTourGivenOccupancy;
        const addedAmount = givenCustomerCount * parsedTourPricePerHead;
        const newCustomerGiven = stats.customerGiven + givenCustomerCount;
        const updatedPercentage = (newCustomerGiven / parsedTourActualOccupancy) * 100;

        const newTotalAmountForStats = stats.totalAmount + addedAmount; 
        const level = 1;
        const newCommissionRate = getCommissionRate(updatedPercentage, level);
        const newTotalEligibleCommission = (newTotalAmountForStats * newCommissionRate) / 100;
        const commissionDelta = newTotalEligibleCommission - stats.commissionReceived;

        const commissionRecords = [];

        if (commissionDelta > 0) {
          await transferCommission(agent_id, newTotalAmountForStats, updatedPercentage, commissionDelta, level, commissionRecords, tourID);
        }

        stats.customerGiven = newCustomerGiven;
        stats.totalAmount = newTotalAmountForStats; 
        stats.commissionReceived = newTotalEligibleCommission;
        await stats.save();

         const newBooking = new Booking({
            ...commonBookingData,
            agent: {
                agentId: agentID,
                name: agent.name,
                commission: commissionRecords.find(rec => rec.agentID === agentID)?.commissionAmount || 0
            }
        });
        await newBooking.save();
        console.log("Agent booking saved successfully:", bookingId);
        
        const newTransaction = new Transaction({
          tourID,
          agentID,
          customerEmail: customerData.email,
          transactionId,
          tourPricePerHead: parsedTourPricePerHead,
          tourActualOccupancy: parsedTourActualOccupancy,
          tourGivenOccupancy: parsedTourGivenOccupancy,
          tourStartDate: formattedDate,
          commissions: commissionRecords,
          finalAmount: parsedFinalAmount
        });

        await newTransaction.save();
        console.log("Transaction saved successfully with commissions");

        const tour = await Tours.findById(tourID);
        if (!tour) {
          console.warn(`Tour with ID ${tourID} not found for occupancy update during agent booking.`);
        } else {
          tour.remainingOccupancy -= parsedTourGivenOccupancy;
          if (tour.remainingOccupancy < 0) {
            tour.remainingOccupancy = 0;
          }
        }
        await tour.save();
        console.log(`Tour ${tourID} remaining occupancy updated to ${tour.remainingOccupancy}`);

        for (const record of commissionRecords) {
          const agentToUpdate = await Agent.findOneAndUpdate(
            { agentID: record.agentID },
            { $inc: { walletBalance: record.commissionAmount } },
            { new: true }
          );
          if(agentToUpdate) {
            console.log(`Successfully added ${record.commissionAmount} to the wallet of ${agentToUpdate.agentID} (${agentToUpdate.name})`);
          } else {
            console.warn(`Agent ${record.agentID} not found for wallet update.`);
          }
        }
        res.status(200).json({ received: true, bookingId: bookingId });
      }
    } catch (err) {
      console.error('Error processing transaction:', err);
      if (err.name === 'ValidationError') {
          console.error('Mongoose Validation Error Details:', err.errors);
          return res.status(400).json({ error: 'Booking validation failed', details: err.errors });
      }
      res.status(500).json({ error: 'Internal server error during webhook processing', details: err.message });
    }
  } else {
    res.status(200).json({ message: 'Webhook received but event not handled' });
  }
});


module.exports = router;