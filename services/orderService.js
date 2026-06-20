const Order = require("../models/Order");

/**
 * Pending order banao — payment hone ke BAAD confirm hoga
 */
async function createPendingOrder({ phoneNumber, item, quantity, address, location, paymentLinkId }) {
  const totalAmount = item.price * quantity;

  const order = await Order.create({
    phoneNumber,
    items: [{ itemId: item.itemId, name: item.name, price: item.price, quantity }],
    totalAmount,
    address,
    location: location || undefined,
    paymentStatus: "pending",
    paymentLinkId,
    status: "awaiting_payment",
  });

  return order;
}

/**
 * Payment success ke baad order confirm karo
 */
async function confirmOrder(paymentLinkId, paymentId) {
  const order = await Order.findOneAndUpdate(
    { paymentLinkId, paymentStatus: "pending" },
    {
      paymentStatus: "paid",
      paymentId,
      status: "confirmed",
    },
    { new: true }
  );
  return order;
}

/**
 * Payment fail/expire hone par order cancel karo
 */
async function failOrder(paymentLinkId) {
  return await Order.findOneAndUpdate(
    { paymentLinkId, paymentStatus: "pending" },
    { paymentStatus: "failed", status: "cancelled" },
    { new: true }
  );
}

module.exports = { createPendingOrder, confirmOrder, failOrder };