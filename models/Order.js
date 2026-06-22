const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  itemId:   { type: String, required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    phoneNumber:  { type: String, required: true },
    mobile:       { type: String },   // customer ka delivery contact number
    items:        [orderItemSchema],
    totalAmount:  { type: Number, required: true },
    address:      { type: String, required: true },
    location: {
      latitude:  { type: Number },
      longitude: { type: Number },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentLinkId: { type: String },
    paymentId:     { type: String },
    status: {
      type: String,
      enum: ["awaiting_payment", "confirmed", "preparing", "delivered", "cancelled"],
      default: "awaiting_payment",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);