const { getMenu } = require("../services/menuService");

async function getWhatsAppList() {
  const menu = await getMenu();

  const rows = menu.data.map((item) => ({
    id: item._id,
    title: item.name,
    description: `₹${item.price}`,
  }));
  return {
    messaging_product: "whatsapp",
    type: "interactive",
    interactive: {
      type: "list",
      header: {
        type: "text",
        text: "🍽️ Rajdarbar Restaurant",
      },
      body: {
        text:
          "👋 Hello! How are you?\n\n🍽️ What would you like to order today?",
      },
      footer: {
        text: "Please select an item from the menu",
      },
      action: {
        button: "View Menu",
        sections: [
          {
            title: "Today's Menu",
            rows,
          },
        ],
      },
    },
  };
}

module.exports = { getWhatsAppList };