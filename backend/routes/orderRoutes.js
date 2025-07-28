const express = require("express")
const router = express.Router()
const orderController = require("../controllers/orderController")
const authMiddleware = require("../middleware/authMiddleware")

// All order routes require authentication
router.use(authMiddleware)

// Order routes
router.post("/", orderController.createOrder)
router.get("/", orderController.getUserOrders)
router.get("/stats", orderController.getOrderStats)
router.get("/:orderId", orderController.getOrder)
router.patch("/:orderId/status", orderController.updateOrderStatus)

module.exports = router
