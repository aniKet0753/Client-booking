const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("./config/db");
const bookingRoutes = require('./routes/BookingRoutes');

const customerRoutes = require("./routes/customerRoutes");
const agentRoutes = require("./routes/agentRoutes");
const adminRoutes = require("./routes/AdminRoutes");
const paymentRoute = require("./routes/PaymentRoute");
const webhookRoute = require("./routes/WebhookRoute");
const PORT = process.env.PORT || 5001;
const app = express();

let apiRequestCount = 0;
app.use((req, res, next) => {
  apiRequestCount++;
  console.log(`API Request #${apiRequestCount} | ${req.method} ${req.originalUrl}`);
  next();
});

app.use(
  "/webhook",
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); // preserve raw payload for signature verification
    },
  }),
  webhookRoute
);

app.use(cors({
  origin: [
    "https://client-booking-1.onrender.com"
    // "https://l2gcruise.com",
    // "https://www.l2gcruise.com",
    // "http://localhost:3000"
  ],
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,role",
  credentials: true
}));


// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api/agents", agentRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings",bookingRoutes);
app.use("/api/generate-payment-link", paymentRoute);
app.use('/api/posts', require('./routes/posts'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/agent-chats', require('./routes/agentChats'));
app.use('/api/contact-content', require('./routes/contactContent'));
app.use('/api/about-content', require('./routes/AboutContent'));
app.use('/api/know-us-content', require('./routes/KnowUsContent'));
app.use('/api/blogs', require('./routes/Blog'));
app.use('/api/grievance-policy', require('./routes/grievancePolicy'));
app.use('/api/cancellation-policy', require('./routes/cancellationPolicy'));
app.use('/api/terms', require('./routes/termsAndConditions'));
app.use('/api/special-offers', require('./routes/special-offers'));
app.use('/api/attractions', require('./routes/attractions'));
app.use('/api/customer-dump', require('./dumps/customer-dump'));
app.use('/api/contact-form', require('./mailSend/contactPageMail'));
app.use('/api/otp', require('./mailSend/Otp'));
// app.use("/api/webhook", webhookRoute);
// app.use('/api/admin', require('./rodutes/SuperAdminRoutes'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`);
});

// Initialize cron jobs
require("./utils/cronJobs");
