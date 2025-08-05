const express = require("express")
const router = express.Router()
const orderController = require("../controllers/orderController")
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")

// Apply auth middleware to all routes
router.use(authMiddleware)

// User routes
router.post("/", orderController.createOrder)
router.get("/", orderController.getUserOrders)
router.get("/:id", orderController.getOrder)

// Admin routes (require admin privileges)
router.patch("/:id/status", adminMiddleware, orderController.updateOrderStatus)
router.get("/admin/stats", adminMiddleware, orderController.getOrderStats)

module.exports = router
