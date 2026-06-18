require("dotenv").config();
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./database/database.js");
const menu =   require('./menu/menu.js')
const { sendMenu } = require("./whatsapp_list/SendtoWhatsApp");
const webhookRoutes = require("./whtsappWebHook.js/webhook");


dotenv.config();
const app = express();
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("WhatsApp Bot Running");
});
app.use('/menu' , menu)
app.use("/api", webhookRoutes);
app.get("/send-menu", async (req, res) => {
  try {
    const result = await sendMenu("917566891134");
    res.json({success: true,result});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});