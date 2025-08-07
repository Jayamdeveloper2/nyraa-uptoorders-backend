const Order = require("../models/Order")
const OrderItem = require("../models/OrderItem")
const OrderStatusHistory = require("../models/OrderStatusHistory")
const Product = require("../models/Product")
const User = require("../models/User")
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

// Helper function to normalize address format - FIXED for your case
const normalizeAddress = (address) => {
  if (!address) {
    throw new Error('Shipping address is required');
  }

  let addressObj = address;
  
  // If it's a string, try to parse it
  if (typeof address === 'string') {
    try {
      addressObj = JSON.parse(address);
    } catch (error) {
      throw new Error('Invalid address format');
    }
  }

  // If it's an Address model instance (with id, createdAt, etc.), extract only shipping fields
  if (addressObj && typeof addressObj === 'object') {
    // Validate required fields
    const required = ['name', 'street', 'city', 'state', 'zip', 'phone'];
    for (const field of required) {
      if (!addressObj[field] || addressObj[field].toString().trim() === '') {
        throw new Error(`Address field '${field}' is required`);
      }
    }

    // Return only the shipping-relevant fields (exclude id, userId, createdAt, updatedAt)
    return {
      name: addressObj.name.toString().trim(),
      street: addressObj.street.toString().trim(),
      city: addressObj.city.toString().trim(),
      state: addressObj.state.toString().trim(),
      zip: addressObj.zip.toString().trim(),
      country: addressObj.country || 'India',
      phone: addressObj.phone.toString().trim(),
      type: addressObj.type || 'home'
    };
  }

  throw new Error('Invalid address format');
}

// Create new order
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const userId = req.user.id
    const {
      items,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      paymentMethod,
      shippingAddress,
      specialInstructions,
      couponCode,
    } = req.body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      })
    }

    // Normalize and validate shipping address
    let normalizedAddress;
    try {
      normalizedAddress = normalizeAddress(shippingAddress);
      console.log('Normalized address:', normalizedAddress); // Debug log
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Validate products exist and have sufficient stock
    const productIds = items.map((item) => item.id)
    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds } },
    })

    // Create a map for easier lookup
    const productMap = new Map(products.map((p) => [p.id, p]))

    // Check which products are missing
    const missingProducts = []
    const stockIssues = []

    for (const item of items) {
      const product = productMap.get(item.id)

      if (!product) {
        missingProducts.push({
          id: item.id,
          name: item.name || `Product ${item.id}`,
        })
        continue
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        stockIssues.push({
          id: item.id,
          name: product.name,
          available: product.stock,
          requested: item.quantity,
        })
      }
    }

    // Handle missing products
    if (missingProducts.length > 0) {
      console.warn(`Products not found in database:`, missingProducts)
      console.log(`Proceeding with order despite missing products: ${missingProducts.map((p) => p.id).join(", ")}`)
    }

    // Handle stock issues
    if (stockIssues.length > 0) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for some items",
        stockIssues,
      })
    }

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order with normalized address - STORE AS JSON OBJECT, NOT STRING
    const order = await Order.create(
      {
        orderNumber,
        userId,
        status: "pending",
        subtotal: Number.parseFloat(subtotal) || 0,
        shipping: Number.parseFloat(shipping) || 0,
        tax: Number.parseFloat(tax) || 0,
        discount: Number.parseFloat(discount) || 0,
        total: Number.parseFloat(total) || 0,
        paymentMethod: paymentMethod || "creditCard",
        paymentStatus: "pending",
        shippingAddress: normalizedAddress, // This will be stored as JSON object
        specialInstructions,
        couponCode,
        orderDate: new Date(),
      },
      { transaction },
    )

    console.log('Order created with address:', order.shippingAddress); // Debug log

    // Create order items and update product stock
    const orderItems = []
    for (const item of items) {
      const product = productMap.get(item.id)

      const orderItem = await OrderItem.create(
        {
          orderId: order.id,
          productId: item.id,
          productName: item.name,
          productImage: item.image,
          quantity: item.quantity,
          price: Number.parseFloat(item.price),
          originalPrice: Number.parseFloat(item.originalPrice) || Number.parseFloat(item.price),
          variant: JSON.stringify({
            color: item.color || null,
            size: item.size || null,
            carat: item.carat || null,
          }),
        },
        { transaction },
      )

      orderItems.push(orderItem)

      // Update product stock only if product exists
      if (product) {
        await product.update(
          {
            stock: Math.max(0, product.stock - item.quantity),
            salesCount: (product.salesCount || 0) + item.quantity,
          },
          { transaction },
        )
      }
    }

    // Create initial status history
    await OrderStatusHistory.create(
      {
        orderId: order.id,
        status: "pending",
        comment: "Order created",
        changedBy: "system",
        changedAt: new Date(),
      },
      { transaction },
    )

    // Update user statistics
    await User.update(
      {
        totalOrders: sequelize.literal("totalOrders + 1"),
        totalSpent: sequelize.literal(`totalSpent + ${Number.parseFloat(total)}`),
        lastOrderDate: new Date(),
      },
      {
        where: { id: userId },
        transaction,
      },
    )

    await transaction.commit()

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    })

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: completeOrder,
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Error creating order:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    })
  }
}

// Get user orders (Updated to support admin access)
exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query

    // Build where clause based on user type
    const whereClause = {}

    // If it's a regular user, only show their orders
    if (req.userType === "user") {
      whereClause.userId = req.user.id
    }

    // Add status filter if provided
    if (status && status !== "all") {
      whereClause.status = status
    }

    // Add date filter if provided
    if (startDate && endDate) {
      whereClause.orderDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    }

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "slug", "images"],
              required: false, // LEFT JOIN to handle missing products
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
          required: true,
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          order: [["changedAt", "ASC"]],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number.parseInt(limit),
      offset: (Number.parseInt(page) - 1) * Number.parseInt(limit),
    })

    res.json({
      success: true,
      orders: orders.rows,
      pagination: {
        total: orders.count,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        totalPages: Math.ceil(orders.count / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    })
  }
}

// Get single order (Updated to support admin access)
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params

    // Build where clause based on user type
    const whereClause = { id }

    // If it's a regular user, only allow access to their own orders
    if (req.userType === "user") {
      whereClause.userId = req.user.id
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "slug", "images"],
              required: false, // LEFT JOIN to handle missing products
            },
          ],
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          order: [["changedAt", "ASC"]],
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

    console.log('Retrieved order address:', order.shippingAddress); // Debug log

    res.json({
      success: true,
      order,
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

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params
    const { status, comment, trackingNumber } = req.body
    const changedBy = req.userType === "admin" ? req.user.username || req.user.name : req.user.email

    const order = await Order.findByPk(id)
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
      updateData.deliveryDate = new Date()
    }

    await order.update(updateData, { transaction })

    // Create status history entry
    await OrderStatusHistory.create(
      {
        orderId: order.id,
        status,
        comment: comment || `Status updated to ${status}`,
        changedBy,
        changedAt: new Date(),
      },
      { transaction },
    )

    await transaction.commit()

    // Fetch updated order with all relations
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          order: [["changedAt", "ASC"]],
        },
      ],
    })

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
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

// Get order statistics (Admin only)
exports.getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        orderDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      }
    }

    const stats = await Order.findAll({
      where: dateFilter,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total")), "totalAmount"],
      ],
      group: ["status"],
    })

    const totalOrders = await Order.count({ where: dateFilter })
    const totalRevenue = await Order.sum("total", { where: dateFilter })

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue || 0,
        statusBreakdown: stats,
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

module.exports = exports
