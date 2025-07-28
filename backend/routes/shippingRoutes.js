const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")

// Apply authentication middleware to all routes
router.use(authMiddleware)

// Placeholder routes for shipping management
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Shipping routes - Coming soon",
    data: [],
  })
})

// Admin only routes
router.use(adminMiddleware)

router.post("/", (req, res) => {
  res.json({
    success: true,
    message: "Create shipping zone - Coming soon",
  })
})

router.put("/:id", (req, res) => {
  res.json({
    success: true,
    message: "Update shipping zone - Coming soon",
  })
})

router.delete("/:id", (req, res) => {
  res.json({
    success: true,
    message: "Delete shipping zone - Coming soon",
  })
})

module.exports = router
