const express = require("express")
const router = express.Router()
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  cancelOrder,
} = require("../controllers/orderController")
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")

// Apply authentication middleware to all routes
router.use(authMiddleware)

// Create new order (users only)
router.post("/", createOrder)

// Get user orders (users get their own, admins can specify userId)
router.get("/", getUserOrders)

// Get order statistics (admin only)
router.get("/stats", adminMiddleware, getOrderStats)

// Get single order by ID
router.get("/:id", getOrderById)

// Update order status (admin only)
router.patch("/:id/status", adminMiddleware, updateOrderStatus)

// Cancel order (users can cancel their own orders)
router.patch("/:id/cancel", cancelOrder)

module.exports = router
