const express = require("express");
const router = express.Router();

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

router.post("/webhook", (req, res) => {
  console.log("Webhook Hit");
  console.log(JSON.stringify(req.body, null, 2));

  res.sendStatus(200);
});

module.exports = router;