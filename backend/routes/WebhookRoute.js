const express = require('express');
const crypto = require('crypto');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Agent = require('../models/Agent'); 
const AgentTourStats = require('../models/AgentTourStats');
const Tours = require('../models/Tour');
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

/*
The below commented code is required only when we need to distribute commissions 
not just to the agent and their parent agent, 
but also to the parent of that parent, and so on — propagating up the hierarchy.
*/

// function getCommissionRate(percentageOnboarded, level) {
//   if (percentageOnboarded >= 65) {
//     return level === 1 ? 10 : level === 2 ? 5 : 10;
//   } else if (percentageOnboarded >= 45) {
//     return level === 1 ? 8.5 : level === 2 ? 3.5 : 9;
//   } else {
//     return level === 1 ? 7 : level === 2 ? 2.5 : 8;
//   }
// }

function getCommissionRate(percentageOnboarded, level) {
  if (percentageOnboarded >= 65) {
    return level === 1 ? 10 : 5;
  } else if (percentageOnboarded >= 45) {
    return level === 1 ? 8.5 : 3.5;
  } else {
    return level === 1 ? 7 : 2.5;
  }
}

// const transferCommission = async (agent_id, amount, percentageOnboarded, level = 1, commissionRecords = []) => {
//   try {
//     const agent = await Agent.findById(agent_id);
//     if (!agent) throw new Error("Agent not found: " + agent_id);

//     const commissionRate = getCommissionRate(percentageOnboarded, level);
//     const commission = (amount * commissionRate) / 100;

//     agent.walletBalance += commission;
//     await agent.save();

//     // Save to commission record
//     commissionRecords.push({
//       agentID: agent.agentID,
//       level,
//       commissionAmount: commission,
//       commissionRate,
//     });

//     console.log(`Level ${level}: ₹${commission} (${commissionRate}%) to ${agent.agentID} (${agent.name})`);

//     /*
//     The below commented if(condition) is required only when we need to distribute commissions 
//     not just to the agent and their parent agent, 
//     but also to the parent of that parent, and so on — propagating up the hierarchy.
//     */

