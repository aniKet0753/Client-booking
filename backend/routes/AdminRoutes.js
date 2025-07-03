const express = require('express');
const bcrypt = require('bcrypt');
const authenticateSuperAdmin = require('../middleware/authSuperadminMiddleware');
const Agent = require('../models/Agent'); 
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Superadmin = require('../models/Superadmin');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer(); // Memory storage if you're using base64 directly


function formatTourForResponse(tour) {
    return {
        tourID: tour._id,//done
        name: tour.name,//done
        // image: tour.image,
        image: tour.image ? `data:image/jpeg;base64,${tour.image}` : null,
        categoryType: tour.categoryType,
        country: tour.country,
        tourType: tour.tourType,
        pricePerHead: tour.pricePerHead,//done
        GST: tour.GST,
        duration: tour.duration,
        occupancy: tour.occupancy,//done
        remainingOccupancy: tour.remainingOccupancy,
        startDate: tour.startDate,//done
        description: tour.description,
        highlights: tour.highlights,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        thingsToPack: tour.thingsToPack,
        itinerary: tour.itinerary,
         // Map gallery array to ensure each image string has the data URI prefix
        gallery: tour.gallery && Array.isArray(tour.gallery)
                   ? tour.gallery.map(imgBase64 => `data:image/jpeg;base64,${imgBase64}`)
                   : [],
        createdAt: tour.createdAt,
        updatedAt: tour.updatedAt
    };
}

