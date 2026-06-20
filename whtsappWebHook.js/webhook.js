const express = require("express");
const router = express.Router();

const { getSession, updateSession, resetSession } = require("../services/sessionService");
const { createOrder } = require("../services/orderService");
const {sendMenu,sendWelcome,sendQuantityRequest,sendAddressChoice,sendAskAddressText,sendAskLocation,sendOrderConfirmation,sendText,} = require("../whatsapp_list/SendtoWhatsApp");

// ─── Webhook Verification ─────────────────────────────────────────────────────
router.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "rajdarbar_webhook_123";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// ─── Webhook POST Handler ─────────────────────────────────────────────────────
router.post("/webhook", async (req, res) => {
  // Always respond 200 quickly to WhatsApp
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message) return;

    const from = message.from;
    const msgType = message.type; // text | interactive | location

    console.log(`\n📩 From: ${from} | Type: ${msgType}`);

    const session = await getSession(from);
    console.log(`📌 State: ${session.state}`);

    // ── Handle based on message type ──────────────────────────────────────────

    // 1️⃣ TEXT MESSAGE
    if (msgType === "text") {
      const text = message.text?.body?.trim().toLowerCase();
      console.log(`💬 Text: "${text}"`);

      // Greetings → Welcome + Menu
      if (["hi", "hii", "hello", "helo", "hey", "namaste"].includes(text)) {
        await resetSession(from);
        await sendWelcome(from);
        await sendMenu(from);
        await updateSession(from, { state: "awaiting_menu_selection" });
        return;
      }

      // Quantity input
      if (session.state === "awaiting_quantity") {
        const qty = parseInt(text);
        if (isNaN(qty) || qty < 1 || qty > 20) {
          await sendText(from, "⚠️ Kripya valid quantity daalen (1 se 20 ke beech):");
          return;
        }
        await updateSession(from, { quantity: qty, state: "awaiting_address_choice" });
        await sendAddressChoice(from);
        return;
      }

      // Address text input
      if (session.state === "awaiting_address_text") {
        if (text.length < 10) {
          await sendText(from, "⚠️ Address thoda detail mein likhein (gali, mohalla, sheher):");
          return;
        }
        const fullAddress = message.text.body.trim(); // preserve original case
        await updateSession(from, { address: fullAddress, state: "order_confirmed" });
        await placeOrder(from, session, session.quantity, fullAddress, null);
        return;
      }

      // Default / unknown state
      await sendText(
        from,
        '👋 *Rajdarbar Restaurant*\n\nOrder karne ke liye "Hi" type karein.'
      );
    }

    // 2️⃣ INTERACTIVE MESSAGE (List reply or Button reply)
    else if (msgType === "interactive") {
      const interactiveType = message.interactive?.type;

      // List reply → item selected from menu
      if (interactiveType === "list_reply") {
        const reply = message.interactive.list_reply;
        const itemId = reply.id;
        const itemName = reply.title;
        const priceStr = reply.description; // "₹120"
        const price = parseFloat(priceStr.replace(/[^\d.]/g, ""));

        console.log(`🍽️ Item selected: ${itemName} (₹${price})`);

        await updateSession(from, {
          state: "awaiting_quantity",
          selectedItem: { itemId, name: itemName, price },
        });
        await sendQuantityRequest(from, itemName, price);
        return;
      }

      // Button reply → address choice
      if (interactiveType === "button_reply") {
        const buttonId = message.interactive.button_reply?.id;
        console.log(`🔘 Button: ${buttonId}`);

        if (buttonId === "address_text") {
          await updateSession(from, { state: "awaiting_address_text" });
          await sendAskAddressText(from);
          return;
        }

        if (buttonId === "address_location") {
          await updateSession(from, { state: "awaiting_location" });
          await sendAskLocation(from);
          return;
        }
      }
    }

    // 3️⃣ LOCATION MESSAGE
    else if (msgType === "location") {
      if (session.state === "awaiting_location") {
        const { latitude, longitude, name, address } = message.location;
        const locationLabel =
          address || name || `${latitude}, ${longitude}`;

        await updateSession(from, {
          address: locationLabel,
          location: { latitude, longitude },
          state: "order_confirmed",
        });
        await placeOrder(from, session, session.quantity, locationLabel, {
          latitude,
          longitude,
        });
        return;
      }

      await sendText(from, '📍 Location mila! Order ke liye "Hi" type karein.');
    }

    // 4️⃣ UNHANDLED TYPE
    else {
      console.log(`⚠️ Unhandled message type: ${msgType}`);
    }
  } catch (error) {
    console.error("❌ Webhook error:", error);
  }
});

// ─── Place Order Helper ────────────────────────────────────────────────────────
async function placeOrder(phoneNumber, session, quantity, address, location) {
  try {
    const order = await createOrder({
      phoneNumber,
      item: session.selectedItem,
      quantity,
      address,
      location,
    });

    console.log(`✅ Order created: ${order._id}`);
    await sendOrderConfirmation(phoneNumber, order, address);
    await resetSession(phoneNumber);
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    await sendText(phoneNumber, "⚠️ Order place karne mein problem aai. Please dobara try karein.");
    await resetSession(phoneNumber);
  }
}

module.exports = router;