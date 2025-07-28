const express = require("express")
const router = express.Router()
const colorController = require("../../controllers/units/colorController")
const authMiddleware = require("../../middleware/authMiddleware")
const adminMiddleware = require("../../middleware/adminMiddleware")

// Protected admin routes for colors
router.get("/colors", authMiddleware, adminMiddleware, colorController.getAllColors)
router.post("/colors", authMiddleware, adminMiddleware, colorController.createColor)
router.put("/colors/:id", authMiddleware, adminMiddleware, colorController.updateColor)
router.delete("/colors/:id", authMiddleware, adminMiddleware, colorController.deleteColor)

module.exports = router