const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Customer = require("../models/Customer");
const Agent = require('../models/Agent');
const SuperAdmin = require('../models/Superadmin');
const Tour = require('../models/Tour');
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }
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
        packageRates: tour.packageRates, // Include package rates
        createdAt: tour.createdAt,
        updatedAt: tour.updatedAt
    };
}

// Customer Login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Please provide email/phone and password" });
    }

    // Find user by email or phone
    const customer = await Customer.findOne({
      $or: [{ email: identifier.trim() }, { phone: identifier.trim() }]
    });

    if (!customer) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials!" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: customer._id, role: "customer", email: customer.email },
      JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.json({
      message: "Login successful",
      token,
      role: "customer",
      customerID: customer._id,
      name: customer.name
    });
  } catch (error) {
    console.error("Customer Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Register Customer
router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    console.log(req.body)
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    // Check existing email or phone
    const existingSuperAgentByPhone = await SuperAdmin.findOne({ phone_calling: trimmedPhone });
    const existingSuperAgentByEmail = await SuperAdmin.findOne({ email: trimmedEmail });
    const existingAgentByPhone = await Agent.findOne({ phone_calling: trimmedPhone });
    const existingAgentByEmail = await Agent.findOne({ email: trimmedEmail });
    const existingCustomerByPhone = await Customer.findOne({ phone: trimmedPhone });
    const existingCustomerByEmail = await Customer.findOne({ email: trimmedEmail });

    if (existingSuperAgentByEmail || existingAgentByEmail || existingCustomerByEmail) {
    return res.status(400).json({ message: "Email already registered" });
    }

    if (existingSuperAgentByPhone || existingAgentByPhone || existingCustomerByPhone) {
        return res.status(400).json({ message: "Phone number already registered" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = new Customer({
      name,
      phone,
      email,
      password: hashedPassword,
    });

    await newCustomer.save();

    res.status(201).json({ message: "Customer registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// router.get('/tours', authenticate, async (req, res) => {
//   try {
//     const customer = await Customer.findById(req.user.id).lean();
//     if (!customer) {
//         return res.status(404).json({ message: 'Customer not found' });
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
        packageRates: tourDoc.packageRates || {}, // Include package rates
      };
    });

    res.json({ tours: formattedTours });
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ message: 'Server error while fetching tours', error });
  }
});

router.get('/profile', authenticate, async (req, res) => {
  // console.log("Customer profile route hit");
    try {
        const customer = await Customer.findById(req.user.id).lean();
        if (!customer) {
            return res.status(404).json({ error: 'customer not found' });
        }
        res.json(customer);
    } catch (error) {
        console.error("Error fetching profile: ", error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

router.get('/tours/:_id', authenticate, async (req, res) => {
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

module.exports = router;