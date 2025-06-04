const express = require('express');
const bcrypt = require('bcrypt');
const Agent = require('../models/Agent'); 
const Transaction = require('../models/Transaction');
const Superadmin = require('../models/Superadmin');
const Tour = require('../models/Tour');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer(); // Memory storage if you're using base64 directly

const authenticateSuperAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'superadmin') {
          return res.status(403).json({ error: 'Access denied: Not SuperAdmin' });
      }
      req.user = decoded;
      next();
  } catch (error) {
    console.error("SuperAdmin Auth Error:", error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
}
};

function formatTourForResponse(tour) {
    return {
        tourID: tour._id,
        name: tour.name,
        // image: tour.image,
        image: tour.image ? `data:image/jpeg;base64,${tour.image}` : null,
        categoryType: tour.categoryType,
        country: tour.country,
        tourType: tour.tourType,
        pricePerHead: tour.pricePerHead,
        GST: tour.GST,
        duration: tour.duration,
        occupancy: tour.occupancy,
        remainingOccupancy: tour.remainingOccupancy,
        startDate: tour.startDate,
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

router.get('/all-users', authenticateSuperAdmin, async(req,res)=>{
  try{
    const agents = await Agent.find();
    res.json({agents});
  }
  catch(error){
    console.error("Error fetching all users : ", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
})

router.get('/inactive-count',authenticateSuperAdmin, async (req, res) => {
  try {
    const count = await Agent.countDocuments({ status: 'inactive' });
    res.json({ count });
  } catch (err) {
    console.error("Error:",err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

router.post('/update-status', authenticateSuperAdmin, async (req, res) => {
  const { userId, status } = req.body;
  try {
    await Agent.findByIdAndUpdate(userId, { status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

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

    const formattedTours = tourDocs.map((tourDoc) => {
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
      };
    });

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

        res.status(200).json({ message: 'Tour deleted successfully!' });

    } catch (error) {
        console.error('Error deleting tour:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid tour ID format.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/pending-cancellations', authenticateSuperAdmin, async (req, res) => {
  try {
    const pending = await Transaction.find({ 
      cancellationRequested: true, 
      cancellationApproved: false, 
      cancellationRejected: false 
    });
    
    return res.json({ pending });
  } catch (error) {
    console.error("Error fetching pending cancellations:", error);
    return res.status(500).json({ error: "Failed to fetch pending cancellations." });
  }
});

router.put('/approve-cancellation/:transactionId', authenticateSuperAdmin, async (req, res) => {
  // if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Forbidden' });

  const { transactionId } = req.params;
  const { deductionPercentage } = req.body;

  const transaction = await Transaction.findOne({ transactionId });
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

  if (transaction.cancellationApproved || transaction.cancellationRejected) {
    return res.status(400).json({ message: 'Already processed' });
  }
  const totalPriceTour = transaction.tourGivenOccupancy * transaction.tourPricePerHead;
  const refundAmount = totalPriceTour * ((100 - deductionPercentage) / 100);
  transaction.cancellationApproved = true;
  transaction.refundAmount = refundAmount;
  transaction.deductionPercentage = deductionPercentage;

  const tour = await Tour.findById(transaction.tourID);
  const pkg = tour?.packages[0];
  if (pkg) {
    pkg.remainingOccupancy += transaction.tourGivenOccupancy;
    await tour.save();
  }

  await transaction.save();

  // TODO: Add refund payment processing logic here (e.g., Razorpay refund or wallet credit)

  res.status(200).json({ message: 'Cancellation approved and refund processed', refundAmount });
});

router.put('/reject-cancellation/:transactionId', authenticateSuperAdmin, async (req, res) => {
  // if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Forbidden' });

  const { transactionId } = req.params;
  const transaction = await Transaction.findOne({ transactionId });

  if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

  transaction.cancellationRejected = true;
  await transaction.save();

  res.status(200).json({ message: 'Cancellation request rejected' });
});

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