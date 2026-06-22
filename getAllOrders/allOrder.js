const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// GET All Orders (Pagination - 10 per page)
router.get("/orders", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    res.status(200).json({success: true,currentPage: page,totalPages: Math.ceil(totalOrders / limit),totalOrders,count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

// GET Single Order
router.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {return res.status(404).json({success: false,message: "Order not found",});}
    res.status(200).json({success: true,data: order});
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({success: false,message: "Failed to fetch order", error: error.message, });
  }
});

// UPDATE Order Status
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["awaiting_payment","confirmed","preparing", "delivered","cancelled"];
    if (!validStatuses.includes(status)) {return res.status(400).json({success: false, message: "Invalid status" })}
    const order = await Order.findByIdAndUpdate(req.params.id,{ status },{new: true,runValidators: true});
    if (!order) {return res.status(404).json({success: false,message: "Order not found"})}
    res.status(200).json({success: true,message: "Order status updated successfully",data: order,});
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({success: false, message: "Failed to update order status",error: error.message});
  }
});

// DELETE Order
router.delete("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {return res.status(404).json({success: false, message: "Order not found"})}
    res.status(200).json({success: true,message: "Order deleted successfully"});
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({success: false,message: "Failed to delete order",error: error.message});
  }
});

module.exports = router;