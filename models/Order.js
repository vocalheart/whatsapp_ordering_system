const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    address: { type: String, required: true },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);