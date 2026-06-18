const axios = require("axios");
const { getWhatsAppList } = require("./WhatsAppList");

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

async function sendMenu(phoneNumber) {
  try {
    const payload = await getWhatsAppList();

    payload.to = phoneNumber;

    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(
      error.response?.data || error.message
    );
  }
}

module.exports = { sendMenu };