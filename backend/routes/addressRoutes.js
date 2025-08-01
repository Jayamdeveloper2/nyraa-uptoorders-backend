const express = require("express")
const router = express.Router()
const Address = require("../models/Address")
const authMiddleware = require("../middleware/authMiddleware")
const { Op } = require("sequelize")

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get all addresses for the authenticated user
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id
    const addresses = await Address.findAll({
      where: { userId },
      order: [
        ["isDefault", "DESC"],
        ["createdAt", "DESC"],
      ],
    })

    res.json({
      success: true,
      addresses,
    })
  } catch (error) {
    console.error("Error fetching addresses:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
      error: error.message,
    })
  }
})

// Get a specific address
router.get("/:id", async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const address = await Address.findOne({
      where: { id, userId },
    })

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    res.json({
      success: true,
      address,
    })
  } catch (error) {
    console.error("Error fetching address:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch address",
      error: error.message,
    })
  }
})

// Create a new address
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id
    const { name, street, city, state, zip, country, phone, type, isDefault } = req.body

    // Validate required fields
    if (!name || !street || !city || !state || !zip || !phone) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      })
    }

    // If this address is being set as default, remove default from other addresses
    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId, isDefault: true } })
    }

    const address = await Address.create({
      userId,
      name,
      street,
      city,
      state,
      zip,
      country: country || "United States",
      phone,
      type: type || "home",
      isDefault: isDefault || false,
    })

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      address,
    })
  } catch (error) {
    console.error("Error creating address:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create address",
      error: error.message,
    })
  }
})

// Update an address
router.put("/:id", async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { name, street, city, state, zip, country, phone, type, isDefault } = req.body

    const address = await Address.findOne({
      where: { id, userId },
    })

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    // If this address is being set as default, remove default from other addresses
    if (isDefault && !address.isDefault) {
      await Address.update({ isDefault: false }, { where: { userId, isDefault: true } })
    }

    await address.update({
      name: name || address.name,
      street: street || address.street,
      city: city || address.city,
      state: state || address.state,
      zip: zip || address.zip,
      country: country || address.country,
      phone: phone || address.phone,
      type: type || address.type,
      isDefault: isDefault !== undefined ? isDefault : address.isDefault,
    })

    res.json({
      success: true,
      message: "Address updated successfully",
      address,
    })
  } catch (error) {
    console.error("Error updating address:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update address",
      error: error.message,
    })
  }
})

// Set an address as default
router.patch("/:id/default", async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const address = await Address.findOne({
      where: { id, userId },
    })

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    // Remove default from all other addresses
    await Address.update({ isDefault: false }, { where: { userId, isDefault: true } })

    // Set this address as default
    await address.update({ isDefault: true })

    res.json({
      success: true,
      message: "Default address updated successfully",
      address,
    })
  } catch (error) {
    console.error("Error setting default address:", error)
    res.status(500).json({
      success: false,
      message: "Failed to set default address",
      error: error.message,
    })
  }
})

// Delete an address
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const address = await Address.findOne({
      where: { id, userId },
    })

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    await address.destroy()

    res.json({
      success: true,
      message: "Address deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting address:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete address",
      error: error.message,
    })
  }
})

module.exports = router
