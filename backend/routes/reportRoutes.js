const express = require("express")
const router = express.Router()
const reportController = require("../controllers/reportController")
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")

// Apply authentication and admin middleware to all routes
router.use(authMiddleware)
router.use(adminMiddleware)

router.get("/sales", reportController.getSalesReport)
router.get("/customers", reportController.getCustomerReport)
router.get("/products", reportController.getProductReport)
router.get("/inventory", reportController.getInventoryReport)
router.get("/financial", reportController.getFinancialReport)

module.exports = router
