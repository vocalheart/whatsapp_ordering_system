const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Payment Link banao — customer isko click karke pay karega
 */
async function createPaymentLink({ amount, phoneNumber, itemName, quantity, orderId }) {
  const paymentLink = await razorpay.paymentLink.create({
    amount: amount * 100, // paise mein
    currency: "INR",
    accept_partial: false,
    description: `${itemName} x${quantity} — Rajdarbar Restaurant`,
    customer: {
      contact: `+${phoneNumber}`,
    },
    notify: {
      sms: false,   // hum WhatsApp se bhejenge
      email: false,
    },
    reminder_enable: false,
    notes: {
      phoneNumber,
      pendingOrderId: orderId, // session mein pending order track karne ke liye
    },
    callback_url: `${process.env.APP_URL}/api/payment-success`,
    callback_method: "get",
  });

  return paymentLink;
}

/**
 * Razorpay webhook signature verify karo
 */
function verifyWebhookSignature(body, signature) {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest("hex");

  return expectedSignature === signature;
}

module.exports = { createPaymentLink, verifyWebhookSignature };