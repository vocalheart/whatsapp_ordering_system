const Razorpay = require("razorpay");
const crypto   = require("crypto");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPaymentLink({ amount, phoneNumber, itemName, quantity, orderId }) {

  // ⏰ 5 minutes baad expire
  const expireBy = Math.floor(Date.now() / 1000) + (5 * 60);

  const paymentLink = await razorpay.paymentLink.create({
    amount:          amount * 100,
    currency:        "INR",
    accept_partial:  false,
    description:     `${itemName} x${quantity} — Rajdarbar Restaurant`,
    customer: {
      contact: `+${phoneNumber}`,
    },
    expire_by:       expireBy,
    notify: {
      sms:   false,
      email: false,
    },
    reminder_enable: false,
    notes: {
      phoneNumber,
      pendingOrderId: orderId,
    },
    callback_url:    `${process.env.APP_URL}/api/payment-success`,
    callback_method: "get",
  });

  return paymentLink;
}

function verifyWebhookSignature(body, signature) {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest("hex");

  return expectedSignature === signature;
}

module.exports = { createPaymentLink, verifyWebhookSignature };
