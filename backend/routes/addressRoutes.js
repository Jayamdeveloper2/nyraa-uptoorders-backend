const express = require("express")
const router = express.Router()
const addressController = require("../controllers/addressController")
const authMiddleware = require("../middleware/authMiddleware")

// Debug middleware to log all address route requests
router.use((req, res, next) => {
  console.log(`📍 Address Route: ${req.method} ${req.originalUrl}`)
  next()
})

// All address routes require authentication
router.use(authMiddleware)

// GET /api/user/addresses - Get all addresses for authenticated user
router.get("/user/addresses", addressController.getUserAddresses)

// GET /api/user/addresses/default - Get default address for authenticated user
router.get("/user/addresses/default", addressController.getDefaultAddress)

// GET /api/user/addresses/:addressId - Get single address
router.get("/user/addresses/:addressId", addressController.getAddress)

// POST /api/user/addresses - Create new address
router.post("/user/addresses", addressController.createAddress)

// PUT /api/user/addresses/:addressId - Update address
router.put("/user/addresses/:addressId", addressController.updateAddress)

// PUT /api/user/addresses/:addressId/default - Set address as default
router.put("/user/addresses/:addressId/default", addressController.setDefaultAddress)

// DELETE /api/user/addresses/:addressId - Delete address
router.delete("/user/addresses/:addressId", addressController.deleteAddress)

module.exports = router
