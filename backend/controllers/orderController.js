const Order = require("../models/Order")
const OrderItem = require("../models/OrderItem")
const OrderStatusHistory = require("../models/OrderStatusHistory")
const Product = require("../models/Product")
const User = require("../models/User")
const Address = require("../models/Address")
const { Op } = require("sequelize")
const sequelize = require("../config/db")

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `NYR-${timestamp.slice(-6)}${random}`
}

// Create new order
const createOrder = async (req, res) => {
  console.log("=== CREATE ORDER DEBUG ===")
  console.log("Request user:", req.user)
  console.log("Request userType:", req.userType)
  console.log("Request body keys:", Object.keys(req.body))
  console.log("Items count:", req.body.items?.length)
  console.log("========================")

  // Comprehensive authentication check
  if (!req.user) {
    console.error("❌ No user found in request")
    return res.status(401).json({
      success: false,
      message: "Authentication failed - no user found in request",
    })
  }

  if (!req.user.id) {
    console.error("❌ User object exists but has no id:", req.user)
    return res.status(401).json({
      success: false,
      message: "Authentication failed - user ID missing",
    })
  }

  console.log("✅ User authenticated:", req.user.id)

  const transaction = await sequelize.transaction()

  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod = "creditCard",
      specialInstructions,
      couponCode,
      subtotal,
      shipping = 10.0,
      tax,
      discount = 0.0,
      total,
    } = req.body

    // Get user ID from authenticated user
    const userId = req.user.id

    console.log("Creating order for user ID:", userId)

    // Only regular users can create orders (not admins)
    if (req.userType === "admin") {
      await transaction.rollback()
      return res.status(403).json({
        success: false,
        message: "Admins cannot create orders. Please use a regular user account.",
      })
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      })
    }

    if (!shippingAddress) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      })
    }

    console.log("✅ Validation passed, processing", items.length, "items")

    // Validate products exist
    const productIds = items.map((item) => item.id || item.productId)
    console.log("Looking for products with IDs:", productIds)

    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds } },
      transaction,
    })

    console.log("Found", products.length, "products in database")

    if (products.length !== productIds.length) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Some products are not available. Found ${products.length} out of ${productIds.length} products.`,
      })
    }

    // Generate order number
    let orderNumber
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      orderNumber = generateOrderNumber()
      const existingOrder = await Order.findOne({
        where: { orderNumber },
        transaction,
      })
      if (!existingOrder) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      await transaction.rollback()
      return res.status(500).json({
        success: false,
        message: "Failed to generate unique order number",
      })
    }

    console.log("✅ Generated order number:", orderNumber)

    // Calculate totals
    const calculatedSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const calculatedTax = calculatedSubtotal * 0.08 // 8% tax
    const calculatedTotal = calculatedSubtotal + shipping + calculatedTax - discount

    console.log("💰 Order totals:", {
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      shipping,
      discount,
      total: calculatedTotal,
    })

    // Create order
    const orderData = {
      orderNumber,
      userId,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod,
      subtotal: calculatedSubtotal,
      shipping,
      tax: calculatedTax,
      discount,
      total: calculatedTotal,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      specialInstructions,
      couponCode,
    }

    console.log("Creating order with data:", orderData)

    const order = await Order.create(orderData, { transaction })

    console.log("✅ Order created with ID:", order.id)

    // Create order items
    const orderItems = []
    for (const item of items) {
      const product = products.find((p) => p.id === (item.id || item.productId))

      if (!product) {
        console.error("❌ Product not found for item:", item)
        continue
      }

      const orderItemData = {
        orderId: order.id,
        productId: product.id,
        productName: item.name || product.name,
        productImage: item.image || (Array.isArray(product.images) ? product.images[0] : null),
        variant: {
          color: item.color || null,
          size: item.size || null,
          carat: item.carat || null,
        },
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      }

      console.log("Creating order item:", orderItemData)

      const orderItem = await OrderItem.create(orderItemData, { transaction })
      orderItems.push(orderItem)
    }

    console.log("✅ Created", orderItems.length, "order items")

    // Create initial status history
    await OrderStatusHistory.create(
      {
        orderId: order.id,
        status: "pending",
        comment: "Order created",
        changedBy: "system",
      },
      { transaction },
    )

    console.log("✅ Created status history")

    // Update user's order statistics if the fields exist
    try {
      await User.increment(
        {
          totalOrders: 1,
          totalSpent: calculatedTotal,
        },
        {
          where: { id: userId },
          transaction,
        },
      )
      console.log("✅ Updated user statistics")
    } catch (incrementError) {
      console.log("⚠️ Could not update user statistics:", incrementError.message)
      // Continue without failing the order creation
    }

    await transaction.commit()
    console.log("✅ Transaction committed successfully")

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "images", "slug"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    })

    console.log("✅ Order creation completed successfully")

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: completeOrder,
    })
  } catch (error) {
    await transaction.rollback()
    console.error("❌ Error creating order:", error)
    console.error("Error stack:", error.stack)
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    })
  }
}

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    let userId

    // If admin, they can specify userId in query, otherwise use their own ID
    if (req.userType === "admin") {
      userId = req.query.userId || req.user.id
    } else {
      userId = req.user.id
    }

    console.log("Fetching orders for user ID:", userId)

    const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const where = { userId }

    if (status) {
      where.status = status
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "images", "slug"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number.parseInt(limit),
      offset,
    })

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(count / Number.parseInt(limit)),
          totalItems: count,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching user orders:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    })
  }
}

// Get single order
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params
    const where = { id }

    // If not admin, restrict to user's own orders
    if (req.userType !== "admin") {
      where.userId = req.user.id
    }

    const order = await Order.findOne({
      where,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "images", "slug"],
            },
          ],
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          order: [["createdAt", "ASC"]],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    res.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    })
  }
}

// Update order status
const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params
    const { status, comment, trackingNumber } = req.body
    const changedBy = req.user?.name || req.body.changedBy || "admin"

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      })
    }

    const order = await Order.findByPk(id, { transaction })

    if (!order) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Update order
    const updateData = { status }

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber
    }

    if (status === "delivered") {
      updateData.deliveredAt = new Date()
    } else if (status === "cancelled") {
      updateData.cancelledAt = new Date()
    } else if (status === "refunded") {
      updateData.refundedAt = new Date()
      updateData.paymentStatus = "refunded"
    }

    await order.update(updateData, { transaction })

    // Create status history entry
    await OrderStatusHistory.create(
      {
        orderId: order.id,
        status,
        comment: comment || `Order status changed to ${status}`,
        changedBy,
      },
      { transaction },
    )

    await transaction.commit()

    // Fetch updated order
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          order: [["createdAt", "ASC"]],
        },
      ],
    })

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Error updating order status:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    })
  }
}

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.count()
    const pendingOrders = await Order.count({ where: { status: "pending" } })
    const processingOrders = await Order.count({ where: { status: "processing" } })
    const shippedOrders = await Order.count({ where: { status: "shipped" } })
    const deliveredOrders = await Order.count({ where: { status: "delivered" } })
    const cancelledOrders = await Order.count({ where: { status: "cancelled" } })

    const totalRevenue = await Order.sum("total", {
      where: { status: { [Op.in]: ["delivered", "shipped", "processing"] } },
    })

    const recentOrders = await Order.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    })

    const ordersByStatus = await Order.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total")), "revenue"],
      ],
      group: ["status"],
    })

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          pendingOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue: totalRevenue || 0,
        },
        recentOrders,
        ordersByStatus,
      },
    })
  } catch (error) {
    console.error("Error fetching order stats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics",
      error: error.message,
    })
  }
}

// Cancel order
const cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params
    const { reason } = req.body
    const where = { id }

    // If not admin, restrict to user's own orders
    if (req.userType !== "admin") {
      where.userId = req.user.id
    }

    const order = await Order.findOne({ where, transaction })

    if (!order) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      })
    }

    await order.update(
      {
        status: "cancelled",
        cancelledAt: new Date(),
      },
      { transaction },
    )

    await OrderStatusHistory.create(
      {
        orderId: order.id,
        status: "cancelled",
        comment: reason || "Order cancelled by customer",
        changedBy: req.user.name || req.user.email || "user",
      },
      { transaction },
    )

    await transaction.commit()

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Error cancelling order:", error)
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    })
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  cancelOrder,
}
