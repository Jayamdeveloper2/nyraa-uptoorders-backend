const express = require("express")
const router = express.Router()
const couponController = require("../controllers/couponController")
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")

// Apply authentication middleware to all routes
router.use(authMiddleware)

// Public routes (authenticated users)
router.post("/validate", couponController.validateCoupon)

// Admin only routes
router.use(adminMiddleware)
router.get("/", couponController.getAllCoupons)
router.get("/stats", couponController.getCouponStats)
router.get("/:id", couponController.getCouponById)
router.post("/", couponController.createCoupon)
router.put("/:id", couponController.updateCoupon)
router.delete("/:id", couponController.deleteCoupon)

module.exports = router