//     // if (agent.parentAgent) {
//     if (level === 1 && agent.parentAgent) {
//       const remainingAmount = amount - commission;
//       // await transferCommission(agent.parentAgent, remainingAmount, percentageOnboarded, level + 1);
//       await transferCommission(agent.parentAgent, remainingAmount, percentageOnboarded, level + 1, commissionRecords);
//     }
//   } catch (error) {
//     console.error("Error transferring commission:", error.message);
//   }
// };
const transferCommission = async (agent_id, amount, updatedPercentage, commissionDelta, level, commissionRecords, tourID) => {
  try {
    const agent = await Agent.findById(agent_id);
    if (!agent) throw new Error("Agent not found");

    const rate = getCommissionRate(updatedPercentage, level);
    const commission = commissionDelta;

    // agent.walletBalance += commission;
    // await agent.save();

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
        parent.walletBalance += parentCommission;
        // await parent.save();

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


// router.post('/', express.json(), async (req, res) => {
//   const razorpaySignature = req.headers['x-razorpay-signature'];
//   const payload = req.rawBody;

//   const expectedSignature = crypto
//     .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
//     .update(payload)
//     .digest('hex');
  
//     // console.log(razorpaySignature, expectedSignature)
//   if (razorpaySignature !== expectedSignature) {
//     console.error('Invalid Razorpay webhook signature');
//     return res.sendStatus(400);
//   }

//   const event = req.body;

//   if (event.event === 'payment.captured') {
//     const payment = event.payload.payment.entity;
//     const {
//       agentID,
//       tourPricePerHead,
//       tourActualOccupancy,
//       tourGivenOccupancy,
//       tourStartDate
//     } = payment.notes;

//     const transactionId = payment.id;
//     const customerEmail = payment.email || 'unknown@example.com';

//     console.log("Tour Price:", tourPricePerHead);
//     console.log("Agent ID:", agentID);
//     console.log("Actual Occupancy:", tourActualOccupancy);
//     console.log("Given Occupancy:", tourGivenOccupancy);
//     console.log("Tour Start Date:", tourStartDate);
//     console.log("Transaction ID:", transactionId);
//     console.log("Email:", customerEmail);
//     try {
//       const percentageOnboarded = (tourGivenOccupancy / tourActualOccupancy) * 100;
//       const agent = await Agent.findOne({ agentID: agentID });
//       const agent_id = agent._id;

//       const commissionRecords = [];

//       await transferCommission(agent_id, tourPricePerHead, percentageOnboarded, 1, commissionRecords);
//       // console.log(commissionRecords);

//       // const customParseFormat = require('dayjs/plugin/customParseFormat');
//       // dayjs.extend(customParseFormat);
//       const newTransaction = new Transaction({
//         agentID,
//         customerEmail,
//         transactionId,
//         tourPricePerHead,
//         tourActualOccupancy,
//         tourGivenOccupancy,
//         tourStartDate,
//         commissions: commissionRecords,
//       });

//       await newTransaction.save();
//       console.log('Transaction and commissions saved successfully!');
//       res.status(200).json({ received: true });
//     } catch (err) {
//       console.error('Error saving transaction:', err);
//       res.status(500).json({ error: 'Database save failed' });
//     }
//   } else {
//     res.status(200).json({ message: 'Webhook received but not handled' });
//   }
// });
router.post('/', express.json(), async (req, res) => {
  console.log("webhook hit")
  const razorpaySignature = req.headers['x-razorpay-signature'];
  const payload = req.rawBody;

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (razorpaySignature !== expectedSignature) {
    console.error('Invalid Razorpay webhook signature');
    return res.sendStatus(400);
  }

  const event = req.body;

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    if (!payment.notes || !payment.notes.agentID || !payment.notes.tourID) {
      return res.status(400).json({ error: "Missing payment notes data" });
    }
    const {
      tourID,
      agentID,
      tourPricePerHead,
      tourActualOccupancy,
      tourGivenOccupancy,
      tourStartDate,
      GST
    } = payment.notes;

    const transactionId = payment.id;
    const customerEmail = payment.email || 'unknown@example.com';

    if(agentID === ''){
      const newTransaction = new Transaction({
        tourID,
        agentID,
        customerEmail,
        transactionId,
        tourPricePerHead,
        tourActualOccupancy,
        tourGivenOccupancy,
        tourStartDate: formattedDate,
        commissions: commissionRecords,
      });

      console.log("Direct transaction through customer saved successfully. No agent involved")
      await newTransaction.save();
      const tour = await Tours.findById(tourID);
      if (!tour) {  
        return res.status(404).json({ error: 'Tour not found' });
      }

      tour.packages[0].remainingOccupancy -= parseFloat(tourGivenOccupancy);
      if (tour.packages[0].remainingOccupancy < 0) {
        tour.packages[0].remainingOccupancy = 0;
      }

      await tour.save();

      console.log("Transaction saved successfully");
      return;
    }

    try {
      const agent = await Agent.findOne({ agentID });
      if (!agent) return res.status(404).json({ error: 'Agent not found' });

      const agent_id = agent._id;
      const statsKey = { agentID, tourStartDate, tourID };

      let stats = await AgentTourStats.findOne(statsKey);
      if (!stats) {
        stats = new AgentTourStats(statsKey);
      }

      // Update stats
      const givenCustomerCount = parseFloat(tourGivenOccupancy);
      const addedAmount = givenCustomerCount * parseFloat(tourPricePerHead);
      const newCustomerGiven = stats.customerGiven + givenCustomerCount;
      const updatedPercentage = (newCustomerGiven / parseFloat(tourActualOccupancy)) * 100;

      const newTotalAmount = stats.totalAmount + addedAmount;
      const level = 1;
      const newCommissionRate = getCommissionRate(updatedPercentage, level);
      const newTotalEligibleCommission = (newTotalAmount * newCommissionRate) / 100;
      const commissionDelta = newTotalEligibleCommission - stats.commissionReceived;

      const commissionRecords = [];

      if (commissionDelta > 0) {
        await transferCommission(agent_id, newTotalAmount, updatedPercentage, commissionDelta, level, commissionRecords, tourID);
      }

      // Save updated stats
      stats.customerGiven = newCustomerGiven;
      stats.totalAmount = newTotalAmount;
      stats.commissionReceived = newTotalEligibleCommission;
      await stats.save();

      // Save transaction
      dayjs.extend(customParseFormat);
      const rawDate = decodeURIComponent(decodeURIComponent(tourStartDate)); // First decode, then decode again
      const formattedDate = dayjs(rawDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
      console.log(formattedDate);  // Output: '2025-06-02'

      // const tourStartDateISO = new Date(tourStartDate).toISOString().split("T")[0];
      const newTransaction = new Transaction({
        tourID,
        agentID,
        customerEmail,
        transactionId,
        tourPricePerHead,
        tourActualOccupancy,
        tourGivenOccupancy,
        tourStartDate: formattedDate,
        commissions: commissionRecords,
      });

      await newTransaction.save();
      const tour = await Tours.findById(tourID);
      if (!tour) {
        return res.status(404).json({ error: 'Tour not found' });
      }

      // If packages is an array, find the correct one to update
      // const pkgIndex = tour.packages.findIndex(p => p._id.toString() === tourID);
      // if (pkgIndex !== -1) {
        tour.packages[0].remainingOccupancy -= parseFloat(tourGivenOccupancy);
        if (tour.packages[0].remainingOccupancy < 0) {
          tour.packages[0].remainingOccupancy = 0;
        }
      // }
      await tour.save();

      console.log("Transaction saved successfully");
      for (const record of commissionRecords) {
        await Agent.findOneAndUpdate(
          { agentID: record.agentID },
          { $inc: { walletBalance: record.commissionAmount } }
        );
        console.log(`Successfully added ${record.commissionAmount} to the wallet of  ${agent.agentID}(${agent.name})`);
      }
      res.status(200).json({ received: true });
    } catch (err) {
      console.error('Error processing transaction:', err);
      res.status(500).json({ error: 'Webhook error' });
    }
  } else {
    res.status(200).json({ message: 'Webhook received but event not handled' });
  }
});


module.exports = router;