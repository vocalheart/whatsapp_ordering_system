const express = require("express");
const router = express.Router();
const { sendMenu } = require("../whatsapp_list/SendtoWhatsApp");

router.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "rajdarbar_webhook_123";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

router.post("/webhook", async (req, res) => {
  try {
    console.log("===== POST WEBHOOK HIT =====");
    console.log(JSON.stringify(req.body, null, 2));

    const message =
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message?.text?.body?.toLowerCase();

    console.log("📩 From:", from);
    console.log("📩 Text:", text);

    if (
      text === "hi" ||
      text === "hii" ||
      text === "hello"
    ) {
      console.log("🚀 Sending Menu");

      await sendMenu(from);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;