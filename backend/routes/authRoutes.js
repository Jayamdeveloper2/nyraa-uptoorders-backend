const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Ensure uploads/avatars directory exists
const avatarDir = path.join(__dirname, "..", "uploads", "avatars")
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir) // Use the verified directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, uniqueSuffix + ext) // Simplified filename with extension
  },
})

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|avif/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb(new Error("Only images (jpeg, jpg, png, gif, webp, avif) are allowed"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

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
router.post(
  "/upload-avatar",
  authMiddleware,
  (req, res, next) => {
    upload.single("avatar")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` })
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message })
      }
      next()
    })
  },
  authController.uploadAvatar,
)

module.exports = router
