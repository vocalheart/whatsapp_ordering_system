const axios = require("axios");

async function getMenu() {
  const response = await axios.get("https://readymealzbackend-1.onrender.com/api/bulk/public");
  console.log(response.data);
  return response.data;
}

module.exports = { getMenu };