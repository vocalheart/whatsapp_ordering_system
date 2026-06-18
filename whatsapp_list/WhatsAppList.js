const { getMenu } = require("../services/menuService");

async function getWhatsAppList() {
  const menu = await getMenu();

  const rows = menu.data.map((item) => ({
    id: item._id,
    title: item.name,
    description: `₹${item.price}`
  }));

  return {
    messaging_product: "whatsapp",
    type: "interactive",
    interactive: {
      type: "list",
      body: {
        text: "🍽️ Select Your Food"
      },
      action: {
        button: "View Menu",
        sections: [
          {
            title: "Today's Menu",
            rows
          }
        ]
      }
    }
  };
}

module.exports = { getWhatsAppList };