const Customer = require("../models/Customer")
const Order = require("../models/Order")
const { Op } = require("sequelize")

// Get all customers with filtering and pagination
exports.getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, sortBy = "createdAt", sortOrder = "DESC" } = req.query

    const offset = (page - 1) * limit
    const where = {}

    // Apply filters
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ]
    }

    if (status) where.status = status

    const { count, rows: customers } = await Customer.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      include: [
        {
          model: Order,
          as: "orders",
          attributes: ["id", "orderNumber", "totalAmount", "status", "createdAt"],
          limit: 5,
          order: [["createdAt", "DESC"]],
        },
      ],
    })

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    })
  }
}

// Get single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params

    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: Order,
          as: "orders",
          attributes: ["id", "orderNumber", "totalAmount", "status", "createdAt"],
          order: [["createdAt", "DESC"]],
        },
      ],
    })

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      })
    }

    res.json({
      success: true,
      data: customer,
    })
  } catch (error) {
    console.error("Error fetching customer:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    })
  }
}

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, gender, addresses, preferences, notes } = req.body

    // Check if customer with email already exists
    const existingCustomer = await Customer.findOne({ where: { email } })
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email already exists",
      })
    }

    // Generate referral code
    const referralCode = `REF${Date.now().toString().slice(-6)}`

    const customer = await Customer.create({
      name,
      email,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
      addresses: addresses ? JSON.parse(addresses) : null,
      preferences: preferences ? JSON.parse(preferences) : null,
      referralCode,
      notes,
    })

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    })
  } catch (error) {
    console.error("Error creating customer:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create customer",
      error: error.message,
    })
  }
}

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    // Handle date fields
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth)
    }

    // Handle JSON fields
    if (updateData.addresses && typeof updateData.addresses === "string") {
      updateData.addresses = JSON.parse(updateData.addresses)
    }
    if (updateData.preferences && typeof updateData.preferences === "string") {
      updateData.preferences = JSON.parse(updateData.preferences)
    }

    const [updatedRowsCount] = await Customer.update(updateData, {
      where: { id },
    })

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      })
    }

    const updatedCustomer = await Customer.findByPk(id)

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
    })
  } catch (error) {
    console.error("Error updating customer:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    })
  }
}

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params

    const customer = await Customer.findByPk(id)
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      })
    }

    // Check if customer has orders
    const orderCount = await Order.count({ where: { customerId: id } })
    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete customer with existing orders",
      })
    }

    await customer.destroy()

    res.json({
      success: true,
      message: "Customer deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting customer:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    })
  }
}

// Get customer statistics
exports.getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.count()
    const activeCustomers = await Customer.count({ where: { status: "Active" } })
    const inactiveCustomers = await Customer.count({ where: { status: "Inactive" } })
    const blockedCustomers = await Customer.count({ where: { status: "Blocked" } })

    // Customer registration trends (last 12 months)
    const monthlyRegistrations = await Customer.findAll({
      attributes: [
        [Customer.sequelize.fn("DATE_FORMAT", Customer.sequelize.col("createdAt"), "%Y-%m"), "month"],
        [Customer.sequelize.fn("COUNT", Customer.sequelize.col("id")), "count"],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 12)),
        },
      },
      group: [Customer.sequelize.fn("DATE_FORMAT", Customer.sequelize.col("createdAt"), "%Y-%m")],
      order: [[Customer.sequelize.fn("DATE_FORMAT", Customer.sequelize.col("createdAt"), "%Y-%m"), "ASC"]],
    })

    // Top customers by spending
    const topCustomers = await Customer.findAll({
      attributes: ["id", "name", "email", "totalSpent", "totalOrders"],
      order: [["totalSpent", "DESC"]],
      limit: 10,
    })

    // Customer demographics
    const genderStats = await Customer.findAll({
      attributes: ["gender", [Customer.sequelize.fn("COUNT", Customer.sequelize.col("id")), "count"]],
      where: {
        gender: {
          [Op.not]: null,
        },
      },
      group: ["gender"],
    })

    res.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          activeCustomers,
          inactiveCustomers,
          blockedCustomers,
        },
        monthlyRegistrations,
        topCustomers,
        genderStats,
      },
    })
  } catch (error) {
    console.error("Error fetching customer stats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer statistics",
      error: error.message,
    })
  }
}

module.exports = exports
