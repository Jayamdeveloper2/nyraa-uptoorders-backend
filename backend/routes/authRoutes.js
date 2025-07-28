const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")
const multer = require("multer")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/")  
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + "-" + file.originalname)
  },
})
const upload = multer({ storage })

// Authentication routes
router.post("/admin/login", authController.adminLogin)
router.post("/user/login", authController.userLogin)
router.post("/send-otp", authController.sendOTP)
router.post("/verify-otp", authController.verifyOTP)
router.post("/google", authController.googleLogin)

// Protected routes
router.get("/profile", authMiddleware, authController.getProfile)
router.put("/profile", authMiddleware, authController.updateProfile)
router.put("/change-password", authMiddleware, authController.changePassword)
router.post("/upload-avatar", authMiddleware, upload.single("avatar"), authController.uploadAvatar)

module.exports = router