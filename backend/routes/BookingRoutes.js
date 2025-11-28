const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const Agent = require('../models/Agent');
const authenticate = require('../middleware/authMiddleware');
const authenticateSuperAdmin = require('../middleware/authSuperadminMiddleware');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');

const createBooking = async (req, res) => {
    console.log(req.body); 

  try {
    const { bookingID, status, bookingDate, tour, customer, travelers, agent, packageRates, payment, utrNumber, numAdults, numChildren } = req.body;

    console.log(req.body); 
    console.log("req.body data is above");

    // Basic validation
    if(!customer.address){
      return res.status(400).json({ error: 'All Address details are required.' });
    }
    if(!payment){
      return res.status(400).json({ error: 'Payment details are required.' });
    }
    if (
      !bookingID || !tour || !packageRates || !payment || !customer || !customer.name || !customer.email ||
      !req.user || !req.user.id || !travelers || !Array.isArray(travelers) || travelers.length === 0 || !numAdults || !numChildren
    ) {
      return res.status(400).json({ error: 'Missing required booking fields.' });
    }

    // Agent cannot give their email address as customer email address
    isAgentEmail = await Agent.findOne({ email: customer.email });
    if(isAgentEmail){
      return res.status(403).json({ error: `Agents are not permitted to use their own email addresses in place of the customer’s email address.` });
    }
    // Validate agent if provided
    if (agent) {
      const agentDetails = await Agent.findOne({ agentID: agent.agentID });
      if (!agentDetails) {
        return res.status(400).json({ error: 'Invalid AgentID entered.' });
      }
    }

    // Validate individual travelers
    for (const traveler of travelers) {
      if (!traveler.name || typeof traveler.age === 'undefined' || !traveler.gender) {
        return res.status(400).json({ error: 'All travelers must have a name, age, and gender.' });
      }
    }

    // If booking exists
    const existingBooking = await Booking.findOne({
      'customer.email': customer.email,
      'tour.tourID': tour.tourID,
      'status' : { $ne: 'confirmed' }
    });

    // Common logic: Get or create customer, get the _id
    let existingCustomer = await Customer.findOne({
      $or: [
        { email: customer.email },
        { phone: customer.phone }
      ]
    });

    let customerId;

    if (!existingCustomer) {
      const namePart = (customer.name || "cust").substring(0, 4).padEnd(4, "x").toLowerCase();
      const dob = customer.dob || "2000-01-01";
      const dobMonthDay = new Date(dob).toISOString().slice(5, 10).replace("-", "");
      const rawPassword = namePart + dobMonthDay;

      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      const newCustomer = new Customer({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        password: hashedPassword,
      });

      await newCustomer.save();
      console.log("✅ New customer created with auto-generated password.");
      customerId = newCustomer._id;
    } else {
      console.log("✅ Customer already exists.");
      customerId = existingCustomer._id;
    }

    const customerData = {
      ...customer,
      id: customerId,
    };

    // IF BOOKING EXISTS, update it
    if (existingBooking) {
      console.log(existingBooking.status);
      console.log("♻️ Updating existing booking");
      existingBooking.bookingID = bookingID;
      existingBooking.status = status || existingBooking.status;
      existingBooking.bookingDate = bookingDate || existingBooking.bookingDate;
      existingBooking.tour = tour;
      existingBooking.customer = customerData; // ✅ Ensure id is set
      existingBooking.travelers = travelers;
      existingBooking.agent = agent;
      existingBooking.customer.homeAddress = customer.address;
      existingBooking.utrNumber = utrNumber || existingBooking.utrNumber;
      existingBooking.numAdults = numAdults || existingBooking.numAdults;
      existingBooking.numChildren = numChildren || existingBooking.numChildren;
      const updatedBooking = await existingBooking.save();
      console.log("✅ Updated booking:", updatedBooking.bookingID);
      return res.status(200).json(updatedBooking);
    }

    // ELSE, create a new booking
    const newBooking = new Booking({
      bookingID,
      status: status || 'pending',
      bookingDate: bookingDate || new Date(),
      tour,
      customer: {
        ...customerData,
        homeAddress: customerData.address,
      },
      travelers,
      agent,
      payment,
      numAdults,
      numChildren,
      // : {
      //   totalAmount: 0,
      //   paidAmount: 0,
      //   paymentStatus: 'Pending',
      // }
      // ,
      packageRates
    });

    const savedBooking = await newBooking.save();
    console.log("✅ Created new booking:", savedBooking.bookingID);
    return res.status(201).json(savedBooking);

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Booking with this ID already exists.', details: error.message });
    }
    console.error('❌ Error creating/updating booking:', error);
    return res.status(500).json({ error: 'Failed to create or update booking', details: error.message });
  }
};


// const getBookings = async (req, res) => {
//     try {
//         const query = {};
//         const { bookingID, tourID, tourName, tourStartDate } = req.query;

//         if (bookingID) {
//             query.bookingID = { $regex: bookingID, $options: 'i' };
//         }
//         if (tourID) {
//             // Correctly handle tourID (which is tour._id in the schema) as an ObjectId
//             if (mongoose.Types.ObjectId.isValid(tourID)) {
//                 query['tour._id'] = new mongoose.Types.ObjectId(tourID); // Changed to tour._id for exact ObjectId match
//             } else {
//                 // If the provided tourID is not a valid ObjectId format,
//                 // it won't match any tour._id. Return a 400 or treat as no match.
//                 return res.status(400).json({ message: 'Invalid Tour ID .' });
//             }
//         }
//         if (tourName) {
//             query['tour.name'] = { $regex: tourName, $options: 'i' };
//         }
//         if (tourStartDate) {
//             const startOfDay = new Date(tourStartDate);
//             startOfDay.setUTCHours(0, 0, 0, 0);
//             const endOfDay = new Date(tourStartDate);
//             endOfDay.setUTCHours(23, 59, 59, 999);

