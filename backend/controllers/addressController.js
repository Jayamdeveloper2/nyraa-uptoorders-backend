const Address = require("../models/Address")
const User = require("../models/User")
const { Op } = require("sequelize")
const sequelize = require("../config/db")

// Get all addresses for a user
exports.getUserAddresses = async (req, res) => {
  try {
    console.log(`📍 Getting addresses for user: ${req.user.id}`)
    const userId = req.user.id

    const addresses = await Address.findAll({
      where: { userId },
      order: [
        ["isDefault", "DESC"], // Default address first
        ["createdAt", "DESC"], // Then by creation date
      ],
    })

    console.log(`📍 Found ${addresses.length} addresses`)

    res.json({
      success: true,
      message: "Addresses retrieved successfully",
      data: addresses,
    })
  } catch (error) {
    console.error("Error fetching addresses:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
      error: error.message,
    })
  }
}

// Get single address
exports.getAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    const userId = req.user.id

    console.log(`📍 Getting address ${addressId} for user ${userId}`)

    const address = await Address.findOne({
      where: {
        id: addressId,
        userId, // Ensure user can only access their own addresses
      },
    })

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    res.json({
      success: true,
      message: "Address retrieved successfully",
      data: address,
    })
  } catch (error) {
    console.error("Error fetching address:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch address",
      error: error.message,
    })
  }
}

// Create new address
exports.createAddress = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const userId = req.user.id
    const {
      name,
      street,
      city,
      state,
      zip,
      country = "United States",
      phone,
      type = "home",
      isDefault = false,
    } = req.body

    console.log(`📍 Creating address for user ${userId}:`, req.body)

    // Validate required fields
    if (!name || !street || !city || !state || !zip || !phone) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided (name, street, city, state, zip, phone)",
      })
    }

    // Check if user exists
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // If this is the user's first address, make it default
    const existingAddressCount = await Address.count({ where: { userId } })
    const shouldBeDefault = isDefault || existingAddressCount === 0

    console.log(`📍 Should be default: ${shouldBeDefault} (existing count: ${existingAddressCount})`)

    // Create the address
    const address = await Address.create(
      {
        userId,
        name: name.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        country: country.trim(),
        phone: phone.trim(),
        type,
        isDefault: shouldBeDefault,
      },
      { transaction },
    )

    await transaction.commit()

    console.log(`📍 Address created successfully: ${address.id}`)

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Error creating address:", error)

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to create address",
      error: error.message,
    })
  }
}

// Update address
exports.updateAddress = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { addressId } = req.params
    const userId = req.user.id
    const { name, street, city, state, zip, country, phone, type, isDefault } = req.body

    console.log(`📍 Updating address ${addressId} for user ${userId}`)

    // Find the address
    const address = await Address.findOne({
      where: {
        id: addressId,
        userId, // Ensure user can only update their own addresses
      },
    })

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    // Prepare update data
    const updateData = {}
    if (name !== undefined) updateData.name = name.trim()
    if (street !== undefined) updateData.street = street.trim()
    if (city !== undefined) updateData.city = city.trim()
    if (state !== undefined) updateData.state = state.trim()
    if (zip !== undefined) updateData.zip = zip.trim()
    if (country !== undefined) updateData.country = country.trim()
    if (phone !== undefined) updateData.phone = phone.trim()
    if (type !== undefined) updateData.type = type
    if (isDefault !== undefined) updateData.isDefault = isDefault

    // Update the address
    await address.update(updateData, { transaction })

    await transaction.commit()

    console.log(`📍 Address updated successfully: ${address.id}`)

    res.json({
      success: true,
      message: "Address updated successfully",
      data: address,
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Error updating address:", error)

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to update address",
      error: error.message,
    })
  }
}

// Delete address
exports.deleteAddress = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { addressId } = req.params
    const userId = req.user.id

    console.log(`📍 Deleting address ${addressId} for user ${userId}`)

    // Find the address
    const address = await Address.findOne({
      where: {
        id: addressId,
        userId, // Ensure user can only delete their own addresses
      },
    })

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    const wasDefault = address.isDefault

    // Delete the address
    await address.destroy({ transaction })

    // If the deleted address was default, set another address as default
    if (wasDefault) {
      const nextAddress = await Address.findOne({
        where: { userId },
        order: [["createdAt", "DESC"]],
      })

      if (nextAddress) {
        await nextAddress.update({ isDefault: true }, { transaction })
        console.log(`📍 Set address ${nextAddress.id} as new default`)
      }
    }

    await transaction.commit()

    console.log(`📍 Address deleted successfully: ${addressId}`)

    res.json({
      success: true,
      message: "Address deleted successfully",
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Error deleting address:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete address",
      error: error.message,
    })
  }
}

// Set address as default
exports.setDefaultAddress = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { addressId } = req.params
    const userId = req.user.id

    console.log(`📍 Setting address ${addressId} as default for user ${userId}`)

    // Find the address
    const address = await Address.findOne({
      where: {
        id: addressId,
        userId, // Ensure user can only modify their own addresses
      },
    })

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    // Set this address as default (the model hook will handle unsetting others)
    await address.update({ isDefault: true }, { transaction })

    await transaction.commit()

    // Fetch all addresses to return updated list
    const addresses = await Address.findAll({
      where: { userId },
      order: [
        ["isDefault", "DESC"],
        ["createdAt", "DESC"],
      ],
    })

    console.log(`📍 Address set as default successfully: ${addressId}`)

    res.json({
      success: true,
      message: "Default address updated successfully",
      data: addresses,
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Error setting default address:", error)
    res.status(500).json({
      success: false,
      message: "Failed to set default address",
      error: error.message,
    })
  }
}

// Get default address for a user
exports.getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id

    console.log(`📍 Getting default address for user ${userId}`)

    const defaultAddress = await Address.findOne({
      where: {
        userId,
        isDefault: true,
      },
    })

    if (!defaultAddress) {
      return res.status(404).json({
        success: false,
        message: "No default address found",
      })
    }

    res.json({
      success: true,
      message: "Default address retrieved successfully",
      data: defaultAddress,
    })
  } catch (error) {
    console.error("Error fetching default address:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch default address",
      error: error.message,
    })
  }
}

module.exports = exports
