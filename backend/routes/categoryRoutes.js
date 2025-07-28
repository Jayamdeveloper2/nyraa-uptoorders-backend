const express = require("express")
const router = express.Router()
const categoryController = require("../controllers/categoryController")
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")

// Public routes
router.get("/", categoryController.getAllCategories)
router.get("/active", categoryController.getActiveCategories)
router.get("/tree", categoryController.getCategoryTree)
router.get("/stats", categoryController.getCategoryStats)
router.get("/:id", categoryController.getCategoryById)

// Protected admin routes
router.post("/", authMiddleware, adminMiddleware, categoryController.createCategory)
router.put("/:id", authMiddleware, adminMiddleware, categoryController.updateCategory)
router.delete("/:id", authMiddleware, adminMiddleware, categoryController.deleteCategory)

module.exports = router
