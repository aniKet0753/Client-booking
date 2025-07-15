const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const LastCode = require('../models/LastCode');
const Agent = require('../models/Agent');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Superadmin = require('../models/Superadmin');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const AgentTourStats = require('../models/AgentTourStats');
const path = require('path');
const { log, error } = require('console');
 
const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const multiUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadhaarPhotoFront', maxCount: 1 },
  { name: 'aadhaarPhotoBack', maxCount: 1 },
  { name: 'panCardPhoto', maxCount: 1 }
]);


const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Error Occured while authenticating:",error);
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

function incrementCode(code) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let arr = code.split('');
  let i = arr.length - 1;

  while (i >= 0) {
    const index = chars.indexOf(arr[i]);
    if (index < chars.length - 1) {
      arr[i] = chars[index + 1];
      break;
    } else {
      arr[i] = chars[0];
      i--;
    }
  }

  if (i < 0) throw new Error('Maximum code limit reached');

  return arr.join('');
}

function calculateAge(dob) {
  const today = new Date();
  const birthDate = new Date(dob);

  let age = today.getFullYear() - birthDate.getFullYear();

  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

async function generateWalletID(name) {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); 

  const first2Letters = name.slice(0, 2).toUpperCase();

  // Find the latest agent based on walletID number
  const latestAgent = await Agent.findOne({ walletID: { $regex: /^.{2}-\d{2}-\d{2}-W-\d+$/ } }).sort({ createdAt: -1 }).lean();

  let walletNumber = 1; // Default if no previous agents

  if (latestAgent && latestAgent.walletID) {
    const match = latestAgent.walletID.match(/W-(\d+)$/);
    if (match) {
      walletNumber = parseInt(match[1], 10) + 1;
    }
  }

  const walletID = `${first2Letters}-${day}-${month}-W-${walletNumber}`;
  return walletID;
}

