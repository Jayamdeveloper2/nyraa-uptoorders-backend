const Coupon = require("../models/Coupon")
const { Op } = require("sequelize")

// Get all coupons with filtering and pagination
exports.getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type, sortBy = "createdAt", sortOrder = "DESC" } = req.query

    const offset = (page - 1) * limit
    const where = {}

    // Apply filters
    if (search) {
      where[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ]
    }

    if (status) where.status = status
    if (type) where.type = type

    // Auto-update expired coupons
    await Coupon.update(
      { status: "Expired" },
      {
        where: {
          endDate: { [Op.lt]: new Date() },
          status: { [Op.ne]: "Expired" },
        },
      },
    )

    const { count, rows: coupons } = await Coupon.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
      error: error.message,
    })
  }
}

// Get single coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params

    const coupon = await Coupon.findByPk(id)

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      })
    }

    res.json({
      success: true,
      data: coupon,
    })
  } catch (error) {
    console.error("Error fetching coupon:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon",
      error: error.message,
    })
  }
}

// Create new coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      type,
      value,
      minPurchase = 0,
      maxDiscount,
      startDate,
      endDate,
      usageLimit = 0,
      userLimit = 1,
      status = "Active",
      applicableProducts,
      applicableCategories,
      excludedProducts,
      excludedCategories,
      firstTimeOnly = false,
      autoApply = false,
    } = req.body

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ where: { code: code.toUpperCase() } })
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      })
    }

    // Validate value based on type
    if (type === "percentage" && (value <= 0 || value > 100)) {
      return res.status(400).json({
        success: false,
        message: "Percentage value must be between 1 and 100",
      })
    }

    if (type === "fixed" && value <= 0) {
      return res.status(400).json({
        success: false,
        message: "Fixed value must be greater than 0",
      })
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      name,
      description,
      type,
      value: Number.parseFloat(value),
      minPurchase: Number.parseFloat(minPurchase),
      maxDiscount: maxDiscount ? Number.parseFloat(maxDiscount) : null,
      startDate: start,
      endDate: end,
      usageLimit: Number.parseInt(usageLimit),
      userLimit: Number.parseInt(userLimit),
      status,
      applicableProducts: applicableProducts ? JSON.parse(applicableProducts) : null,
      applicableCategories: applicableCategories ? JSON.parse(applicableCategories) : null,
      excludedProducts: excludedProducts ? JSON.parse(excludedProducts) : null,
      excludedCategories: excludedCategories ? JSON.parse(excludedCategories) : null,
      firstTimeOnly: firstTimeOnly === "true" || firstTimeOnly === true,
      autoApply: autoApply === "true" || autoApply === true,
    })

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    })
  } catch (error) {
    console.error("Error creating coupon:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
      error: error.message,
    })
  }
}

// Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    // Handle numeric fields
    if (updateData.value) updateData.value = Number.parseFloat(updateData.value)
    if (updateData.minPurchase) updateData.minPurchase = Number.parseFloat(updateData.minPurchase)
    if (updateData.maxDiscount) updateData.maxDiscount = Number.parseFloat(updateData.maxDiscount)
    if (updateData.usageLimit) updateData.usageLimit = Number.parseInt(updateData.usageLimit)
    if (updateData.userLimit) updateData.userLimit = Number.parseInt(updateData.userLimit)

    // Handle date fields
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate)
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate)

    // Handle JSON fields
    if (updateData.applicableProducts && typeof updateData.applicableProducts === "string") {
      updateData.applicableProducts = JSON.parse(updateData.applicableProducts)
    }
    if (updateData.applicableCategories && typeof updateData.applicableCategories === "string") {
      updateData.applicableCategories = JSON.parse(updateData.applicableCategories)
    }
    if (updateData.excludedProducts && typeof updateData.excludedProducts === "string") {
      updateData.excludedProducts = JSON.parse(updateData.excludedProducts)
    }
    if (updateData.excludedCategories && typeof updateData.excludedCategories === "string") {
      updateData.excludedCategories = JSON.parse(updateData.excludedCategories)
    }

    // Handle boolean fields
    if (updateData.firstTimeOnly !== undefined) {
      updateData.firstTimeOnly = updateData.firstTimeOnly === "true" || updateData.firstTimeOnly === true
    }
    if (updateData.autoApply !== undefined) {
      updateData.autoApply = updateData.autoApply === "true" || updateData.autoApply === true
    }

    // Convert code to uppercase if provided
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase()

      // Check if new code already exists (excluding current coupon)
      const existingCoupon = await Coupon.findOne({
        where: {
          code: updateData.code,
          id: { [Op.ne]: id },
        },
      })

      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        })
      }
    }

    // Validate dates if both are provided
    if (updateData.startDate && updateData.endDate && updateData.startDate >= updateData.endDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      })
    }

    const [updatedRowsCount] = await Coupon.update(updateData, {
      where: { id },
    })

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      })
    }

    const updatedCoupon = await Coupon.findByPk(id)

    res.json({
      success: true,
      message: "Coupon updated successfully",
      data: updatedCoupon,
    })
  } catch (error) {
    console.error("Error updating coupon:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
      error: error.message,
    })
  }
}

// Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params

    const coupon = await Coupon.findByPk(id)
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      })
    }

    await coupon.destroy()

    res.json({
      success: true,
      message: "Coupon deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
      error: error.message,
    })
  }
}

// Validate coupon code
exports.validateCoupon = async (req, res) => {
  try {
    const { code, customerId, cartTotal, products } = req.body

    const coupon = await Coupon.findOne({
      where: {
        code: code.toUpperCase(),
        status: "Active",
      },
    })

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      })
    }

    const now = new Date()

    // Check if coupon is within valid date range
    if (now < coupon.startDate || now > coupon.endDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired or is not yet active",
      })
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit exceeded",
      })
    }

    // Check minimum purchase requirement
    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₹${coupon.minPurchase} required`,
      })
    }

    // Calculate discount
    let discountAmount = 0

    if (coupon.type === "percentage") {
      discountAmount = (cartTotal * coupon.value) / 100
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }
    } else if (coupon.type === "fixed") {
      discountAmount = Math.min(coupon.value, cartTotal)
    }

    res.json({
      success: true,
      message: "Coupon is valid",
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value,
        },
        discountAmount,
        finalAmount: cartTotal - discountAmount,
      },
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
      error: error.message,
    })
  }
}

// Get coupon statistics
exports.getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.count()
    const activeCoupons = await Coupon.count({ where: { status: "Active" } })
    const expiredCoupons = await Coupon.count({ where: { status: "Expired" } })
    const inactiveCoupons = await Coupon.count({ where: { status: "Inactive" } })

    // Coupon usage statistics
    const mostUsedCoupons = await Coupon.findAll({
      attributes: ["id", "code", "name", "usageCount", "usageLimit"],
      order: [["usageCount", "DESC"]],
      limit: 10,
    })

    // Coupon types distribution
    const couponTypes = await Coupon.findAll({
      attributes: ["type", [Coupon.sequelize.fn("COUNT", Coupon.sequelize.col("id")), "count"]],
      group: ["type"],
    })

    res.json({
      success: true,
      data: {
        overview: {
          totalCoupons,
          activeCoupons,
          expiredCoupons,
          inactiveCoupons,
        },
        mostUsedCoupons,
        couponTypes,
      },
    })
  } catch (error) {
    console.error("Error fetching coupon stats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon statistics",
      error: error.message,
    })
  }
}

module.exports = exports
