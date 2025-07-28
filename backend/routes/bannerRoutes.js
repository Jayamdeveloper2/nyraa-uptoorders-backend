const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")

// Apply authentication middleware to all routes
router.use(authMiddleware)

// Placeholder routes for banner management
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Banner routes - Coming soon",
    data: [],
  })
})

// Admin only routes
router.use(adminMiddleware)

router.post("/", (req, res) => {
  res.json({
    success: true,
    message: "Create banner - Coming soon",
  })
})

router.put("/:id", (req, res) => {
  res.json({
    success: true,
    message: "Update banner - Coming soon",
  })
})

router.delete("/:id", (req, res) => {
  res.json({
    success: true,
    message: "Delete banner - Coming soon",
  })
})

module.exports = router
