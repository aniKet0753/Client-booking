const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/', async (req, res) => {
  try {
    const { agentID, tourID, tourName, tourPricePerHead, tourActualOccupancy, tourGivenOccupancy, tourStartDate, GST, customer, travelers } = req.body;
    console.log("Req body:", req.body);
    // console.log(req.body.tourSchema.itinerary);
    console.log(tourStartDate);
    console.log( (tourPricePerHead * tourGivenOccupancy) * ((100+GST)/100) * 100);

    const totalAmount = tourPricePerHead * Number(tourGivenOccupancy); // in ₹
    const gstAmount = (totalAmount * GST) / 100;
    const finalAmount = totalAmount + gstAmount;

    const response = await razorpay.paymentLink.create({
      // amount: (tourPricePerHead * tourGivenOccupancy) * ((100+GST)/100) * 100,
      amount: Math.round(finalAmount * 100), //amount in paise
      currency: 'INR',
      description: `Booking for ${tourName}`,
      customer: {
        name: `Agent ${agentID}`,
        contact: req.body.contact || '9111111111', 
        email: req.body.email || 'no-reply@example.com'
      },
      notes: {
        agentID,
        tourID,
        tourName,
        tourPricePerHead,
        tourActualOccupancy,
        tourGivenOccupancy,
        tourStartDate,
        GST,
        finalAmount,
        customer,
        travelers : JSON.stringify(travelers)
      },
      callback_url: `${req.headers.origin}/thank-you`,
      callback_method: 'get'
    });

    res.status(200).json({ url: response.short_url });
  } catch (error) {
    console.error('Error generating Razorpay link:', error);
    const description = error?.error?.description || 'Failed to generate Razorpay link';
    res.status(500).json({ error: description });
  }
});

module.exports = router;