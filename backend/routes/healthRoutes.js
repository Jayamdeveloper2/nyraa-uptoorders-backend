const express = require("express")
const router = express.Router()

// Health check endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    status: "healthy",
  })
})

module.exports = router