router.post('/register', multiUpload, async (req, res) => {
    try {
        console.log(req.body);
        const { name, gender, dob, phone_calling, phone_whatsapp, email, aadhar_card, aadhaarPhotoBack, aadhaarPhotoFront, pan_card,
           panCardPhoto, password, profession, income, office_address, permanent_address, exclusive_zone, banking_details, parentAgent } = req.body;
        
        const trimmedPhone = phone_calling.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedAadhar = aadhar_card.trim();

        // --- Start of Modified Logic ---

        // Check for existing agent by phone, email, or Aadhar card
        let existingAgent = await Agent.findOne({
            $or: [
                { phone_calling: trimmedPhone },
                { email: trimmedEmail },
                { aadhar_card: trimmedAadhar }
            ]
        });

        if (existingAgent) {
            // If an agent exists and their status is 'rejected', allow re-registration (update)
            if (existingAgent.status === 'rejected') {
                console.log(`Agent with status 'rejected' found: ${existingAgent._id}. Updating data.`);
                // The rest of the logic will proceed to update this existingAgent
            } else {
                // If an agent exists and status is not 'rejected', block registration
                if (existingAgent.phone_calling === trimmedPhone) {
                    return res.status(400).json({ error: 'An agent account with this phone number already exists.' });
                }
                if (existingAgent.email === trimmedEmail) {
                    return res.status(400).json({ error: 'An agent account with this email already exists.' });
                }
                if (existingAgent.aadhar_card === trimmedAadhar) {
                    return res.status(400).json({ error: 'An agent account with this Aadhar Card already exists.' });
                }
            }
        }

        // Check for existing customer by email or phone (always block if customer exists)
        const existingCustomerByEmail = await Customer.findOne({email: trimmedEmail});
        const existingCustomerByPhone = await Customer.findOne({phone: trimmedPhone});
        
        if (existingCustomerByPhone) {
          return res.status(400).json({ error: 'An account with this phone number already exists as a customer.' });
        }

        if (existingCustomerByEmail) {
            return res.status(400).json({ error: 'An account with this email already exists as a customer.' });
        }

        // --- End of Modified Logic for checking existing accounts ---

        if( !mongoose.Types.ObjectId.isValid(parentAgent))
          return res.status(400).json({ error: 'Invalid referral ID provided.' });

        const refAgent = await Agent.findById(parentAgent).lean(); // Use .lean() for performance if not modifying
        if (!refAgent) {
          return res.status(400).json({ error: 'Invalid referral ID provided.' });
        }

        const lastCodeDoc = await LastCode.findOne();
        console.log(lastCodeDoc);
        
        if (!lastCodeDoc) {
          return res.status(500).json({ error: 'LastCode document not found' });
        }

        let agentIDToUse;
        let newCodeToUse;
        let walletIDToUse;
        let hashedPasswordToUse;

        if (existingAgent && existingAgent.status === 'rejected') {
            // If re-registering a rejected agent, keep existing IDs, but update password if provided
            agentIDToUse = existingAgent.agentID;
            walletIDToUse = existingAgent.walletID; // Keep existing wallet ID
            newCodeToUse = existingAgent.lastCode; // Assuming lastCode is tied to agentID generation, keep it same for rejected agent re-reg.
            hashedPasswordToUse = password ? await bcrypt.hash(password, 10) : existingAgent.password; // Only update if new password is provided
        } else {
            // For new registrations
            newCodeToUse = incrementCode(lastCodeDoc.lastCode);
            console.log(`New incremented code: ${newCodeToUse}`);
            const year = new Date().getFullYear();
            const parsedPermanent = JSON.parse(permanent_address);
            const pin = parsedPermanent?.pincode?.toString();
            if(!pin){
              return res.status(500).json({ error: 'Error with the pincode' });
            }
            const last3Pin = pin.slice(-3);
            const parentAgentLast4 = refAgent.agentID.slice(-4);
            agentIDToUse = `${parentAgentLast4}-${last3Pin}-${year}-${newCodeToUse}`;
            hashedPasswordToUse = await bcrypt.hash(password, 10);
            walletIDToUse = await generateWalletID(name); // Generate new wallet ID for new agent
        }

        console.log(`agentID: ${agentIDToUse}`);
        console.log(dob);

        const agentData = {
            name,
            gender,
            dob,
            age: calculateAge(dob),
            phone_calling: trimmedPhone, // Ensure trimmed phone is saved
            phone_whatsapp,
            email: trimmedEmail, // Ensure trimmed email is saved
            aadhar_card: trimmedAadhar, // Ensure trimmed Aadhar is saved
            pan_card,
            aadhaarPhotoFront: req.files['aadhaarPhotoFront'] ? `data:image/png;base64,${req.files['aadhaarPhotoFront'][0].buffer.toString('base64')}` : '',
            aadhaarPhotoBack: req.files['aadhaarPhotoBack'] ? `data:image/png;base64,${req.files['aadhaarPhotoBack'][0].buffer.toString('base64')}` : '',
            panCardPhoto: req.files['panCardPhoto'] ? `data:image/png;base64,${req.files['panCardPhoto'][0].buffer.toString('base64')}` : '',
            photo: req.files['photo'] ? `data:image/png;base64,${req.files['photo'][0].buffer.toString('base64')}` : '',
            password: hashedPasswordToUse,
            profession,
            income: Number(income),
            office_address,
            permanent_address: JSON.parse(permanent_address),
            exclusive_zone: JSON.parse(exclusive_zone),
            banking_details: JSON.parse(banking_details),
            parentAgent: parentAgent || null,
            agentID: agentIDToUse,
            walletID: walletIDToUse,
            lastCode: newCodeToUse,
            status: 'pending', // Reset status to inactive upon re-registration
            remarks: '' // Clear remarks on re-registration
        };

        if (existingAgent && existingAgent.status === 'rejected') {
            // Update the existing agent document
            await Agent.findByIdAndUpdate(existingAgent._id, agentData, { new: true });
            res.status(200).json({ message: 'Agent data updated successfully!' });
        } else {
            // Create a new agent document
            const newAgent = new Agent(agentData);
            await newAgent.save();
            lastCodeDoc.lastCode = newCodeToUse; // Update lastCode only for truly new registrations
            await lastCodeDoc.save();
            res.status(201).json({ message: 'Agent registered successfully!' });
        }

    } catch (error) {
        console.error("Error Occured while registering: ", error);
        res.status(500).json({ error: 'Registration failed: An error occurred while registration' });
    }
});

