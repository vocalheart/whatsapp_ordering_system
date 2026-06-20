const mongoose = require("mongoose");

// States:
// idle → awaiting_menu_selection → awaiting_quantity → awaiting_address_choice
// → awaiting_address_text / awaiting_location → order_confirmed

const sessionSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    state: {
      type: String,
      enum: [
        "idle",
        "awaiting_menu_selection",
        "awaiting_quantity",
        "awaiting_address_choice",
        "awaiting_address_text",
        "awaiting_location",
        "order_confirmed",
      ],
      default: "idle",
    },
    selectedItem: {
      itemId: String,
      name: String,
      price: Number,
    },
    quantity: { type: Number },
    address: { type: String },
    location: {
      latitude: Number,
      longitude: Number,
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-expire sessions after 30 minutes of inactivity
sessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 1800 });

module.exports = mongoose.model("Session", sessionSchema);