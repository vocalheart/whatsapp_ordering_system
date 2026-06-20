const Order = require("../models/Order");

async function createOrder({ phoneNumber, item, quantity, address, location }) {
  const totalAmount = item.price * quantity;

  const order = await Order.create({
    phoneNumber,
    items: [
      {
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity,
      },
    ],
    totalAmount,
    address,
    location: location || undefined,
    status: "pending",
  });

  return order;
}

module.exports = { createOrder };