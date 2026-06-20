const Razorpay = require("razorpay");
const crypto   = require("crypto");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPaymentLink({ amount, phoneNumber, itemName, quantity }) {

  // ⏰ 20 minutes baad expire
  // Razorpay rule: minimum 15 minutes future mein hona chahiye
  // Hum 20 min set kar rahe hain taaki clock skew ka bhi koi issue na ho
  const expireBy = Math.floor(Date.now() / 1000) + (20 * 60);

  const linkData = {
    amount:          amount * 100, // paise mein
    currency:        "INR",
    accept_partial:  false,
    description:     `${itemName} x${quantity} - Rajdarbar Restaurant`,
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
    },
  };

  // callback_url sirf tab add karo jab APP_URL set ho (production mein)
  if (process.env.APP_URL) {
    linkData.callback_url    = `${process.env.APP_URL}/api/payment-success`;
    linkData.callback_method = "get";
  }

  try {
    const paymentLink = await razorpay.paymentLink.create(linkData);
    console.log("✅ Razorpay link created:", paymentLink.id, paymentLink.short_url);
    return paymentLink;
  } catch (err) {
    console.error("❌ Razorpay createPaymentLink error:", JSON.stringify(err?.error || err, null, 2));
    throw err;
  }
}

function verifyWebhookSignature(body, signature) {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest("hex");
  return expectedSignature === signature;
}

module.exports = { createPaymentLink, verifyWebhookSignature };