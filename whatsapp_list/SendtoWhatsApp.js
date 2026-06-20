const axios = require("axios");
const { getWhatsAppList } = require("./WhatsAppList");

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN    = process.env.ACCESS_TOKEN;

const api = axios.create({
  baseURL: `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}`,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// ─── Plain Text ───────────────────────────────────────────────────────────────
async function sendText(phoneNumber, text) {
  await api.post("/messages", {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "text",
    text: { body: text },
  });
}

// ─── Menu List ────────────────────────────────────────────────────────────────
async function sendMenu(phoneNumber) {
  const payload = await getWhatsAppList();
  payload.to = phoneNumber;
  await api.post("/messages", payload);
}

// ─── Welcome ──────────────────────────────────────────────────────────────────
async function sendWelcome(phoneNumber) {
  await sendText(
    phoneNumber,
    "🙏 *Rajdarbar Restaurant mein aapka swagat hai!*\n\nHamara menu dekhne ke liye neeche *View Menu* button dabayein."
  );
}

// ─── Quantity maango ──────────────────────────────────────────────────────────
async function sendQuantityRequest(phoneNumber, itemName, price) {
  await sendText(
    phoneNumber,
    `✅ *${itemName}* select kiya! (₹${price} each)\n\nKitni quantity chahiye? Sirf number type karein (jaise: 1, 2, 3...)`
  );
}

// ─── Address choice buttons ───────────────────────────────────────────────────
async function sendAddressChoice(phoneNumber) {
  await api.post("/messages", {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "📍 *Delivery address kaise dena chahoge?*" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "address_text",     title: "✍️ Type karke"   } },
          { type: "reply", reply: { id: "address_location", title: "📌 Location Pin" } },
        ],
      },
    },
  });
}

// ─── Address text maango ──────────────────────────────────────────────────────
async function sendAskAddressText(phoneNumber) {
  await sendText(phoneNumber, "✍️ Apna *poora delivery address* type karein:\n\n_(Gali, Mohalla, Landmark, Sheher)_");
}

// ─── Location pin maango ──────────────────────────────────────────────────────
async function sendAskLocation(phoneNumber) {
  await sendText(phoneNumber, "📌 WhatsApp mein *paperclip (📎) icon* dabayein → *Location* → *Send Your Current Location* share karein.");
}

// ─── Payment Link bhejo ───────────────────────────────────────────────────────
async function sendPaymentLink(phoneNumber, { itemName, quantity, totalAmount, paymentUrl, orderId }) {
  await sendText(
    phoneNumber,
    `🧾 *Order Summary*\n\n` +
    `🍽️ Item: *${itemName}*\n` +
    `🔢 Quantity: *${quantity}*\n` +
    `💰 Total: *₹${totalAmount}*\n\n` +
    `💳 Neeche diye link pe click karke payment karein:\n` +
    `👉 ${paymentUrl}\n\n` +
    `⚠️ Payment hone ke baad hi aapka order place hoga.\n` +
    `_Order ID: ${orderId}_`
  );
}

// ─── Order Confirmed (payment ke baad) ───────────────────────────────────────
async function sendOrderConfirmation(phoneNumber, order) {
  const item = order.items[0];
  await sendText(
    phoneNumber,
    `🎉 *Payment Received! Order Confirmed!*\n\n` +
    `📦 Item: *${item.name}*\n` +
    `🔢 Quantity: *${item.quantity}*\n` +
    `💰 Total Paid: *₹${order.totalAmount}*\n` +
    `📍 Address: ${order.address}\n\n` +
    `⏱️ Aapka order *30-45 minutes* mein deliver ho jayega.\n` +
    `🆔 Order ID: \`${order._id}\`\n\n` +
    `_Rajdarbar Restaurant – Swad jo dil ko chhu jaye 🍽️_`
  );
}

// ─── Payment Failed ───────────────────────────────────────────────────────────
async function sendPaymentFailed(phoneNumber) {
  await sendText(
    phoneNumber,
    `❌ *Payment unsuccessful!*\n\nAapka order place nahi hua.\n\nDobara order karne ke liye *"Hi"* type karein.`
  );
}

module.exports = {sendText,sendMenu,sendWelcome,sendQuantityRequest,sendAddressChoice,sendAskAddressText,sendAskLocation,sendPaymentLink,sendOrderConfirmation,sendPaymentFailed,};