router.get('/profile', authenticateSuperAdmin, async (req, res) => {
  // console.log("Admin profile route hit");
    try {
        const superadmin = await Superadmin.findById(req.user.id);
        // console.log(superadmin);

        if (!superadmin) {
            return res.status(404).json({ error: 'superadmin not found' });
        }
        // console.log(superadmin);
        res.json(superadmin);
    } catch (error) {
        console.error("Error fetching profile: ", error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

router.put('/profile', authenticateSuperAdmin, upload.single('photo'), async (req, res) => {
  try {
    const superadminId = req.user.id;

    const superadmin = await Superadmin.findById(superadminId);
    if (!superadmin) {
      return res.status(404).json({ error: "superadmin not found" });
    }

    let updateData = {};
    if (req.body.updateData) {
      updateData = JSON.parse(req.body.updateData);
    }

    const { name, password } = updateData;

    if (name) superadmin.name = name;

    if (password && password.trim() !== '') {
      superadmin.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      superadmin.photo = `data:image/png;base64,${base64Image}`;
    }

    await superadmin.save();
    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("Error updating profile: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/find-user', authenticateSuperAdmin, async (req, res) => {
  const { identifier } = req.body;
  // console.log(identifier);
  const agent = await Agent.findOne({
    $or: [{ email: identifier }, { phone_calling: identifier }]
  });

  if (agent) return res.json({ success: true });
  res.json({ success: false });
});

router.get('/all-agents', authenticateSuperAdmin, async(req,res)=>{
  try{
    const agents = await Agent.find();
    res.json({agents});
  }
  catch(error){
    console.error("Error fetching all agents : ", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
})

router.get('/all-customers', authenticateSuperAdmin, async(req,res)=>{ 
  try{
    const customers = await Customer.find();
    res.json({customers});
  }
  catch(error){
    console.error("Error fetching all customers : ", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
})

router.get('/pending-count',authenticateSuperAdmin, async (req, res) => {
  try {
    const count = await Agent.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (err) {
    console.error("Error:",err);
    res.status(500).json({ error: 'Server error' });
  }
}); 

router.post('/update-status', authenticateSuperAdmin, async (req, res) => {
  const { userId, status } = req.body;
  let newStatusToSet = status;
  console.log(newStatusToSet,userId)
  if (status === 'approved') {
    newStatusToSet = 'active';
  }
  try {
    await Agent.findByIdAndUpdate(userId, { status : newStatusToSet });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.get('/booking-payments-overview', authenticateSuperAdmin, async(req,res)=>{ 
  try{
    const bookings = await Booking.find().lean({});
    // Map the bookings to the desired frontend format
        const transformedBookings = bookings.map(booking => ({
            _id: booking._id, // Keep the original _id
            bookingID: booking.bookingID,
            // Access nested properties directly from the booking object
            agentName: booking.agent ? booking.agent.name : 'N/A',
            agentID: booking.agent ? booking.agent.agentID : 'N/A', // For the table
            customerName: booking.customer ? booking.customer.name : 'N/A',
            customerID: booking.customer ? booking.customer.id : 'N/A', // For the table
            tourName: booking.tour ? booking.tour.name : 'N/A',
            paymentStatus: booking.payment ? booking.payment.paymentStatus : 'N/A',
            amount: booking.payment ? booking.payment.totalAmount : 0, // Used for total calculations
            commissionAmount: booking.agent ? booking.agent.commission : 0, // Use agent.commission
            paymentDate: booking.payment ? booking.payment.paymentDate : null,
            
            // Pass the full nested objects if the frontend uses them for table display
            agent: booking.agent,
            customer: booking.customer,
            tour: booking.tour,
            payment: booking.payment,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        }));

        res.status(200).json({ bookings: transformedBookings });

  }
  catch(error){
    console.error("Error fetching booking payments overview : ", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
})

router.post('/agent/:id/remarks', authenticateSuperAdmin, async (req, res) => {
  const { id } = req.params;

  // console.log(req.params);
  // console.log(req.body);
  const { remarks } = req.body; 

  try {
    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    agent.remarks = remarks;

    await agent.save();

    res.status(200).json({ message: 'Remarks updated successfully', agent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// router.get('/security-key', authenticateSuperAdmin, (req, res) => {
//   try {
//     if (req.header('role') !== 'superadmin') {
//       return res.status(403).json({ error: 'Access denied' });
//     }
//     const securityKey = process.env.SUPERADMIN_SECURITY_KEY;

//     if (!securityKey) {
//       return res.status(500).json({ error: 'Security key not set in environment!' });
//     }

//     res.json({ securityKey });
//   } catch (error) {
//     console.error('Error getting SuperAdmin security key:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// router.put('/security-key', authenticateSuperAdmin, async (req, res) => {
//   try {
//     if (req.header('role') !== 'superadmin') {
//       return res.status(403).json({ error: 'Access denied' });
//     }

//     const { newKey } = req.body;
//     if (!newKey) {
//       return res.status(400).json({ error: 'New key is required' });
//     }
//     process.env.SUPERADMIN_SECURITY_KEY = newKey;
//     res.json({ message: 'Security key updated successfully!' });
//   } catch (error) {
//     console.log("Error occured while updating security key",error);
//     res.status(500).json({ error: 'Internal Server error occured while updating security key' });
//   }
// });

// router.post('/tours', authenticateSuperAdmin, upload.single('image'), async (req, res) => {
//   try {
//     const { categoryType, packageData } = req.body;

//     if (!categoryType || !packageData) {
//       return res.status(400).json({ message: 'Missing data' });
//     }

//     const parsedPackage = JSON.parse(packageData); 

//     const tour = await Tour.create({
//       categoryType: categoryType,
//       packages: [{
//         name: parsedPackage.name,
//         country: parsedPackage.country,
//         pricePerHead: parsedPackage.pricePerHead,
//         duration: parsedPackage.duration,
//         startDate: parsedPackage.startDate,
//         tourType: parsedPackage.tourType,
//         occupancy : parsedPackage.occupancy,
//         description: parsedPackage.description,
//         image: req.file ? req.file.buffer.toString('base64') : null,
//       }]
//     });

//     res.status(201).json({ message: 'Tour created', tour });
//   } catch (err) {
//     console.error('Error adding tour:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });
router.post('/tours', authenticateSuperAdmin,
  upload.fields([
    { name: 'image', maxCount: 1 },         // For the main tour image
    { name: 'galleryImages', maxCount: 10 } // For multiple gallery images, adjust maxCount as needed
  ]),
  async (req, res) => {
    try {
      const {
        name,
        categoryType,
        country,
        tourType,
        pricePerHead,
        GST,
        duration,
        occupancy,
        remainingOccupancy,
        startDate,
        description,
        highlights,
        inclusions,
        exclusions,
        thingsToPack,
        itinerary,
      } = req.body;

      // Basic validation for essential fields
      if (!name || !categoryType || !country || !tourType || !pricePerHead || !GST ||!duration || !occupancy || !startDate || !description) {
        return res.status(400).json({ message: 'Missing required tour data.' });
      }

      // Access files from req.files
      const mainImageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
      const galleryFiles = req.files && req.files['galleryImages'] ? req.files['galleryImages'] : [];

      let mainImageBase64 = null;
      if (mainImageFile) {
        mainImageBase64 = mainImageFile.buffer.toString('base64');
      } else {
        return res.status(400).json({ message: 'Main tour image is required.' });
      }

      const galleryBase64 = galleryFiles.map(file => file.buffer.toString('base64'));
      if (galleryBase64.length === 0) {
          return res.status(400).json({ message: 'At least one gallery image is required.' });
      }

      const parsedHighlights = Array.isArray(highlights) ? highlights : (highlights ? highlights.split(',').map(s => s.trim()) : []);
      const parsedInclusions = Array.isArray(inclusions) ? inclusions : (inclusions ? inclusions.split(',').map(s => s.trim()) : []);
      const parsedExclusions = Array.isArray(exclusions) ? exclusions : (exclusions ? exclusions.split(',').map(s => s.trim()) : []);
      const parsedThingsToPack = Array.isArray(thingsToPack) ? thingsToPack : (thingsToPack ? thingsToPack.split(',').map(s => s.trim()) : []);

      let parsedItinerary = [];
      try {
        parsedItinerary = itinerary ? JSON.parse(itinerary) : [];
        if (!Array.isArray(parsedItinerary) || parsedItinerary.some(day => !day.title || !Array.isArray(day.activities))) {
            return res.status(400).json({ message: 'Invalid itinerary format.' });
        }
      } catch (jsonError) {
        return res.status(400).json({ message: 'Invalid itinerary JSON format.' });
      }

      const newTour = await Tour.create({
        name: name,
        image: mainImageBase64, // Base64 string
        categoryType: categoryType,
        country: country,
        tourType: tourType,
        pricePerHead: Number(pricePerHead),
        GST: Number(GST),
        duration: Number(duration),
        occupancy: Number(occupancy),
        remainingOccupancy: remainingOccupancy ? Number(remainingOccupancy) : Number(occupancy), // Default to full occupancy
        startDate: new Date(startDate), // Convert to Date object
        description: description,
        highlights: parsedHighlights,
        inclusions: parsedInclusions,
        exclusions: parsedExclusions,
        thingsToPack: parsedThingsToPack,
        itinerary: parsedItinerary,
        gallery: galleryBase64, // Array of Base64 strings
      });

      res.status(201).json({ message: 'Tour added successfully!', tour: newTour });

    } catch (err) {
      console.error('Error adding tour:', err);
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message, errors: err.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

router.get('/tours', authenticateSuperAdmin, async (req, res) => {
  try {
    const tourDocs = await Tour.find({});

     const formattedTours = await Promise.all(tourDocs.map(async (tourDoc) => {
      // Check if there are any active bookings for this tour
      const hasBookings = await Booking.exists({ 'tour.tourID': tourDoc._id, status: { $in: ['pending', 'confirmed'] } });
      return {
        tourID: tourDoc._id, 
        name: tourDoc.name,
        country: tourDoc.country,
        pricePerHead: tourDoc.pricePerHead,
        GST: tourDoc.GST,
        duration: tourDoc.duration,
        startDate: tourDoc.startDate,
        description: tourDoc.description,
        occupancy: tourDoc.occupancy,
        remainingOccupancy: tourDoc.remainingOccupancy,
        tourType: tourDoc.tourType,
        categoryType: tourDoc.categoryType,
        
        image: tourDoc.image ? `data:image/jpeg;base64,${tourDoc.image}` : null,
        
        highlights: tourDoc.highlights || [], 
        inclusions: tourDoc.inclusions || [],
        exclusions: tourDoc.exclusions || [],
        thingsToPack: tourDoc.thingsToPack || [],

        // Itinerary is an array of objects
        itinerary: tourDoc.itinerary || [],

        // Gallery: Map each Base64 string in the gallery array to a data URL
        gallery: tourDoc.gallery && Array.isArray(tourDoc.gallery) 
                   ? tourDoc.gallery.map(imgBase64 => `data:image/jpeg;base64,${imgBase64}`) 
                   : [],
        hasBookings: !!hasBookings // true if any booking exists
      };
    }));

    res.json({ tours: formattedTours });
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ message: 'Server error while fetching tours', error });
  }
});

// router.get('/tours', authenticateSuperAdmin, async (req, res) => {
//   try {
//     const tourDocs = await Tour.find();

//     const formattedTours = tourDocs.flatMap((tourDoc) =>
//       tourDoc.packages.map((pkg) => ({
//         tourID: tourDoc._id,
//         name: pkg.name,
//         country: pkg.country,
//         pricePerHead: pkg.pricePerHead,
//         duration: pkg.duration,
//         startDate: pkg.startDate,
//         description: pkg.description,
//         remainingOccupancy: pkg.remainingOccupancy,
//         occupancy: pkg.occupancy,
//         image: pkg.image ? `data:image/jpeg;base64,${pkg.image}` : null,
//         categoryType: tourDoc.categoryType,
//       }))
//     );

//     res.json({ tours: formattedTours });
//   } catch (error) {
//     console.error('Error fetching tours:', error);
//     res.status(500).json({ message: 'Server error while fetching tours', error });
//   }
// });

router.get('/tours/:_id', authenticateSuperAdmin, async (req, res) => {
  // console.log(req.params._id)
    try {
        const tour = await Tour.findById(req.params._id);

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found.' });
        }

        res.json({ tour: formatTourForResponse(tour) });

    } catch (error) {
        console.error('Error fetching single tour:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid tour ID format.' }); 
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// router.put('/tours/:_id', authenticateSuperAdmin,
//   upload.fields([
//     { name: 'image', maxCount: 1 },         // For the main tour image (if updating)
//     { name: 'galleryImages', maxCount: 10 } // For new gallery images (if adding more)
//   ]),
//   async (req, res) => {
//     try {
//       const tourId = req.params._id;
//       const tour = await Tour.findById(tourId);

//       if (!tour) {
//         return res.status(404).json({ message: 'Tour not found.' });
//       }

//       const {
//         tourID, name, categoryType, country, tourType, pricePerHead,
//         duration, occupancy, remainingOccupancy, startDate, description,
//         highlights, inclusions, exclusions, thingsToPack, itinerary,
//         currentGallery // This will be an array of Base64 strings from existing gallery images
//       } = req.body;


//       // Prepare update object
//       const updateData = {
//           tourID, // Allow updating tourID if desired, Mongoose will handle uniqueness
//           name, categoryType, country, tourType, pricePerHead,
//           duration, occupancy, startDate, description,
//           updatedAt: Date.now(), // Manually set updatedAt as we are using findByIdAndUpdate
//       };

//       // Handle main image update
//       const mainImageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
//       if (mainImageFile) {
//         // updateData.image = bufferToBase64(mainImageFile.buffer);
//         updateData.image = mainImageFile.buffer.toString('base64');
//       } else {
//           // If no new image uploaded, and the old image is still valid (not empty), keep it.
//           // Frontend should handle the case where the user explicitly clears the main image.
//           // For now, if no new file, we retain the existing one.
//           updateData.image = tour.image;
//       }

//       // Handle gallery images update
//       let newGallery = [];
//       if (currentGallery) {
//           // currentGallery might be a single string if only one item, or an array
//           const parsedCurrentGallery = Array.isArray(currentGallery) ? currentGallery : [currentGallery];
//           newGallery = parsedCurrentGallery.filter(img => img); // Filter out any empty strings
//       }

//       const newGalleryFiles = req.files && req.files['galleryImages'] ? req.files['galleryImages'] : [];
//       // const newGalleryBase64 = newGalleryFiles.map(file => bufferToBase64(file.buffer));
//       const newGalleryBase64 = newGalleryFiles.map(file => file.buffer.toString('base64'));

//       updateData.gallery = [...newGallery, ...newGalleryBase64]; // Combine existing (kept) and new uploads

//       // Parse array/object fields from JSON string if they come that way
//       updateData.highlights = highlights ? (Array.isArray(highlights) ? highlights : JSON.parse(highlights)) : [];
//       updateData.inclusions = inclusions ? (Array.isArray(inclusions) ? inclusions : JSON.parse(inclusions)) : [];
//       updateData.exclusions = exclusions ? (Array.isArray(exclusions) ? exclusions : JSON.parse(exclusions)) : [];
//       updateData.thingsToPack = thingsToPack ? (Array.isArray(thingsToPack) ? thingsToPack : JSON.parse(thingsToPack)) : [];
//       try {
//         updateData.itinerary = itinerary ? JSON.parse(itinerary) : [];
//       } catch (jsonError) {
//         return res.status(400).json({ message: 'Invalid itinerary JSON format.' });
//       }

//       // Update remainingOccupancy only if occupancy explicitly provided and changed
//       if (occupancy !== undefined && Number(occupancy) !== tour.occupancy) {
//           // Adjust remaining based on the change in total occupancy
//           // This logic assumes current bookings are fixed, and changes only apply to future capacity
//           updateData.remainingOccupancy = Number(occupancy) - (tour.occupancy - tour.remainingOccupancy);
//           if (updateData.remainingOccupancy < 0) { // Ensure it doesn't go negative
//               updateData.remainingOccupancy = 0;
//           }
//       } else {
//           // If occupancy is not changed, keep the existing remainingOccupancy
//           updateData.remainingOccupancy = remainingOccupancy ? Number(remainingOccupancy) : tour.remainingOccupancy;
//       }


//       const updatedTour = await Tour.findByIdAndUpdate(
//         tourId,
//         { $set: updateData }, // Use $set to only update provided fields
//         { new: true, runValidators: true } // Return the updated doc, run schema validators
//       );

//       res.status(200).json({ message: 'Tour updated successfully!', tour: formatTourForResponse(updatedTour) });

//     } catch (err) {
//       console.error('Error updating tour:', err);
//       if (err.name === 'CastError') {
//         return res.status(400).json({ message: 'Invalid tour ID format.' });
//       }
//       if (err.name === 'ValidationError') {
//         const messages = Object.values(err.errors).map(val => val.message);
//         return res.status(400).json({ message: 'Validation failed: ' + messages.join(', ') });
//       }
//       if (err.code === 11000 && err.keyPattern && err.keyPattern.tourID) {
//           return res.status(400).json({ message: 'Tour ID already exists. Please use a unique ID.' });
//       }
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   }
// );

// NEW: DELETE /api/tours/:_id - Delete a tour by its MongoDB _id

// ... (previous code) ...

router.put('/tours/:_id', authenticateSuperAdmin,
  upload.fields([
    { name: 'image', maxCount: 1 },         // For the main tour image (if updating)
    { name: 'galleryImages', maxCount: 10 } // For new gallery images (if adding more)
  ]),
  async (req, res) => {
    try {
      const tourId = req.params._id;
      const tour = await Tour.findById(tourId);

      if (!tour) {
        return res.status(404).json({ message: 'Tour not found.' });
      }

      const hasBookings = await Booking.exists({ 'tour.tourID': tourId, status: { $in: ['pending', 'confirmed'] } });
      if (hasBookings) {
          return res.status(400).json({ message: 'Cannot edit tour: There are active bookings associated with this tour.' });
      }

      const {
        tourID, name, categoryType, country, tourType, pricePerHead, GST, 
        duration, occupancy, remainingOccupancy, startDate, description,
        highlights, inclusions, exclusions, thingsToPack, itinerary,
        currentGallery
      } = req.body;


      // Prepare update object
      const updateData = {
          tourID,
          name, categoryType, country, tourType, pricePerHead, GST, 
          duration, occupancy, startDate, description,
          updatedAt: Date.now(),
      };

      // Handle main image update
      const mainImageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
      if (mainImageFile) {
        // Use your preferred conversion method: raw Base64 string
        updateData.image = mainImageFile.buffer.toString('base64');
      } else {
          // If no new image uploaded, retain the existing raw Base64 string from the database.
          updateData.image = tour.image;
      }
      let retainedGallery = [];
      if (currentGallery) {
          const parsedCurrentGallery = Array.isArray(currentGallery) ? currentGallery : [currentGallery];
          // Strip the "data:image/...;base64," prefix for storage in DB
          retainedGallery = parsedCurrentGallery
                            .filter(img => img && img.startsWith('data:image/')) // Ensure valid
                            .map(img => img.split(',')[1]); // Get only the raw Base64 part
      }

      const newGalleryFiles = req.files && req.files['galleryImages'] ? req.files['galleryImages'] : [];
      // Convert newly uploaded files to raw Base64 string
      const newGalleryBase64 = newGalleryFiles.map(file => file.buffer.toString('base64'));

      // Combine retained existing gallery images (raw Base64) with newly uploaded ones (raw Base64)
      updateData.gallery = [...retainedGallery, ...newGalleryBase64];

      // Parse array/object fields from JSON string if they come that way
      updateData.highlights = highlights ? (Array.isArray(highlights) ? highlights : JSON.parse(highlights)) : [];
      updateData.inclusions = inclusions ? (Array.isArray(inclusions) ? inclusions : JSON.parse(inclusions)) : [];
      updateData.exclusions = exclusions ? (Array.isArray(exclusions) ? exclusions : JSON.parse(exclusions)) : [];
      updateData.thingsToPack = thingsToPack ? (Array.isArray(thingsToPack) ? thingsToPack : JSON.parse(thingsToPack)) : [];
      try {
        updateData.itinerary = itinerary ? JSON.parse(itinerary) : [];
      } catch (jsonError) {
        return res.status(400).json({ message: 'Invalid itinerary JSON format.' });
      }

      // Update remainingOccupancy only if occupancy explicitly provided and changed
      if (occupancy !== undefined && Number(occupancy) !== tour.occupancy) {
          // Adjust remaining based on the change in total occupancy
          updateData.remainingOccupancy = Number(occupancy) - (tour.occupancy - tour.remainingOccupancy);
          if (updateData.remainingOccupancy < 0) {
              updateData.remainingOccupancy = 0;
          }
      } else {
          // If occupancy is not changed, keep the existing remainingOccupancy
          updateData.remainingOccupancy = remainingOccupancy ? Number(remainingOccupancy) : tour.remainingOccupancy;
      }

      const updatedTour = await Tour.findByIdAndUpdate(
        tourId,
        { $set: updateData }, // Use $set to only update provided fields
        { new: true, runValidators: true } // Return the updated doc, run schema validators
      );

      res.status(200).json({ message: 'Tour updated successfully!', tour: formatTourForResponse(updatedTour) });

    } catch (err) {
      console.error('Error updating tour:', err);
      if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid tour ID format.' });
      }
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation failed: ' + messages.join(', ') });
      }
      if (err.code === 11000 && err.keyPattern && err.keyPattern.tourID) {
          return res.status(400).json({ message: 'Tour ID already exists. Please use a unique ID.' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

router.delete('/tours/:_id', authenticateSuperAdmin, async (req, res) => {
    try {
        const tourId = req.params._id;
        const tour = await Tour.findByIdAndDelete(tourId); // Directly find and delete

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found.' });
        }

        const hasBookings = await Booking.exists({ 'tour.tourID': tourId, status: { $in: ['pending', 'confirmed'] } });
        if (hasBookings) {
            return res.status(400).json({ message: 'Cannot delete tour: There are active bookings associated with this tour.' });
        }

        res.status(200).json({ message: 'Tour deleted successfully!' });

    } catch (error) {
        console.error('Error deleting tour:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid tour ID format.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// MODIFIED: GET /pending-cancellations
// This endpoint now fetches Booking documents where at least one traveler has cancellationRequested: true
router.get('/pending-cancellations', authenticateSuperAdmin, async (req, res) => {
  try {
    // Find bookings that have at least one traveler requesting cancellation
    const pendingBookings = await Booking.find({
      'travelers.cancellationRequested': true,
      'travelers.cancellationApproved': false,
      'travelers.cancellationRejected': false
    }).sort({ bookingDate: -1 });
    // Filter to only include bookings where some travelers are actually pending
    const filteredPendingBookings = pendingBookings.filter(booking => 
        booking.travelers.some(traveler => traveler.cancellationRequested && !traveler.cancellationApproved && !traveler.cancellationRejected)
    );

    // Return the full booking details, frontend will extract traveler-specific info
    return res.status(200).json({ pending: filteredPendingBookings });

  } catch (error) {
    console.error("Error fetching pending cancellations:", error);
    return res.status(500).json({ error: "Failed to fetch pending cancellations.", details: error.message });
  }
});


// NEW CONSOLIDATED: PUT /process-cancellation/:bookingId
// This endpoint handles both approving and rejecting individual traveler cancellations,
// and potentially a full booking cancellation based on travelerIds array.
router.put('/process-cancellation/:bookingId', authenticateSuperAdmin, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { travelerIds, action, deductionPercentage } = req.body; // action: 'approve' or 'reject'

    if (!action || (action !== 'approve' && action !== 'reject')) {
        return res.status(400).json({ message: 'Invalid action specified. Must be "approve" or "reject".' });
    }
    if (!Array.isArray(travelerIds) || travelerIds.length === 0) {
        return res.status(400).json({ message: 'No traveler IDs provided for processing cancellation.' });
    }
    if (action === 'approve' && (deductionPercentage === undefined || deductionPercentage < 0 || deductionPercentage > 100)) {
        return res.status(400).json({ message: 'Deduction percentage is required for approval and must be between 0 and 100.' });
    }

    const booking = await Booking.findOne({ bookingID: bookingId });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const tourDate = new Date(booking.tour.startDate);
    if (tourDate <= new Date()) {
      return res.status(400).json({ message: 'Cannot process cancellation for past or ongoing tour bookings.' });
    }

    const processedTravelerNames = [];
    let totalRefundAmount = 0;
    let anyTravelerUpdated = false;

    for (const travelerId of travelerIds) {
      const traveler = booking.travelers.id(travelerId);
      if (traveler) {
        // Only process if the traveler has a pending cancellation request
        if (traveler.cancellationRequested && !traveler.cancellationApproved && !traveler.cancellationRejected) {
          if (action === 'approve') {
            traveler.cancellationApproved = true;
            traveler.cancellationRequested = false; // Mark request as handled
            // traveler.cancellationReason = cancellationReason || '';

            // Calculate refund for this specific traveler
            const travelerPrice = booking.tour.pricePerHead;
            const refundForTraveler = travelerPrice * ((100 - deductionPercentage) / 100);
            totalRefundAmount += refundForTraveler;
            // You might want to store refundAmount per traveler or in a separate Transaction record
            // For now, we'll track the sum.

            processedTravelerNames.push(`${traveler.name} (Approved with ${deductionPercentage}% deduction)`);
            anyTravelerUpdated = true;

            // TODO: Logic for updating actual Transaction for this traveler's portion
            // This is complex for partials. A robust solution needs:
            // 1. A way to link individual traveler payments/commissions to a transaction.
            // 2. Or, update a single transaction to reflect partial refund/commission reversal.
            // For now, this is a placeholder. Need to define how commissions are handled
            // for partial cancellations in your Transaction model.
            // Example Placeholder: Find relevant transaction, adjust its commission for this traveler.
            // This would likely involve finding the specific agent who booked this, and their commission on the *initial* total booking.
            // If need to reverse a specific commission for THIS traveler's share, that logic needs to be added here.
            // For example:
            // const agent = await Agent.findOne({ agentID: booking.agent.agentId });
            // if (agent) {
            //     const commissionToReverse = (booking.agent.commission / booking.travelers.length); // simple pro-rata
            //     agent.walletBalance -= commissionToReverse;
            //     await agent.save();
            //     // might also need to log this in a commission history
            // }

          } else if (action === 'reject') {
            traveler.cancellationRejected = true;
            traveler.cancellationRequested = false; // Mark request as handled
            traveler.cancellationReason = cancellationReason || 'Rejected by Superadmin.';
            processedTravelerNames.push(`${traveler.name} (Rejected)`);
            anyTravelerUpdated = true;
          }
        } else {
          // Traveler not in pending state or already processed
          processedTravelerNames.push(`${traveler.name} (skipped - not pending or already processed)`);
        }
      } else {
        log(`Traveler with ID ${travelerId} not found in booking ${bookingId}`);
      }
    }

    if (!anyTravelerUpdated) {
        return res.status(400).json({ message: 'No eligible travelers found for cancellation or their status is not pending.' });
    }

    await booking.save(); // Save the updated booking with traveler statuses

    const responseMessage = `${action === 'approve' ? 'Approved' : 'Rejected'} cancellation for travelers: ${processedTravelerNames.join(', ')}.`;

    res.status(200).json({
      message: responseMessage,
      updatedBooking: booking,
      totalRefundAmount: action === 'approve' ? totalRefundAmount : 0 // Only relevant for approval
    });

  } catch (error) {
    console.error('Error processing cancellation:', error);
    res.status(500).json({ message: 'Server error while processing cancellation', details: error.message });
  }
});

//Rejected Cancellation code is pending  

router.get('/:id', authenticateSuperAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const agent = await Agent.findById(id).lean();
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    res.json(agent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;