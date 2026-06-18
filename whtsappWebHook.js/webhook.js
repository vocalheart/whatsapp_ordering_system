const express = require("express");
const router = express.Router();

router.get("/webhook", (req, res) => {
  console.log("===== GET WEBHOOK =====");
  console.log("Query:", req.query);

  const VERIFY_TOKEN = "rajdarbar_webhook_123";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Mode:", mode);
  console.log("Token:", token);
  console.log("Challenge:", challenge);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  console.log("❌ VERIFICATION FAILED");
  return res.sendStatus(403);
});

router.post("/webhook", (req, res) => {
  console.log("===== POST WEBHOOK HIT =====");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));

  const message =
    req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    console.log("📩 Message From:", message.from);
    console.log("📩 Message Type:", message.type);

    if (message.text) {
      console.log("📩 Text:", message.text.body);
    }
  } else {
    console.log("⚠️ No message found in payload");
  }

  res.status(200).send("EVENT_RECEIVED");
});

module.exports = router;