//             query['tour.startDate'] = {
//                 $gte: startOfDay,
//                 $lte: endOfDay
//             };
//         }

//         const bookings = await Booking.find(query);

//         if (bookings.length === 0) {
//             return res.status(404).json({ message: 'No bookings found matching the criteria.' });
//         }

//         res.status(200).json(bookings); // Return the first matching booking
        
//     } catch (error) {
//         console.error('Error fetching bookings:', error);
//         res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
//     }
// };

const getBookings = async (req, res) => {
    try {
        const query = {};
        const { bookingID, tourID, tourName, tourStartDate } = req.query;

        if (bookingID) {
            query.bookingID = { $regex: bookingID, $options: 'i' };
        }
        if (tourID) {
            // Correctly handle tourID (which is tour._id in the schema) as an ObjectId
            if (mongoose.Types.ObjectId.isValid(tourID)) {
                query['tour._id'] = new mongoose.Types.ObjectId(tourID); // Changed to tour._id for exact ObjectId match
            } else {
                // If the provided tourID is not a valid ObjectId format,
                // it won't match any tour._id. Return a 400 or treat as no match.
                return res.status(400).json({ message: 'Invalid Tour ID format. Must be a valid MongoDB ObjectId.' });
            }
        }
        if (tourName) {
            query['tour.name'] = { $regex: tourName, $options: 'i' };
        }
        if (tourStartDate) {
            const startOfDay = new Date(tourStartDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(tourStartDate);
            endOfDay.setUTCHours(23, 59, 59, 999);

            query['tour.startDate'] = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        const bookings = await Booking.find(query);

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found matching the criteria.' });
        }

        // Return the entire array of matching bookings
        res.status(200).json(bookings);
        
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
    }
};

const getBookingInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (
      booking.customer.email !== req.user.email &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          error:
            "Access denied, You do not have the permission to view the invoice",
        });
    }

    const gstRate = booking.tour.GST ? booking.tour.GST / 100 : 0.18;

    const subTotal =
      booking.packageRates.adultRate * booking.numAdults +
      booking.packageRates.childRate * booking.numChildren;
    const gstAmount = subTotal * gstRate;
    const totalAmount = subTotal + gstAmount;

    const inclusions = booking.tour.inclusions || [];
    const exclusions = booking.tour.exclusions || [];
    // Extra charges
    // const extraCharges = booking.extraCharges || {};

    const journeyDate =
      booking.tour.startDate && !isNaN(new Date(booking.tour.startDate))
        ? new Date(booking.tour.startDate).toLocaleDateString("en-IN")
        : "N/A";

    const invoiceData = {
      invoiceNo: `L2G/TOUR/FY2025-2026/${booking.bookingID}`,
      date: new Date(booking.bookingDate).toLocaleDateString("en-GB"),
      customerName: booking.customer.name,
      totalPassengers: booking.numAdults + booking.numChildren,
      bookingID: booking.bookingID,
      journeyDate,
      customerEmail: booking.customer.email,
      tourPackageName: booking.tour.name,
      tourDuration: `${booking.tour.duration} Days / ${
        booking.tour.duration - 1
      } Nights`,
      basePrice: booking.packageRates.adultRate,
      numPassengersForCalc: booking.numAdults,
      childBasePrice: booking.packageRates.childRate,
      childPassengers: booking.numChildren,

      inclusions,
      exclusions,

      gstRate,
      subTotal,
      gstAmount,
      totalAmount,
      paidAmount: booking.payment.paidAmount || 0,
      amountDue: totalAmount - (booking.payment.paidAmount || 0),
      paymentStatus: booking.payment.paymentStatus,

      // extra charges
      // airFare: extraCharges.airFare || 0,
      // airFarePassengers: extraCharges.airFarePassengers || 0,
      // trainFare: extraCharges.trainFare || 0,
      // trainFarePassengers: extraCharges.trainFarePassengers || 0,
      // foodings: extraCharges.foodings || 0,
      // foodingsPassengers: extraCharges.foodingsPassengers || 0,
      // hotelUpgrade: extraCharges.hotelUpgrade || 0,
      // hotelUpgradePassengers: extraCharges.hotelUpgradePassengers || 0,
      // conveyance: extraCharges.conveyance || 0,
      // conveyancePassengers: extraCharges.conveyancePassengers || 0,
    };
    console.log(invoiceData);

    res.status(200).json(invoiceData);
  } catch (error) {
    console.error("Error fetching Invoice data:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch Invoice data", details: error.message });
  }
};

router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; 
    const bookings = await Booking.find({ 'customer.id': userId }); 
    
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this user.' });
    }

    res.json(bookings); // Send the array of bookings
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Failed to fetch user bookings', details: error.message });
  }
});

router.get('/my-bookings/:tourID', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // MongoDB ObjectId of the logged-in user
    const {tourID} = req.params;
    const bookings = await Booking.find({ 'customer.id': userId ,'tour.tourID': tourID, 'status': { $ne: 'confirmed' }  });
    if(bookings)
    res.json(bookings);
    else
    res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});


router.post('/', authenticate, createBooking);
router.get('/', authenticate, getBookings);

// invoice route
router.get("/:id/invoice", authenticate, getBookingInvoice);

module.exports = router;