// router.get('/test',async(req,res)=>{
//   const parentAgent = '67f3e2be1cd4783e5215d48c';
//   const refAgent = await Agent.findById(parentAgent).lean();
//   const newCode = incrementCode('009Z');//add refAgent in the model
//   // refAgent.lastCode = newCode;
//   console.log(newCode);
//   res.send(newCode);
// })

router.post('/login', async (req, res) => {
    try { 
        // console.log("Login Request Body:", req.body);
        const { identifier, password } = req.body;
        const superadmin = await Superadmin.findOne({
            $or: [{ email: identifier }, { phone_calling: identifier }]
        });
            if (superadmin) {
                const isMatch = await bcrypt.compare(password, superadmin.password);
                if (!isMatch) {
                    // console.log(identifier+" "+password);
                    
                return res.status(400).json({ error: 'Invalid SuperAdmin credentials!' });
                }
                const token = jwt.sign({ id: superadmin._id, role: 'superadmin' }, process.env.JWT_SECRET, { expiresIn: '5h' });
                // console.log("ll");
                
                return res.json({
                message: 'SuperAdmin login successful!',
                token,
                role: 'superadmin',
                });
            }

        const agent = await Agent.findOne({
            $or: [{ email: identifier }, { phone_calling: identifier }]
        });
        
        if (!agent) {
            return res.status(400).json({ error: 'User not found!' });
        }

        const isMatch = await bcrypt.compare(password, agent.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials!' });
        }
        if(agent.status == 'rejected'){
          return res.status(400).json({ error: 'Your account has been rejected, please contact support!!'});
        }
        if(agent.status != 'active'){
          return res.status(400).json({ error: 'Your ID is inactive. Wait till your ID is getting active'});
        }
        const token = jwt.sign({ id: agent._id, role: 'agent' }, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.json({ message: 'Login successful!', token, role: 'agent', agent, agentID: agent.agentID });
    } catch (error) {
        console.error("Error Occured while login:",error);
        res.status(500).json({ error: 'Login failed: An error occurred while login' });
    }
});

router.get('/money-history', async (req, res) => {
    try {
      // Fetching dummy data
      const weeklyData = { Mon: 100, Tue: 200, Wed: 150, Thu: 250, Fri: 300, Sat: 350, Sun: 400 };
      const monthlyTotal = Object.values(weeklyData).reduce((acc, val) => acc + val, 0) * 4;
  
      res.json({ weekly: weeklyData, monthly: { total: monthlyTotal } });
    } catch (error) {
        console.error("Error fetching money-history: ",error);
        res.status(500).json({ error: 'Failed to fetch money history' });
    }
  });
  
router.get('/profile', authenticate, async (req, res) => {
  // console.log("Agent profile route hit");
    try {
        const agent = await Agent.findById(req.user.id).lean();
        if (!agent) {
            return res.status(404).json({ error: 'agent not found' });
        }
        res.json(agent);
    } catch (error) {
        console.error("Error fetching profile: ", error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});


router.put('/profile', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const agentId = req.user.id;

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ error: "agent not found" });
    }
    let updateData = {};
    if (req.body.updateData) {
      updateData = JSON.parse(req.body.updateData);
    }
    const { name, password } = updateData;
    if (name) agent.name = name;
    if (password && password.trim() !== '') {
      agent.password = await bcrypt.hash(password, 10);
    }
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      agent.photo = `data:image/png;base64,${base64Image}`;
    }
    await agent.save();
    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("Error updating profile: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
  
// router.get('', authenticate, async (req, res) => {
//     try {
//       const agent = await Agent.findById(req.user.id).lean();
//       if (!agent) {
//         return res.status(404).json({ error: 'Agent not found' });
//       }
  
//       res.json(agent);
//     } catch (error) {
//       console.error("Error fetching agent details:", error);
//       res.status(500).json({ error: 'Failed to fetch agent details' });
//     }
// });
  
// router.get('/tours', authenticate, async (req, res) => {
//   try {
//     const agent = await Agent.findById(req.user.id).lean();
//     if (!agent) {
//         return res.status(404).json({ message: 'Agent not found' });
//     }
  
//     if (agent.status !== 'active') {
//     return res.status(403).json({ message: 'Inactive user' });
//     }
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
//         tourType: pkg.tourType,
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

router.get('/tours', authenticate, async (req, res) => {
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

router.get('/tours/:_id', async (req, res) => {
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

// router.get('/booking-history',authenticate, async (req, res) => {
//   const agent = await Agent.findById(req.user.id).lean();
//   try {
//     // const transactions = await Transaction.find({ 'commissions.agentID':agent.agentID && 'commissions.level':1 }).sort({ tourStartDate: -1 });
//     const transactions = await Transaction.find({
//       commissions: {
//         $elemMatch: {
//           agentID: agent.agentID,
//           level: 1
//         }
//       }
//     }).sort({ tourStartDate: -1 });

//     if (!transactions || transactions.length === 0) {
//       return res.status(404).json({ message: 'No bookings found for this agent.' });
//     }

//     res.status(200).json(transactions);
//   } catch (error) {
//     console.error('Error fetching booking history:', error);
//     res.status(500).json({ error: 'Failed to fetch booking history' });
//   }
// });
// // __________
// router.put('/cancel-booking/:transactionId', authenticate, async (req, res) => {
//   try {
//     const { transactionId } = req.params;

//     const transaction = await Transaction.findOne({ transactionId });
//     console.log(transactionId)
//     if (!transaction) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }
//     // console.log(transaction.agentID, req.user.id, agent.agentID);
//     const agent = await Agent.findById(req.user.id);
//     console.log(transaction.agentID, req.user.id, agent.agentID);
    
//     if (!agent || transaction.agentID !== agent.agentID) {
//       return res.status(403).json({ message: 'Unauthorized: This booking does not belong to you.' });
//     }

//     const tourDate = new Date(transaction.tourStartDate);
//     if (tourDate <= new Date()) {
//       return res.status(400).json({ message: 'Cannot cancel past or ongoing tour bookings' });
//     }

//     // const tour = await Tour.findById(transaction.tourID);
//     // if (tour) {
//     //   const pkg = tour.packages.id(transaction.packageID);
//     //   if (pkg) {
//     //     pkg.remainingOccupancy += transaction.tourGivenOccupancy;
//     //     // await tour.save();
//     //   }
//     // }

//     // Delete the booking
//     // await Transaction.deleteOne({ transactionId });
//     if (transaction.cancellationRequested) {
//       return res.status(400).json({ message: 'Cancellation already requested' });
//     }

//     transaction.cancellationRequested = true;
//     await transaction.save();

//     res.status(200).json({ message: 'Cancellation request submitted for approval' }); 
//   } catch (error) {
//     console.error('Error cancelling booking:', error);
//     res.status(500).json({ message: 'Server error while cancelling booking' });
//   }
// });


// Route to fetch full booking details for an agent
router.get('/my-full-bookings', authenticate, async (req, res) => {
  try {
    const agentId = req.user.id; // User ID from authenticated token
    const agent = await Agent.findById(agentId); // Get agent's own agentID (e.g., 'AG001')
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found.' });
    }

    console.log(agent.agentID);
    // Find Booking documents where the agent field matches the current agent's agentID.
    const bookings = await Booking.find({ 'agent.agentID': agent.agentID }).sort({ bookingDate: -1 });

    console.log(bookings)
    // Send 200 OK with an empty array if no bookings are found
    return res.status(200).json(bookings); // This will send an empty array if 'bookings' is empty
  } catch (error) {
    console.error('Error fetching full agent bookings:', error);
    res.status(500).json({ message: 'Failed to fetch full agent bookings', details: error.message });
  }
});

// Original /booking-history (likely for transactions/commissions) - kept as is if separate purpose
router.get('/booking-history',authenticate, async (req, res) => {
  const agent = await Agent.findById(req.user.id).lean();
  try {
    const transactions = await Transaction.find({
      commissions: {
        $elemMatch: {
          agentID: agent.agentID,
          level: 1
        }
      }
    }).sort({ tourStartDate: -1 });

    if (!transactions || transactions.length === 0) {
      // If no transactions, still return 200 OK with an empty array
      return res.status(200).json([]);
    }

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching booking history (transactions):', error);
    res.status(500).json({ error: 'Failed to fetch booking history (transactions)' });
  }
});


// Consolidated cancel-booking route to handle both full booking and partial traveler cancellation
router.put('/cancel-booking/:bookingId', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { travelerIds } = req.body; // Optional: Array of traveler _ids to cancel

    const agentMongoId = req.user.id;

    const agent = await Agent.findById(agentMongoId);
    if (!agent) {
        return res.status(404).json({ message: 'Agent not found.' });
    }

    const booking = await Booking.findOne({ 'bookingID': bookingId, 'agent.agentID': agent.agentID });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or does not belong to this agent.' });
    }

    const tourDate = new Date(booking.tour.startDate);
    if (tourDate <= new Date()) {
      return res.status(400).json({ message: 'Cannot cancel for past or ongoing tour bookings.' });
    }

    let message = '';
    let modifiedCount = 0;

    if (Array.isArray(travelerIds) && travelerIds.length > 0) {
      // Logic for partial traveler cancellation
      const updatedTravelerNames = [];
      for (const travelerId of travelerIds) {
        const traveler = booking.travelers.id(travelerId); // Mongoose subdocument .id() method
        if (traveler) {
          if (traveler.cancellationRequested || traveler.cancellationApproved || traveler.cancellationRejected) {
            updatedTravelerNames.push(`${traveler.name} (already in cancellation process)`);
            continue;
          }
          traveler.cancellationRequested = true;
          // IMPORTANT: Set these to false when initiating a new request
          traveler.cancellationApproved = false;
          traveler.cancellationRejected = false;
          updatedTravelerNames.push(traveler.name);
          modifiedCount++;
        } else {
          log(`Traveler with ID ${travelerId} not found in booking ${bookingId}`);
        }
      }

      if (modifiedCount === 0) {
        return res.status(400).json({ message: 'No new travelers were marked for cancellation (they might already be in a cancellation state).' });
      }
      message = `Cancellation request submitted for selected travelers: ${updatedTravelerNames.join(', ')}.`;

    } else {
      // Logic for full booking cancellation
      if (booking.cancellationRequested || booking.cancellationApproved || booking.cancellationRejected) {
        return res.status(400).json({ message: 'Full booking cancellation already in progress or completed.' });
      }
      booking.cancellationRequested = true;
      // IMPORTANT: Set these to false when initiating a new request
      booking.cancellationApproved = false;
      booking.cancellationRejected = false;
      booking.cancellationReason = ''; // Clear any old reasons

      booking.travelers.forEach(traveler => {
        if (!traveler.cancellationRequested && !traveler.cancellationApproved && !traveler.cancellationRejected) {
          traveler.cancellationRequested = true;
          // IMPORTANT: Set these to false for all travelers in a full cancellation initiated by agent
          traveler.cancellationApproved = false;
          traveler.cancellationRejected = false;
          traveler.cancellationReason = '';
        }
      });
      modifiedCount = booking.travelers.length; // Count all travelers as modified for full cancellation
      message = 'Full booking cancellation request submitted for approval.';
    }

    await booking.save();

    res.status(200).json({
      message: message,
      updatedBooking: booking // Send back the updated booking document
    });

  } catch (error) {
    console.error('Error during cancellation:', error);
    res.status(500).json({ message: 'Server error while processing cancellation', details: error.message });
  }
});

// Withdraw traveler cancellation request
router.put('/withdraw-cancellation/:bookingID', authenticate, async (req, res) => {
    try {
        const { bookingID } = req.params;
        const { travelerIds } = req.body; // Array of traveler _id's to withdraw

        if (!bookingID || !travelerIds || !Array.isArray(travelerIds) || travelerIds.length === 0) {
            return res.status(400).json({ message: 'Booking ID and traveler IDs are required.' });
        }

        const booking = await Booking.findOne({ bookingID: bookingID });
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        const agentMongoId = req.user.id;

        const agent = await Agent.findById(agentMongoId);

        // Ensure agents to withdraw requests on behalf of customers:
        if (booking.agent.agentID !== agent.agentID) {
            return res.status(403).json({ message: 'Unauthorized to withdraw cancellation for this booking.' });
        }

        let changesMade = false;
        booking.travelers.forEach(traveler => {
            if (travelerIds.includes(traveler._id.toString())) {
                if (traveler.cancellationRequested && !traveler.cancellationApproved && !traveler.cancellationRejected) {
                    traveler.cancellationRequested = false;
                    traveler.cancellationReason = undefined; // Clear the reason
                    changesMade = true;
                }
            }
        });

        if (!changesMade) {
            return res.status(400).json({ message: 'No active cancellation requests found for the specified travelers to withdraw.' });
        }

        await booking.save();

        res.status(200).json({ message: 'Cancellation request withdrawn successfully.', booking });

    } catch (error) {
        console.error('Error withdrawing cancellation request:', error);
        res.status(500).json({ message: 'Failed to withdraw cancellation request', details: error.message });
    }
});

router.get('/commission-history', authenticate, async (req, res) => {
  try {
    const agent = await Agent.findById(req.user.id).lean();
    const transactions = await Transaction.find({ 'commissions.agentID': agent.agentID }).lean();

    // console.log(transactions)
    if (!transactions) {
      return res.status(404).json({ message: 'No transaction history found.' });
    }

    const lifoHistory = transactions.slice().reverse();
    res.json({ history: lifoHistory });

  } catch (error) {
    console.error('Error fetching commission history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-commission-overview', authenticate, async (req, res) => {
  try {
    const { id, role } = req.user; // Extracted from JWT token
    console.log(id,role)
    let agentTourStats = [];
    let totalIncomingPayments = 0; // For pending commissions
    let totalAmountReceived = 0; // For completed commissions

    if (role === 'agent') {
      const agent = await Agent.findById(id);
      // Fetch tour stats specific to this agent
      console.log(agent.name);
      console.log(agent.agentID);
      agentTourStats = await AgentTourStats.find({ agentID: agent.agentID });
      console.log(agentTourStats);
    } else {
      // Handle other roles or unauthorized access
      return res.status(403).json({ message: 'Forbidden: Your role does not have access to this resource.' });
    }

    // Map AgentTourStats to a more generic transaction format for the frontend
    const transactions = agentTourStats.map(stat => {
      const status = stat.CommissionPaid ? 'completed' : 'pending';
      const amount = stat.commissionReceived;

      if (status === 'completed') {
        totalAmountReceived += amount;
      } else {
        totalIncomingPayments += amount;
      }

      return {
        _id: stat._id,
        description: `Commission for Tour ID: ${stat.tourID}`,
        amount: amount,
        type: 'credit', // Commissions are typically credits
        status: status,
        createdAt: stat.tourStartDate, // Use tourStartDate for general reference
        // Add specific fields for frontend display
        tourStartDate: stat.tourStartDate,
        finalAmount: stat.finalAmount,
        commissionReceived: stat.commissionReceived,
        commissionPaidDate: stat.CommissionPaidDate, // Will be null if not paid
      };
    });

    res.status(200).json({
      message: 'Commission overview fetched successfully',
      transactions: transactions,
      totalIncomingPayments: totalIncomingPayments,
      totalAmountReceived: totalAmountReceived,
    });

  } catch (error) {
    console.error('Error fetching commission overview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const buildAgentTree = async (agent) => {
  const children = await Agent.find({ parentAgent: agent._id });

  const directChildren = children.map(child => ({
    _id: child._id,
    name: child.name,
  }));

  return {
    _id: agent._id,
    name: agent.name,
    children: directChildren,
  };
};

router.get('/agent-tree', authenticate, async (req, res) => {
  try {
    const currentAgentId = req.user.id;

    const currentAgent = await Agent.findById(currentAgentId).populate('parentAgent');
    if (!currentAgent) {
      return res.status(404).json({ error: 'Agent not found' });
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

    res.json({ tree });
  } catch (error) {
    console.error('Error fetching agent tree:', error);
    res.status(500).json({ error: 'Failed to fetch agent tree' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
   
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid agent ID format.' });
  }

  try {
    const agent = await Agent.findById(id).select('-earnings'); // Exclude earnings here
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    res.json(agent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/verify-agentID/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const agent = await Agent.findOne({agentID:id}).select('-earnings');
    if (!agent) return res.status(404).json({ message: 'Invalid AgentID!! Agent not found' });

    res.status(200).json(agent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;