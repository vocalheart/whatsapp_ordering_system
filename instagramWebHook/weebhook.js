const router = require("express").Router();
const axios = require("axios");
const { getMenu } = require("../services/menuService");

const IG_VERIFY_TOKEN = process.env.IG_VERIFY_TOKEN;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

const userOrders = {};

function formatMenu(menuData) {
  const items = menuData.data || [];
  let text = "🍽️ Rajdarbar Restaurant Menu\n\n";
  items.forEach((item, index) => {
    text += `${index + 1}. ${item.name} — ₹${item.price}\n`;
  });

  text += "\nReply with item number to order 😊";
  return text;
}

async function sendInstagramMessage(recipientId, messageText) {
  try {
    const response = await axios.post(
      "https://graph.facebook.com/v25.0/me/messages",
      {
        recipient: { id: recipientId },
        message: { text: messageText }
      },
      {
        params: {
          access_token: IG_ACCESS_TOKEN
        },
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Message sent:", response.data);
  } catch (error) {
    console.log("SEND MESSAGE ERROR:");
    console.dir(error.response?.data || error.message, { depth: null });
  }
}

// WEBHOOK VERIFY
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === IG_VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Extract message helper
function extractMessage(body) {
  const entry = body?.entry?.[0];
  if (!entry) return null;

  // Instagram messaging format
  const messaging = entry.messaging?.[0];
  if (messaging) {
    if (messaging.read) return { ignore: "READ_EVENT" };
    if (messaging.message_edit) return { ignore: "MESSAGE_EDIT" };
    if (messaging.reaction) return { ignore: "REACTION_EVENT" };

    return {
      senderId: messaging.sender?.id,
      message: messaging.message?.text
    };
  }

  // WhatsApp style changes payload
  const changeMsg = entry?.changes?.[0]?.value?.messages?.[0];
  if (changeMsg) {
    return {
      senderId: changeMsg.from,
      message: changeMsg.text?.body
    };
  }

  return null;
}

// RECEIVE EVENTS
router.post("/webhook", async (req, res) => {
  try {
    console.log("========== WEBHOOK ==========");
    console.dir(req.body, { depth: null });

    const data = extractMessage(req.body);

    if (!data) {
      console.log("No valid message payload");
      return res.sendStatus(200);
    }

    if (data.ignore) {
      console.log("Ignored:", data.ignore);
      return res.sendStatus(200);
    }

    const { senderId, message } = data;

    if (!senderId || !message) {
      console.log("Missing sender/message");
      return res.sendStatus(200);
    }

    const msg = message.toLowerCase().trim();

    console.log("Sender:", senderId);
    console.log("Message:", msg);

    // Greeting
    if (["hi", "hello", "hey"].includes(msg)) {
      await sendInstagramMessage(
        senderId,
        `🙏 Welcome to Rajdarbar Restaurant

Type:
MENU → View Menu
HELP → Customer Support`
      );
    }

    // Menu
    else if (msg === "menu") {
      const menu = await getMenu();
      const menuText = formatMenu(menu);

      userOrders[senderId] = {
        step: "SELECT_ITEM",
        menu: menu.data
      };

      await sendInstagramMessage(senderId, menuText);
    }

    // Select item
    else if (
      userOrders[senderId] &&
      userOrders[senderId].step === "SELECT_ITEM"
    ) {
      const selectedIndex = Number(msg) - 1;
      const menu = userOrders[senderId].menu;

      if (selectedIndex >= 0 && selectedIndex < menu.length) {
        const item = menu[selectedIndex];

        userOrders[senderId] = {
          step: "SELECT_QTY",
          item
        };

        await sendInstagramMessage(
          senderId,
          `You selected ${item.name} (₹${item.price})

Enter quantity:`
        );
      } else {
        await sendInstagramMessage(senderId, "Invalid item number.");
      }
    }

    // Quantity
    else if (
      userOrders[senderId] &&
      userOrders[senderId].step === "SELECT_QTY"
    ) {
      const qty = Number(msg);

      if (!qty || qty <= 0) {
        await sendInstagramMessage(senderId, "Please enter valid quantity");
      } else {
        const item = userOrders[senderId].item;
        const total = qty * item.price;

        delete userOrders[senderId];

        await sendInstagramMessage(
          senderId,
          `✅ Order Confirmed

Item: ${item.name}
Qty: ${qty}
Total: ₹${total}

Our team will contact you soon.`
        );
      }
    } else {
      await sendInstagramMessage(
        senderId,
        "Unknown command. Type MENU"
      );
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log("WEBHOOK ERROR:");
    console.dir(error, { depth: null });
    return res.sendStatus(500);
  }
});

module.exports = router;