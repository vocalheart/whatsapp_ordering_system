const router = require("express").Router();

router.get("/webhook", (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("Webhook Verify Request:", req.query);

    const IG_VERIFY_TOKEN = "a1meals_igbot_2026";

    if (mode === "subscribe" && token === IG_VERIFY_TOKEN) {
      console.log("WEBHOOK VERIFIED");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.post("/webhook", (req, res) => {
  try {
    console.log("Webhook Event:", JSON.stringify(req.body, null, 2));
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

module.exports = router;