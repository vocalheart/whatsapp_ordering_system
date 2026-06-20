const axios = require("axios");
const { getWhatsAppList } = require("./WhatsAppList");

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const api = axios.create({
  baseURL: `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}`,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// ─── Send Menu List ───────────────────────────────────────────────────────────
async function sendMenu(phoneNumber) {
  const payload = await getWhatsAppList();
  payload.to = phoneNumber;
  const response = await api.post("/messages", payload);
  return response.data;
}

// ─── Send Plain Text ──────────────────────────────────────────────────────────
async function sendText(phoneNumber, text) {
  const payload = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "text",
    text: { body: text },
  };
  const response = await api.post("/messages", payload);
  return response.data;
}

// ─── Send Welcome Message ────────────────────────────────────────────────────
async function sendWelcome(phoneNumber) {
  return sendText(
    phoneNumber,
    "🙏 *Rajdarbar Restaurant mein aapka swagat hai!*\n\nHamara menu dekhne ke liye neeche *View Menu* button dabayein."
  );
}

// ─── Send Quantity Request ───────────────────────────────────────────────────
async function sendQuantityRequest(phoneNumber, itemName, price) {
  return sendText(
    phoneNumber,`✅ *${itemName}* select kiya! (₹${price} each)\n\nKitni quantity chahiye? Sirf number type karein (jaise: 1, 2, 3...)`
  );
}

// ─── Send Address Choice (Button Message) ────────────────────────────────────
async function sendAddressChoice(phoneNumber) {
  const payload = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: "📍 *Delivery address kaise dena chahoge?*",
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: { id: "address_text", title: "✍️ Type karke" },
          },
          {
            type: "reply",
            reply: { id: "address_location", title: "📌 Location Pin" },
          },
        ],
      },
    },
  };
  const response = await api.post("/messages", payload);
  return response.data;
}

// ─── Ask User to Type Address ─────────────────────────────────────────────────
async function sendAskAddressText(phoneNumber) {
  return sendText(
    phoneNumber,
    "✍️ Apna *poora delivery address* type karein:\n\n_(Gali, Mohalla, Landmark, Sheher)_"
  );
}

// ─── Ask User to Share Location ───────────────────────────────────────────────
async function sendAskLocation(phoneNumber) {
  return sendText(
    phoneNumber,
    "📌 WhatsApp mein *paperclip (📎) icon* dabayein → *Location* → *Send Your Current Location* share karein."
  );
}

// ─── Send Order Confirmation ──────────────────────────────────────────────────
async function sendOrderConfirmation(phoneNumber, order, address) {
  const item = order.items[0];
  const text =
    `🎉 *Order Confirmed!*\n\n` +
    `📦 *Item:* ${item.name}\n` +
    `🔢 *Quantity:* ${item.quantity}\n` +
    `💰 *Total:* ₹${order.totalAmount}\n` +
    `📍 *Address:* ${address}\n\n` +
    `⏱️ Aapka order 30-45 minutes mein deliver ho jayega.\n` +
    `Order ID: \`${order._id}\`\n\n` +
    `_Rajdarbar Restaurant – Swad jo dil ko chhu jaye 🍽️_`;

  return sendText(phoneNumber, text);
}

module.exports = {sendMenu,sendText,sendWelcome,sendQuantityRequest,sendAddressChoice,sendAskAddressText,sendAskLocation,sendOrderConfirmation};