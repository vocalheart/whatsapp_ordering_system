const axios = require("axios");

async function getMenu() {
  const response = await axios.get(
    "https://api.a1meals.com/api/bulk/public"
  );

  console.log(response.data);
  return response.data;
}

module.exports = { getMenu };