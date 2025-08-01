const express = require("express")
const router = express.Router()
const orderController = require("../controllers/orderController")
const authMiddleware = require("../middleware/authMiddleware")

// Apply auth middleware to all routes
router.use(authMiddleware)

// User routes
router.post("/", orderController.createOrder)
router.get("/", orderController.getUserOrders)
router.get("/:id", orderController.getOrder)

// Admin routes
router.patch("/:id/status", orderController.updateOrderStatus)
router.get("/admin/stats", orderController.getOrderStats)

module.exports = router
