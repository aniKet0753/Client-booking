const express = require('express');
const bcrypt = require('bcrypt');
const authenticateSuperAdmin = require('../middleware/authSuperadminMiddleware');
const Agent = require('../models/Agent'); 
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Superadmin = require('../models/Superadmin');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const AgentTourStats = require('../models/AgentTourStats');
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
        packageRates: tour.packageRates, // Include package rates
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

router.get('/all-agents-name-id',authenticateSuperAdmin, async (req, res) => {
  try {
    const agents = await Agent.find({status:'active'}, 'name agentID'); // Only fetch name and agentID fields
    const result = agents.map(agent => ({
      name: agent.name,
      agentID: agent.agentID
    }));
    res.json(result);
  } catch (error) {
    console.error("Error fetching all agents: ", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
});

router.get('/agents/status-count', authenticateSuperAdmin, async (req, res) => {
  try {
    // Count agents by status
    const activeCount = await Agent.countDocuments({ status: 'active' });
    const inactiveCount = await Agent.countDocuments({ status: 'inactive' });
    const pendingCount = await Agent.countDocuments({ status: 'pending' });
    const totalCount = await Agent.countDocuments({});

    res.json({
      counts: {
        active: activeCount,
        inactive: inactiveCount,
        pending: pendingCount,
        total: totalCount
      },
    });

  } catch (error) {
    console.error("Error fetching all agents: ", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
});

// const buildAgentTree = async (agent) => {
//   const children = await Agent.find({ parentAgent: agent._id, status:'active' });

//   const directChildren = children.map(child => ({
//     _id: child._id,
//     name: child.name,
//     agentID: child.agentID,
//   }));

//   return {
//     _id: agent._id,
//     name: agent.name,
//     agentID: agent.agentID,
//     children: directChildren,
//   };
// };

const buildAgentTree = async (agent) => {
  const children = await Agent.find({ parentAgent: agent._id, status: 'active' });

  const childTrees = await Promise.all(
    children.map(async (child) => {
      const subTree = await buildAgentTree(child);
      return {
        _id: child._id,
        name: child.name,
        agentID: child.agentID,
        children: subTree.children, // Recursive children
      };
    })
  );

  return {
    _id: agent._id,
    name: agent.name,
    agentID: agent.agentID,
    children: childTrees,
  };
};

router.get('/agent/:agentId/tree', authenticateSuperAdmin, async (req, res) => {
  try {
    const {agentId} = req.params;
    const agentID = agentId;
    // console.log(agentID);
    const agent = await Agent.findOne({agentID});
    // console.log(agent)
    const currentAgentId = agent._id;
    console.log(currentAgentId.toString())
    const currentAgent = await Agent.findById(currentAgentId.toString()).populate('parentAgent');
    if (!currentAgent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    let parentAgentDetails = null;
    if (currentAgent.parentAgent) {
      parentAgentDetails = await Agent.findById(currentAgent.parentAgent, 'name agentID');
    }

    const treeWithChildren = await buildAgentTree(currentAgent);

    const tree = {
      ...treeWithChildren,
      parent: currentAgent.parentAgent
        ? {
            _id: currentAgent.parentAgent._id,
            name: currentAgent.parentAgent.name,
          }
        : null,
    };

    // res.json({ tree });
    res.json({ agent: currentAgent, tree, parent: parentAgentDetails || null });
  } catch (error) {
    console.error('Error fetching agent tree:', error);
    res.status(500).json({ error: 'Failed to fetch agent tree' });
  }
});

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
    const { startDate, endDate } = req.query; // Extract startDate and endDate from query parameters
    let query = {};

    if (startDate || endDate) {
        query.paymentDate = {}; // Filter by paymentDate for bookings
        if (startDate) {
            query.paymentDate.$gte = new Date(startDate);
        }
        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999); // Set to end of the day for inclusive range
            query.paymentDate.$lte = endOfDay;
        }
    }

    // Find bookings based on the constructed query
    const bookings = await Booking.find(query)
                                 .populate('agent') // Populate agent details
                                 .populate('customer') // Populate customer details
                                 .populate('tour') // Populate tour details
                                 .populate('payment') // Populate payment details
                                 .lean(); // Return plain JavaScript objects

    // Map the bookings to the desired frontend format
    const transformedBookings = bookings.map(booking => ({
        _id: booking._id, // Keep the original _id
        bookingID: booking.bookingID,
        // Access populated properties
        agentName: booking.agent ? booking.agent.name : 'N/A',
        agentID: booking.agent ? booking.agent.agentID : 'N/A',
        customerName: booking.customer ? booking.customer.name : 'N/A',
        customerID: booking.customer ? booking.customer.id : 'N/A',
        tourName: booking.tour ? booking.tour.name : 'N/A',
        paymentStatus: booking.payment ? booking.payment.paymentStatus : 'N/A',
        amount: booking.payment ? booking.payment.totalAmount : 0,
        commissionAmount: booking.agent ? booking.agent.commission : 0, // Assuming agent.commission is the correct field
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
    res.status(500).json({ message: "Server error while fetching booking payments overview" });
  }
})

router.get('/agent-commission-stats', authenticateSuperAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};

        if (startDate || endDate) {
            query.tourStartDate = {};
            if (startDate) {
                // IMPORTANT CHANGE: Use the string directly for comparison
                query.tourStartDate.$gte = startDate;
            }
            if (endDate) {
                // IMPORTANT CHANGE: Use the string directly for comparison, no endOfDay needed for string dates
                query.tourStartDate.$lte = endDate;
            }
        }

        const agentTourStats = await AgentTourStats.find(query).sort({ tourStartDate: -1 }).lean();

        // Manual lookup for agent details (since agentID is a string and not populated automatically)
        const uniqueAgentIDs = [...new Set(agentTourStats.map(stat => stat.agentID))];
        const agents = await Agent.find({ agentID: { $in: uniqueAgentIDs } }).select('name agentID').lean();
        const agentMap = agents.reduce((acc, agent) => {
            acc[agent.agentID] = { name: agent.name, agentID: agent.agentID };
            return acc;
        }, {});

        const populatedAgentTourStats = agentTourStats.map(stat => {
            const agentInfo = agentMap[stat.agentID] || { name: 'Unknown Agent', agentID: stat.agentID }; // Fallback
            return {
                ...stat,
                agentID: agentInfo // Replace the string agentID with the desired object
            };
        });

        res.status(200).json({
            success: true,
            agentTourStats: populatedAgentTourStats
        });

    } catch (error) {
        console.error('Error fetching agent commission stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// Existing: POST /api/admin/pay-commission (no changes needed)
router.post('/pay-commission/:id', authenticateSuperAdmin, async (req, res) => { // Added :id to path
    try {
        const { id } = req.params; // Get id from req.params as it's a URL parameter
        // Get current date in YYYY-MM-DD format
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        const commissionPaidDateString = `${year}-${month}-${day}`;

        const updatedStat = await AgentTourStats.findByIdAndUpdate(
            id,
            { 
              CommissionPaid: true, 
              CommissionPaidDate: commissionPaidDateString
            },
            { new: true } // Return the updated document
        );

        if (!updatedStat) {
            return res.status(404).json({ success: false, message: 'Commission record not found.' });
        }

        res.status(200).json({ success: true, message: 'Commission marked as paid.', updatedStat });
    } catch (error) {
        console.error('Error paying commission:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
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
        childRate,
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
      if (!name || !categoryType || !country || !tourType || !pricePerHead || !childRate || !GST ||!duration || !occupancy || !startDate || !description) {
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
        packageRates: {
          adultRate: Number(pricePerHead), // Assuming adult rate = price per head
          childRate: Number(childRate),    // Child rate
        },
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

router.post('/tours/create-new-expired-tour', authenticateSuperAdmin, async (req, res) => {
  // console.log("req.body",req.body);
  try {
    const { originalTourID, newStartDate } = req.body;
    if(new Date(newStartDate) < new Date()){
      return res.status(400).json({ message: 'New start date must be in the future.' });
    }
    if (!originalTourID || !newStartDate) {
      return res.status(400).json({ message: 'originalTourID and newStartDate are required.' });
    }
    const originalTour = await Tour.findById(originalTourID);
    if (!originalTour) {
      return res.status(404).json({ message: 'Original tour not found.' });
    }

    const newTour = new Tour({
      name: originalTour.name,
      image: originalTour.image,
      categoryType: originalTour.categoryType,
      country: originalTour.country,
      tourType: originalTour.tourType,
      pricePerHead: originalTour.pricePerHead,
      packageRates: originalTour.packageRates,
      GST: originalTour.GST,
      duration: originalTour.duration,
      occupancy: originalTour.occupancy,
      remainingOccupancy: originalTour.occupancy, // Reset to full occupancy
      startDate: new Date(newStartDate),
      description: originalTour.description,
      highlights: originalTour.highlights,
      inclusions: originalTour.inclusions,
      exclusions: originalTour.exclusions,
      thingsToPack: originalTour.thingsToPack,
      itinerary: originalTour.itinerary,
      gallery: originalTour.gallery,
    });

    if(originalTour.canCreateNewTour === true){
      originalTour.canCreateNewTour = false;
    } else{
      return res.status(400).json({ message: 'A new tour has already been created from this expired tour.' });
    }
    await originalTour.save();

    await newTour.save();
    console.log("New tour created successfully!")
    res.status(201).json({ message: 'New tour created successfully!', tour: newTour });
  } catch (error) {
    console.error('Error creating new tour from expired:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/tours', authenticateSuperAdmin, async (req, res) => {
  try {
    const tourDocs = await Tour.find({});

     const formattedTours = await Promise.all(tourDocs.map(async (tourDoc) => {
      // Check if there are any active bookings for this tour
      const hasBookings = await Booking.exists({ 'tour.tourID': tourDoc._id, status: { $in: ['pending', 'confirmed'] } });
      const isExpired = new Date(tourDoc.startDate) < new Date();
      const canCreateNewTour = await tourDoc.canCreateNewTour;
      
      console.log(canCreateNewTour);
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
        packageRates:tourDoc.packageRates || {}, // Ensure packageRates is always an object
        // Itinerary is an array of objects
        itinerary: tourDoc.itinerary || [],

        // Gallery: Map each Base64 string in the gallery array to a data URL
        gallery: tourDoc.gallery && Array.isArray(tourDoc.gallery) 
                   ? tourDoc.gallery.map(imgBase64 => `data:image/jpeg;base64,${imgBase64}`) 
                   : [],
        hasBookings: !!hasBookings, // true if any booking exists
        isExpired: isExpired, // true if the tour start date is in the past
        canCreateNewTour: canCreateNewTour // whether a new tour can be created from this expired one
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


// // Helper function to format date to YYYY-MM-DD
// const formatDateToYYYYMMDD = (date) => {
//     if (!date) return '';
//     const d = new Date(date);
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const day = String(d.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
// };

// // Route to get data for Agent Dump CSV
// router.get('/agent-dump-csv', authenticateSuperAdmin, async (req, res) => {
//     try {
//         // Fetch all agents
//         const agents = await Agent.find().lean();

//         // Fetch all relevant AgentTourStats and populate booking and agenx
//         // We need to fetch all AgentTourStats to calculate total commissions per agent
//         const allAgentTourStats = await AgentTourStats.find()
//             .populate({
//                 path: 'booking',
//                 select: 'bookingID tour.name tour.startDate payment.totalAmount travelers.name travelers.age travelers.gender travelers.cancellationRequested travelers.cancellationApproved travelers.cancellationRejected travelers.cancellationReason'
//             })
//             .populate({
//                 path: 'agent',
//                 select: 'name agentID' // Populate agent details to ensure accurate mapping
//             })
//             .lean();

//         // Map to store aggregated commission data per agent
//         const agentCommissionMap = new Map(); // Key: agent._id, Value: { totalEarned, totalPaid, totalPending, tours: [] }

//         allAgentTourStats.forEach(stat => {
//             const agentId = stat.agent._id.toString(); // Use agent's ObjectId as key
//             if (!agentCommissionMap.has(agentId)) {
//                 agentCommissionMap.set(agentId, {
//                     totalEarned: 0,
//                     totalPaid: 0,
//                     totalPending: 0,
//                     tours: [] // Store individual tour stats for this agent
//                 });
//             }
//             const agentStats = agentCommissionMap.get(agentId);
//             const commission = stat.commissionReceived || 0;
//             agentStats.totalEarned += commission;
//             if (stat.CommissionPaid) {
//                 agentStats.totalPaid += commission;
//             } else {
//                 agentStats.totalPending += commission;
//             }

//             // Push relevant tour details for the dump
//             agentStats.tours.push({
//                 tourID: stat.tourID,
//                 tourDueDate: stat.tourStartDate,
//                 tourCommission: commission,
//                 tourCommissionStatus: stat.CommissionPaid,
//                 CommissionPaidDate: stat.CommissionPaidDate,
//                 bookingID: stat.bookingStringID, // Use the string booking ID
//                 customerGiven: stat.customerGiven,
//                 adultsCount: stat.adultsCount,
//                 childrenCount: stat.childrenCount,
//                 cancelledTravelersCount: stat.cancelledTravelersCount
//             });
//         });

//         const agentDumpData = agents.map(agent => {
//             const commissionData = agentCommissionMap.get(agent._id.toString()) || {
//                 totalEarned: 0,
//                 totalPaid: 0,
//                 totalPending: 0,
//                 tours: []
//             };

//             // Prepare parent agent info
//             let parentAgentName = 'N/A';
//             let parentAgentId = 'N/A';
//             if (agent.parentAgent) {
//                 // This would require another populate if parentAgent is an ObjectId,
//                 // or a separate lookup if you only store the string ID.
//                 // For simplicity, assuming parentAgent is already populated or can be looked up.
//                 // If parentAgent is just an ID string, you'd need to fetch that agent.
//                 // For now, let's assume it's just the ID string from agent.parentAgent.
//                 // If you need the name, you'd need to fetch it.
//                 // For this dump, we'll use the ID string if available.
//                 parentAgentId = agent.parentAgent; // This is the ObjectId string
//             }

//             // To get the parent agent's name, you'd need to fetch it.
//             // For now, we'll leave it as N/A unless you have a populated parentAgent field.
//             // If agent.parentAgent is populated, you can access agent.parentAgent.name and agent.parentAgent.agentID

//             return {
//                 // Agent details
//                 'S/L': '', // Serial number, can be filled on frontend or during CSV generation
//                 'Agent name': agent.name || '',
//                 'Gender': agent.gender || '',
//                 'DOB': formatDateToYYYYMMDD(agent.dob),
//                 'Age': agent.age || '',
//                 'Phone No. Calling': agent.phone_calling || '',
//                 'Phone No. Whatsaap': agent.phone_whatsapp || '',
//                 'Flat No.': agent.permanent_address?.flat_name || '',
//                 'Locality': agent.permanent_address?.road_no || '', // Assuming road_no maps to Locality
//                 'City': agent.permanent_address?.district || '', // Assuming district maps to City
//                 'Pin Code': agent.permanent_address?.pincode || '',
//                 'PS': agent.permanent_address?.police_station || '',
//                 'State': agent.permanent_address?.state || '',
//                 'Country': 'India', // Assuming all agents are from India
//                 'Aadhar Card Number': agent.aadhar_card || '',
//                 'PAN Card Number': agent.pan_card || '',
//                 'Date of onboarding': formatDateToYYYYMMDD(agent.createdAt),
//                 'Agent ID': agent.agentID || '',
//                 'Referral Code': '', // Placeholder, if you have this field
//                 'Child agent name': '', // This would require fetching child agents
//                 'Child agent Id': '', // This would require fetching child agents
//                 // Tour-specific details (if an agent has multiple tours, this will be duplicated rows for the agent)
//                 'Booking Id': commissionData.tours.length > 0 ? commissionData.tours[0].bookingID : '', // Take first booking for this row
//                 'Destination': commissionData.tours.length > 0 ? commissionData.tours[0].tourID : '', // Using tourID as destination placeholder
//                 'Date of journy': commissionData.tours.length > 0 ? formatDateToYYYYMMDD(commissionData.tours[0].tourDueDate) : '',
//                 'Packag price for Adult': commissionData.tours.length > 0 ? commissionData.tours[0].tourPricePerHead : 0, // Assuming this is per adult
//                 'Packag price for Child': 0, // Placeholder, if you have separate child pricing
//                 'Total Occupancy': commissionData.tours.length > 0 ? commissionData.tours[0].adultsCount + commissionData.tours[0].childrenCount : 0,
//                 'Date of booking': commissionData.tours.length > 0 ? formatDateToYYYYMMDD(commissionData.tours[0].bookingDate) : '',
//                 'No. of Adult provided by agent': commissionData.tours.length > 0 ? commissionData.tours[0].adultsCount : 0,
//                 'No. of Child provided by agent': commissionData.tours.length > 0 ? commissionData.tours[0].childrenCount : 0,
//                 'No. of Adult provided by Sub agent': '', // Requires logic to determine if sub-agent involved
//                 'No. of Child provided by Sub agent': '', // Requires logic to determine if sub-agent involved
//                 'Provided occupancy rate': '', // Placeholder, if you have this
//                 'Percentage rate of commision for sub agent': '', // Placeholder
//                 'Percentage rate of commision for agent': commissionData.tours.length > 0 ? commissionData.tours[0].commissionRate : 0,
//                 'Due date of payment': commissionData.tours.length > 0 ? formatDateToYYYYMMDD(commissionData.tours[0].tourDueDate) : '',
//                 'Date of payment': commissionData.tours.length > 0 ? formatDateToYYYYMMDD(commissionData.tours[0].CommissionPaidDate) : '',
//                 'Commission paid': commissionData.totalPaid,
//                 'Commission to be paid': commissionData.totalPending,
//                 'No.of cancled booking': commissionData.tours.length > 0 ? commissionData.tours[0].cancelledTravelersCount : 0,
//                 'Deduction of comission against cancelation': commissionData.tours.length > 0 ? commissionData.tours[0].commissionDeductionAmount : 0,
//                 'JPG/PDF of aadhar Card of Agent': agent.aadhaarPhotoFront || '',
//                 'JPG/PDF of PAN Card of Agent': agent.panCardPhoto || '',
//             };
//         });

//         console.log(agentDumpData);
//         res.status(200).json({ success: true, data: agentDumpData });

//     } catch (error) {
//         console.error('Error fetching agent dump data:', error);
//         res.status(500).json({ success: false, message: 'Server Error', error: error.message });
//     }
// });

// // Route to get data for Customer Dump CSV
// router.get('/customer-dump-csv', authenticateSuperAdmin, async (req, res) => {
//     try {
//         // Fetch all bookings and populate necessary fields
//         const bookings = await Booking.find()
//             .populate({
//                 path: 'customer',
//                 select: 'name email phone address altPhone dob age gender aadhar pan whatsapp disability medicalCondition medicalInsurance'
//             })
//             .populate({
//                 path: 'agent',
//                 select: 'name agentID'
//             })
//             .populate({
//                 path: 'travelers', // Populate travelers within the booking
//                 select: 'name age gender cancellationRequested cancellationApproved cancellationRejected cancellationReason'
//             })
//             .lean();

//         const customerDumpData = [];

//         for (const booking of bookings) {
//             const customer = booking.customer || {};
//             const agent = booking.agent || {}; // Agent might be null for direct bookings

//             // Handle multiple co-passengers
//             const coPassengers = booking.travelers
//                 .filter(t => t.name !== customer.name) // Exclude the main customer if they are also in travelers
//                 .map(t => t.name)
//                 .join(', ');

//             // Calculate adults and children from travelers
//             let adults = 0;
//             let children = 0;
//             booking.travelers.forEach(traveler => {
//                 if (traveler.age >= 12) { // Assuming 12 is the cutoff for adult
//                     adults++;
//                 } else {
//                     children++;
//                 }
//             });

//             // Count cancelled members
//             const cancelledMembers = booking.travelers.filter(t => t.cancellationApproved).length;

//             customerDumpData.push({
//                 'S/L': '', // Serial number, can be filled on frontend or during CSV generation
//                 'Date of Dump': formatDateToYYYYMMDD(new Date()), // Current date
//                 'Date of booking': formatDateToYYYYMMDD(booking.bookingDate),
//                 'Booking Email ID': customer.email || '',
//                 'Booking ID': booking.bookingID || '',
//                 'Date of journey': formatDateToYYYYMMDD(booking.tour?.startDate),
//                 'Name of customer': customer.name || '',
//                 'Name of co-passengers': coPassengers || '',
//                 'Gender': customer.gender || '',
//                 'DOB': customer.dob || '',
//                 'Age': customer.age || '',
//                 'Phone No. Calling': customer.phone || '',
//                 'Emergency Contact': customer.altPhone || '',
//                 'Phone No. Whatsaap': customer.whatsapp || '',
//                 'Flat No.': customer.address?.split(',')[0] || '', // Simple split, adjust if address structure is complex
//                 'Locality': customer.address?.split(',')[1] || '',
//                 'City': customer.address?.split(',')[2] || '',
//                 'Pin Code': customer.address?.split(',')[3] || '',
//                 'PS': '', // Placeholder, if not in customer address
//                 'State': customer.address?.split(',')[4] || '',
//                 'Country': 'India', // Assuming all customers are from India
//                 'Aadhar Card Number': customer.aadhar || '',
//                 'PAN Card Number': customer.pan || '',
//                 'Birth Certificate': '', // Placeholder, if you collect this
//                 'Disability (if any)': customer.disability || '',
//                 'Medical condition': customer.medicalCondition || '',
//                 'Tour Type': booking.tour?.tourType || '',
//                 'Package selected': booking.tour?.name || '',
//                 'Agent Name': agent.name || 'Direct Booking',
//                 'Agent ID': agent.agentID || 'N/A',
//                 'Selected Trip': booking.tour?.name || '', // Duplicate of Package selected, based on CSV
//                 'No. of Co-passanger': booking.travelers.length > 0 ? booking.travelers.length - 1 : 0, // Total travelers minus main customer
//                 'JPG/PDF of aadhar Card of passanger': '', // Placeholder, if you store this
//                 'JPG/PDF of PAN Card of passanger': '', // Placeholder, if you store this
//                 'Bank Name': '', // Placeholder, if you collect this
//                 'Account holder name': '', // Placeholder
//                 'Bank Account No': '', // Placeholder
//                 'IFSC Code': '', // Placeholder
//                 'No. of adults': adults,
//                 'No. of Child': children,
//                 'Package rate for adult': booking.tour?.pricePerHead || 0,
//                 'Package rate for child': 0, // Placeholder
//                 'Total Amount paid by customer': booking.payment?.totalAmount || 0,
//                 'UTR Number': booking.payment?.transactionId || '',
//                 'Canceled booking of members(Only Nos.)': cancelledMembers,
//                 'Refund against cancellation': '', // Placeholder, requires calculation
//             });
//         }

//         res.status(200).json({ success: true, data: customerDumpData });

//     } catch (error) {
//         console.error('Error fetching customer dump data:', error);
//         res.status(500).json({ success: false, message: 'Server Error', error: error.message });
//     }
// });



// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date) => {
    if (!date) return '';
    const d = new Date(date);
    // Ensure the date is treated as UTC to prevent timezone issues with new Date()
    // or specifically format it to a local timezone if that's the intention
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Route to get data for Agent Dump CSV
router.get('/agent-dump-csv', authenticateSuperAdmin, async (req, res) => {
    try {
        // Fetch all agents
        const agents = await Agent.find().lean();
        const agentDataMap = new Map(agents.map(agent => [agent._id.toString(), {
            agentDetails: agent,
            bookings: [] // To store all bookings for this agent
        }]));

        // Fetch all relevant AgentTourStats and populate deeply
        const allAgentTourStats = await AgentTourStats.find()
            .populate({
                path: 'booking',
                // Select fields directly on the booking model, and 'tour' as the path to populate.
                // Removed all 'tour.*' fields from this select as they will be handled by the nested populate.
                select: 'bookingID bookingDate payment.totalAmount travelers', // Keep only booking-specific fields and the 'tour' reference
                populate: {
                    path: 'tour', // Populate tour details within booking
                    // Select all specific tour fields needed from the tour document
                    select: 'name image categoryType country tourType pricePerHead GST duration occupancy remainingOccupancy startDate description'
                }
            })
            .populate({
                path: 'agent',
                select: 'name agentID gender dob age phone_calling phone_whatsapp email aadhar_card pan_card aadhaarPhotoFront panCardPhoto permanent_address parentAgent createdAt banking_details',
            })
            .lean();

        // Group AgentTourStats by agent and find max bookings
        let maxBookingsPerAgent = 0;
        for (const stat of allAgentTourStats) {
            const agentId = stat.agent._id.toString();
            if (agentDataMap.has(agentId)) {
                agentDataMap.get(agentId).bookings.push(stat);
                if (agentDataMap.get(agentId).bookings.length > maxBookingsPerAgent) {
                    maxBookingsPerAgent = agentDataMap.get(agentId).bookings.length;
                }
            }
        }

        const agentDumpData = [];

        // Prepare the final data structure
        for (const [agentId, data] of agentDataMap.entries()) {
            const agent = data.agentDetails;
            const agentBookings = data.bookings;

            let row = {
                'S/L': '', // Filled on frontend or during CSV generation
                'Agent name': agent.name || '',
                'Gender': agent.gender || '',
                'DOB': formatDateToYYYYMMDD(agent.dob),
                'Age': agent.age || '',
                'Phone No. Calling': agent.phone_calling || '',
                'Phone No. Whatsaap': agent.phone_whatsapp || '',
                'Flat No.': agent.permanent_address?.flat_name || '',
                'Locality': agent.permanent_address?.road_no || '',
                'City': agent.permanent_address?.district || '',
                'Pin Code': agent.permanent_address?.pincode || '',
                'PS': agent.permanent_address?.police_station || '',
                'State': agent.permanent_address?.state || '',
                'Country': 'India',
                'Aadhar Card Number': agent.aadhar_card || '',
                'PAN Card Number': agent.pan_card || '',
                'Date of onboarding': formatDateToYYYYMMDD(agent.createdAt),
                'Agent ID': agent.agentID || '',
                'Referral Code': '', // Placeholder, if you have this field in Agent model
                'Parent Agent Name': 'N/A', // Requires additional population or logic if parentAgent ID needs resolving to name
                'Parent Agent ID': agent.parentAgent || 'N/A',
                'Child agent name': '', // Requires fetching child agents if many-to-many or array
                'Child agent Id': '', // Requires fetching child agents
                'JPG/PDF of aadhar Card of Agent': agent.aadhaarPhotoFront || '',
                'JPG/PDF of PAN Card of Agent': agent.panCardPhoto || '',
                'Bank Name': agent.banking_details?.bank_name || '',
                'Account holder name': agent.banking_details?.acc_holder_name || '',
                'Bank Account No': agent.banking_details?.acc_number || '',
                'IFSC Code': agent.banking_details?.ifsc_code || '',
            };

            // Add booking-specific columns dynamically for each agent's bookings
            for (let i = 0; i < maxBookingsPerAgent; i++) {
                const stat = agentBookings[i];
                if (stat) {
                    const booking = stat.booking;

                    // Calculate adults and children from travelers array within the booking
                    let adultsCount = 0;
                    let childrenCount = 0;
                    if (booking.travelers && Array.isArray(booking.travelers)) {
                        booking.travelers.forEach(traveler => {
                            if (traveler.age >= 12) { // Assuming 12 is adult cutoff
                                adultsCount++;
                            } else {
                                childrenCount++;
                            }
                        });
                    }

                    // Calculate cancelled members from travelers
                    const cancelledTravelersCount = booking.travelers ? booking.travelers.filter(t => t.cancellationApproved).length : 0;

                    // Determine Commission Percentage Rate
                    let commissionRate = 0;
                    if (booking.payment && booking.payment.totalAmount > 0 && stat.commissionReceived > 0) {
                        commissionRate = (stat.commissionReceived / booking.payment.totalAmount) * 100;
                    }

                    // Dynamically name columns to match the "Booking N" structure
                    row[`Booking ${i + 1} Id`] = booking.bookingID || '';
                    row[`Booking ${i + 1} Destination`] = booking.tour?.name || '';
                    row[`Booking ${i + 1} Date of journy`] = formatDateToYYYYMMDD(booking.tour?.startDate); // Corrected spelling as per snippet
                    row[`Booking ${i + 1} Packag price for Adult`] = booking.tour?.pricePerHead || 0; // Corrected spelling
                    row[`Booking ${i + 1} Packag price for Child`] = 0; // Your schema doesn't show separate child pricing
                    row[`Booking ${i + 1} Total Occupancy`] = adultsCount + childrenCount;
                    row[`Booking ${i + 1} Date of booking`] = formatDateToYYYYMMDD(booking.bookingDate);
                    row[`Booking ${i + 1} No. of Adult provided by agent`] = adultsCount;
                    row[`Booking ${i + 1} No. of Child provided by agent`] = childrenCount;
                    row[`Booking ${i + 1} No. of Adult provided by Sub agent`] = 0; // Logic required for sub-agents (placeholder)
                    row[`Booking ${i + 1} No. of Child provided by Sub agent`] = 0; // Logic required for sub-agents (placeholder)
                    row[`Booking ${i + 1} Provided occupancy rate`] = ''; // Placeholder
                    row[`Booking ${i + 1} Percentage rate of commision for sub agent`] = ''; // Placeholder, data not available in schema
                    row[`Booking ${i + 1} Percentage rate of commision for agent`] = commissionRate.toFixed(2) + '%'; // Corrected spelling
                    row[`Booking ${i + 1} Due date of payment`] = formatDateToYYYYMMDD(stat.tourStartDate);
                    row[`Booking ${i + 1} Date of payment`] = formatDateToYYYYMMDD(stat.CommissionPaidDate);
                    row[`Booking ${i + 1} Commission paid`] = stat.CommissionPaid ? (stat.commissionReceived || 0) : 0;
                    row[`Booking ${i + 1} Commission to be paid`] = stat.CommissionPaid ? 0 : (stat.commissionReceived || 0);
                    row[`Booking ${i + 1} No.of cancled booking`] = cancelledTravelersCount; // Corrected spelling
                    row[`Booking ${i + 1} Deduction of comission against cancelation`] = stat.commissionDeductionAmount || 0; // Corrected spelling
                } else {
                    // Fill with empty strings for agents with fewer bookings to maintain consistent columns
                    row[`Booking ${i + 1} Id`] = '';
                    row[`Booking ${i + 1} Destination`] = '';
                    row[`Booking ${i + 1} Date of journy`] = '';
                    row[`Booking ${i + 1} Packag price for Adult`] = '';
                    row[`Booking ${i + 1} Packag price for Child`] = '';
                    row[`Booking ${i + 1} Total Occupancy`] = '';
                    row[`Booking ${i + 1} Date of booking`] = '';
                    row[`Booking ${i + 1} No. of Adult provided by agent`] = '';
                    row[`Booking ${i + 1} No. of Child provided by agent`] = '';
                    row[`Booking ${i + 1} No. of Adult provided by Sub agent`] = '';
                    row[`Booking ${i + 1} No. of Child provided by Sub agent`] = '';
                    row[`Booking ${i + 1} Provided occupancy rate`] = '';
                    row[`Booking ${i + 1} Percentage rate of commision for sub agent`] = '';
                    row[`Booking ${i + 1} Percentage rate of commision for agent`] = '';
                    row[`Booking ${i + 1} Due date of payment`] = '';
                    row[`Booking ${i + 1} Date of payment`] = '';
                    row[`Booking ${i + 1} Commission paid`] = '';
                    row[`Booking ${i + 1} Commission to be paid`] = '';
                    row[`Booking ${i + 1} No.of cancled booking`] = '';
                    row[`Booking ${i + 1} Deduction of comission against cancelation`] = '';
                }
            }
            agentDumpData.push(row);
        }

        // Send the JSON data. You'll need a CSV conversion library on the frontend or backend
        // For backend CSV generation, you'd use a library like 'json2csv' here.
        // const { Parser } = require('json2csv');
        // const fields = Object.keys(agentDumpData[0] || {}); // Dynamically get all keys as headers
        // const opts = { fields };
        // const parser = new Parser(opts);
        // const csv = parser.parse(agentDumpData);
        // res.header('Content-Type', 'text/csv');
        // res.attachment('agent_dump_detailed.csv');
        // res.send(csv);

        res.status(200).json({ success: true, data: agentDumpData });

    } catch (error) {
        console.error('Error fetching agent dump data:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// Route to get data for Customer Dump CSV
router.get('/customer-dump-csv', authenticateSuperAdmin, async (req, res) => {
    try {
        // Fetch all bookings and populate necessary fields
        const bookings = await Booking.find()
            .populate({
                path: 'customer',
                select: 'name email phone address altPhone dob age gender aadhar pan whatsapp disability medicalCondition medicalInsurance'
            })
            .populate({
                path: 'agent',
                select: 'name agentID'
            })
            .populate({
                path: 'travelers', // Populate travelers within the booking
                select: 'name age gender cancellationRequested cancellationApproved cancellationRejected cancellationReason'
            })
            .lean();

        const customerDumpData = [];

        for (const booking of bookings) {
            const customer = booking.customer || {};
            const agent = booking.agent || {}; // Agent might be null for direct bookings

            // Handle multiple co-passengers
            const coPassengers = booking.travelers
                .filter(t => t.name !== customer.name) // Exclude the main customer if they are also in travelers
                .map(t => t.name)
                .join(', ');

            // Calculate adults and children from travelers
            let adults = 0;
            let children = 0;
            booking.travelers.forEach(traveler => {
                if (traveler.age >= 12) { // Assuming 12 is the cutoff for adult
                    adults++;
                } else {
                    children++;
                }
            });

            // Count cancelled members
            const cancelledMembers = booking.travelers.filter(t => t.cancellationApproved).length;

            customerDumpData.push({
                'S/L': '', // Serial number, can be filled on frontend or during CSV generation
                'Date of Dump': formatDateToYYYYMMDD(new Date()), // Current date
                'Date of booking': formatDateToYYYYMMDD(booking.bookingDate),
                'Booking Email ID': customer.email || '',
                'Booking ID': booking.bookingID || '',
                'Date of journey': formatDateToYYYYMMDD(booking.tour?.startDate),
                'Name of customer': customer.name || '',
                'Name of co-passengers': coPassengers || '',
                'Gender': customer.gender || '',
                'DOB': customer.dob || '',
                'Age': customer.age || '',
                'Phone No. Calling': customer.phone || '',
                'Emergency Contact': customer.altPhone || '',
                'Phone No. Whatsaap': customer.whatsapp || '',
                'Flat No.': customer.address?.split(',')[0] || '', // Simple split, adjust if address structure is complex
                'Locality': customer.address?.split(',')[1] || '',
                'City': customer.address?.split(',')[2] || '',
                'Pin Code': customer.address?.split(',')[3] || '',
                'PS': '', // Placeholder, if not in customer address
                'State': customer.address?.split(',')[4] || '',
                'Country': 'India', // Assuming all customers are from India
                'Aadhar Card Number': customer.aadhar || '',
                'PAN Card Number': customer.pan || '',
                'Birth Certificate': '', // Placeholder, if you collect this
                'Disability (if any)': customer.disability || '',
                'Medical condition': customer.medicalCondition || '',
                'Tour Type': booking.tour?.tourType || '',
                'Package selected': booking.tour?.name || '',
                'Agent Name': agent.name || 'Direct Booking',
                'Agent ID': agent.agentID || 'N/A',
                'Selected Trip': booking.tour?.name || '', // Duplicate of Package selected, based on CSV
                'No. of Co-passanger': booking.travelers.length > 0 ? booking.travelers.length - 1 : 0, // Total travelers minus main customer
                'JPG/PDF of aadhar Card of passanger': '', // Placeholder, if you store this
                'JPG/PDF of PAN Card of passanger': '', // Placeholder, if you store this
                'Bank Name': '', // Placeholder, if you collect this
                'Account holder name': '', // Placeholder
                'Bank Account No': '', // Placeholder
                'IFSC Code': '', // Placeholder
                'No. of adults': adults,
                'No. of Child': children,
                'Package rate for adult': booking.tour?.pricePerHead || 0,
                'Package rate for child': 0, // Placeholder
                'Total Amount paid by customer': booking.payment?.totalAmount || 0,
                'UTR Number': booking.payment?.transactionId || '',
                'Canceled booking of members(Only Nos.)': cancelledMembers,
                'Refund against cancellation': '', // Placeholder, requires calculation
            });
        }

        res.status(200).json({ success: true, data: customerDumpData });

    } catch (error) {
        console.error('Error fetching customer dump data:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

router.get('/booking/:bookingId/invoice', authenticateSuperAdmin, async(req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('tour')
      .populate('customer')
      .populate('agent'); 

    if(!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const gstRate = booking.tour.GST ? booking.tour.GST / 100 : 0.18; 
    const subTotal = (booking.packageRates.adultRate * booking.numAdults) + (booking.packageRates.childRate * booking.numChildren);
    const gstAmount = subTotal * gstRate;
    const totalAmount = subTotal + gstAmount;

    const invoiceData = {
      invoiceNo: `L2G/TOUR/FY2025-2026/${booking.bookingID}`,
      date: booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-GB') : '',
      customerName: booking.customer?.name || '',
      totalPassengers: booking.numAdults + booking.numChildren,
      bookingID: booking.bookingID,
      journeyDate: booking.tour?.startDate ? new Date(booking.tour.startDate).toLocaleDateString('en-GB') : '',
      customerEmail: booking.customer?.email || '',
      tourPackageName: booking.tour?.name || '',
      tourDuration: booking.tour?.duration ? `${booking.tour.duration} Days / ${booking.tour.duration - 1} Nights` : '',
      basePrice: booking.packageRates.adultRate,
      numPassengersForCalc: booking.numAdults,
      childBasePrice: booking.packageRates.childRate,
      childPassengers: booking.numChildren,
      gstRate,
      subTotal,
      gstAmount,
      totalAmount,
      paidAmount: booking.payment?.paidAmount || 0,
      amountDue: totalAmount - (booking.payment?.paidAmount || 0),
      paymentStatus: booking.payment?.paymentStatus || '',
      airFare: booking.extraCharges?.airFare || 0,
      airFarePassengers: booking.extraCharges?.airFarePassengers || 0,
      trainFare: booking.extraCharges?.trainFare || 0,
      trainFarePassengers: booking.extraCharges?.trainFarePassengers || 0,
      foodings: booking.extraCharges?.foodings || 0,
      foodingsPassengers: booking.extraCharges?.foodingsPassengers || 0,
      hotelUpgrade: booking.extraCharges?.hotelUpgrade || 0,
      hotelUpgradePassengers: booking.extraCharges?.hotelUpgradePassengers || 0,
      conveyance: booking.extraCharges?.conveyance || 0,
      conveyancePassengers: booking.extraCharges?.conveyancePassengers || 0,
      inclusions: booking.tour?.inclusions || [],
      exclusions: booking.tour?.exclusions || [],
    };

    res.status(200).json(invoiceData);

  } catch (error) {
    console.error('Error fetching Invoice data:', error);
    res.status(500).json({ error: 'Failed to fetch Invoice data', details: error.message });
  }
})

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