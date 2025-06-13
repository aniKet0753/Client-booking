const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const webhookURL = 'http://localhost:5001/webhook'; 

const tourPricePerHead = 9000;
const tourGivenOccupancy = 15 ;
const tourActualOccupancy = 50;
const totalAmount = tourPricePerHead * Number(tourGivenOccupancy); // in ₹
const GST = 18;
const gstAmount = (totalAmount * GST) / 100;
const finalAmount = totalAmount + gstAmount;

const samplePayload = {
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: 'pay_MOCK123458',
        email: 'testuser@example.com',
        notes: {
          agentID: '',
          tourID: '683ed99b3a44a7ade21e2d31', 
          tourPricePerHead,
          tourActualOccupancy,
          tourGivenOccupancy,
          tourStartDate: '2025-08-12T00:00:00.000Z',
          GST,
          finalAmount,
          customer: {
            name: 'Rajesh Kumar',
            email: 'rajeshghosh8292@gmail.con',
            phone: '7890234590',
            address: 'Sodpur, panihati'
          },
          travelers: [
            { name: 'Rajesh Ghosh', age: 20, gender: 'M' },
            { name: 'Megha Ghosh', age: 32, gender: 'F' }
          ]
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

    const response = await axios.post(webhookURL, samplePayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      },
      transformRequest: [(data) => {
        // simulate rawBody for Express
        return JSON.stringify(data);
      }]
    });

    console.log('Webhook response:', response.data);
  } catch (error) {
    console.error('Error sending webhook:', error.response?.data || error.message);
  }
})();


// const mongoose = require('mongoose');
// require('dotenv').config();
// const Agent = require('../models/Agent');
// const dayjs = require('dayjs');
// const customParseFormat = require('dayjs/plugin/customParseFormat');
// mongoose.connect('mongodb+srv://abhishekkumarmahto2005:PmYyWbh3hjbs5f7H@cluster0.pcr8b.mongodb.net/agentDB?retryWrites=true&w=majority&appName=Cluster0')
//   .then(async() => {
//     console.log('MongoDB Connected');

//     const agentID = "032-2025-000A";
//     let agent = await Agent.findOne({ agentID: agentID });
//     const agent_id = agent._id;
//     const tourPrice = 90000; 
//     tourActualOccupancy=50,
//     tourGivenOccupancy=15,
//     percentageOnboarded = (tourGivenOccupancy/tourActualOccupancy)*100 ;
//     console.log(percentageOnboarded);
//     transferCommission(agent_id, tourPrice, percentageOnboarded);
//   })
//   .catch(err => console.error(err));


//   function getCommissionRate(percentageOnboarded, level) {
//     if (percentageOnboarded >= 65) {
//       return level === 1 ? 10 : 5;
//     } else if (percentageOnboarded >= 45) {
//       return level === 1 ? 8.5 : 3.5;
//     } else {
//       return level === 1 ? 7 : 2.5;
//     }
//   }

  
//   const transferCommission = async (agent_id, amount, percentageOnboarded, level = 1) => {
//     try {
//       const agent = await Agent.findById(agent_id);
//       if (!agent) throw new Error("Agent not found: " + agent_id);
  
//       const commissionRate = getCommissionRate(percentageOnboarded, level);
//       const commission = (amount * commissionRate) / 100;
  
//       agent.walletBalance += commission;
//       // await agent.save();


  
//       console.log(`Level ${level}: ₹${commission} (${commissionRate}%) to ${agent.agentID} (${agent.name})`);
  
//       if (level === 1 && agent.parentAgent) {
//         const remainingAmount = amount - commission;
//         await transferCommission(agent.parentAgent, remainingAmount, percentageOnboarded, level + 1);
//       }
//     } catch (error) {
//       console.error("Error transferring commission:", error.message);
//     }
//   };



// dayjs.extend(customParseFormat);

// const tourStartDate = "20%252F08%252F2025";
// const rawDate = decodeURIComponent(decodeURIComponent(tourStartDate)); // "20/08/2025"
// const formattedDate = dayjs(rawDate, 'DD/MM/YYYY').format('YYYY-MM-DD');

// console.log(formattedDate);  // Output: "2025-08-20"
