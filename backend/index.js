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
app.use(
  "/webhook",
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); // preserve raw payload for signature verification
    },
  }),
  webhookRoute
);

app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use("/api/agents", agentRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings",bookingRoutes);
app.use("/api/generate-payment-link", paymentRoute);
app.use('/api/posts', require('./routes/posts'));
app.use('/api/complaints', require('./routes/complaints'));
// app.use("/api/webhook", webhookRoute);
// app.use('/api/admin', require('./routes/SuperAdminRoutes'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`);
});
