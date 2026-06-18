const express = require("express");
const router = express.Router();
const { getMenu } = require("../services/menuService");

router.get("/list", async (req, res) => {
  try {
    const menu = await getMenu();

    const rows = menu.data.map((item) => ({
      id: item._id,
      title: item.name,
      description: `₹${item.price}`,
    }));

    res.json({
      success: true,
      rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;