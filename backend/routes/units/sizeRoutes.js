const express = require("express")
const router = express.Router()
const sizeController = require("../../controllers/units/sizeController")
const authMiddleware = require("../../middleware/authMiddleware")
const adminMiddleware = require("../../middleware/adminMiddleware")

// Protected admin routes for sizes
router.get("/sizes", authMiddleware, adminMiddleware, sizeController.getAllSizes)
router.post("/sizes", authMiddleware, adminMiddleware, sizeController.createSize)
router.put("/sizes/:id", authMiddleware, adminMiddleware, sizeController.updateSize)
router.delete("/sizes/:id", authMiddleware, adminMiddleware, sizeController.deleteSize)

module.exports = router