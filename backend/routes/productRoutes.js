const express = require("express")
const router = express.Router()
const productController = require("../controllers/productController")
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")
const multer = require("multer")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + "-" + file.originalname)
  },
})
const upload = multer({ storage })

// Public routes
router.get("/products", productController.getAllProducts)
router.get("/products/search", productController.searchProducts)
router.get("/products/stats", productController.getProductStats)
router.get("/products/:id", productController.getProductById)

// Protected admin routes for products
router.post("/products", authMiddleware, adminMiddleware, upload.array("images", 10), productController.createProduct)
router.put("/products/:id", authMiddleware, adminMiddleware, upload.array("images", 10), productController.updateProduct)
router.delete("/products/:id", authMiddleware, adminMiddleware, productController.deleteProduct)

module.exports = router