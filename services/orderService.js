const Order = require("../models/Order");

async function createPendingOrder({ phoneNumber, item, quantity, address, location, mobile, paymentLinkId }) {
  const totalAmount = item.price * quantity;

  const order = await Order.create({
    phoneNumber,
    mobile,
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

async function confirmOrder(paymentLinkId, paymentId) {
  return await Order.findOneAndUpdate(
    { paymentLinkId, paymentStatus: "pending" },
    { paymentStatus: "paid", paymentId, status: "confirmed" },
    { returnDocument: "after" }
  );
}

async function failOrder(paymentLinkId) {
  return await Order.findOneAndUpdate(
    { paymentLinkId, paymentStatus: "pending" },
    { paymentStatus: "failed", status: "cancelled" },
    { returnDocument: "after" }
  );
}

module.exports = { createPendingOrder, confirmOrder, failOrder };