const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const Agent = require('../models/Agent');
const authenticate = require('../middleware/authMiddleware');
const authenticateSuperAdmin = require('../middleware/authSuperadminMiddleware');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const createBooking = async (req, res) => {
  try {
    const { bookingID, status, bookingDate, tour, customer, travelers, agent } = req.body;

    console.log(req.body);
    console.log("req.body data is above");
    if ( !bookingID || !tour || !customer || !customer.name || !customer.email || !req.user || !req.user.id || !travelers || !Array.isArray(travelers) || travelers.length === 0) {
      return res.status(400).json({ error: 'Missing required booking fields.' });
    }

    if(agent){
      agentDetails = await Agent.findOne({agentID : agent.agentID});
      if(!agentDetails){
        return res.status(400).json({ error: 'Invalid AgentID entered.' });
      }
    }

    // Validate individual travelers
    for (const traveler of travelers) {
      if (!traveler.name || typeof traveler.age === 'undefined' || !traveler.gender) {
        return res.status(400).json({ error: 'All travelers must have a name, age, and gender.' });
      }
    }

    customer.id = req.user.id;

    // Check if booking exists for this user and tour
    const existingBooking = await Booking.findOne({
      'customer.id': customer.id,
      'tour.tourID': tour.tourID,
    });

    if (existingBooking) {
      existingBooking.bookingID = bookingID; 
      existingBooking.status = status || existingBooking.status;
      existingBooking.bookingDate = bookingDate || existingBooking.bookingDate;
      existingBooking.tour = tour;
      existingBooking.customer = customer;
      existingBooking.travelers = travelers;
      existingBooking.agent = agent;

      const updatedBooking = await existingBooking.save();
      console.log("Updated booking data:",req.body);
      console.log("Updated a existing booking data");
      return res.status(200).json(updatedBooking);
    } else {
      const newBooking = new Booking({
        bookingID,
        status: status || 'pending',
        bookingDate: bookingDate || new Date(),
        tour,
        customer,
        travelers,
        agent,
        payment: {
          totalAmount: 0,
          paidAmount: 0,
          paymentStatus: 'Pending',
        },
      });

      const savedBooking = await newBooking.save();
      console.log("Submitted a new booking data:",req.body);
      console.log("Saved new booking data");
      return res.status(201).json(savedBooking);
      
    }
  } catch (error) {
    if (error.code === 11000) {
      console.log(error)
      return res.status(409).json({ error: 'Booking with this ID already exists.', details: error.message });
    }
    console.error('Error creating or updating booking:', error);
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
    const bookings = await Booking.find({ 'customer.id': userId ,'tour.tourID': tourID });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});


router.post('/', authenticate, createBooking);
router.get('/', authenticate, getBookings);

module.exports = router;