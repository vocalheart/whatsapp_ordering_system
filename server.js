require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./database/database.js");
const menu = require("./menu/menu.js");
const { sendMenu } = require("./whatsapp_list/SendtoWhatsApp");
const webhookRoutes = require("./whtsappWebHook.js/webhook");
const allOrders = require("./getAllOrders/allOrder.js");

const app = express();

connectDB();

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Razorpay webhook ke liye raw body PEHLE chahiye
app.use("/api/razorpay-webhook", express.raw({ type: "application/json" }));

// Baaki sab ke liye normal JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("🍽️ Rajdarbar WhatsApp Bot Running");
});

app.use("/api", allOrders); // All Orders routes
app.use("/menu", menu);
app.use("/api", webhookRoutes);

// Test route — menu bhejne ke liye
app.get("/send-menu", async (req, res) => {
  try {
    const result = await sendMenu("917566891134");
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});