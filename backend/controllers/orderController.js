const Order = require("../models/Order")
const OrderItem = require("../models/OrderItem")
const OrderStatusHistory = require("../models/OrderStatusHistory")
const Product = require("../models/Product")
const User = require("../models/User")
const { Op, sequelize } = require("sequelize")

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `ORD-${timestamp}-${random}`
}

// Helper function to get product price from variants
const getProductPrice = (product, variant = null) => {
  if (!product.variants || !Array.isArray(product.variants)) {
    return 0
  }

  if (variant) {
    // Find matching variant
    const matchingVariant = product.variants.find(
      (v) => v.color === variant.color && v.size === variant.size && v.type === variant.type,
    )
    return matchingVariant ? Number.parseFloat(matchingVariant.price) : Number.parseFloat(product.variants[0].price)
  }

  // Return first variant price as default
  return Number.parseFloat(product.variants[0].price)
}


// Replace the existing getProductImage function with this corrected version:
const getProductImage = (product) => {
  if (!product) return null

  // Handle different image formats from your database
  if (product.images) {
    try {
      let images = product.images

      // If images is a string, try to parse it as JSON
      if (typeof images === "string") {
        // Check if it's a JSON string
        if (images.startsWith("[") || images.startsWith("{")) {
          images = JSON.parse(images)
        } else {
          // It's a single image path - make sure it has the correct uploads path
          return images.startsWith("http") ? images : `/uploads/products/${images}`
        }
      }

      // If images is an array, get the first one
      if (Array.isArray(images) && images.length > 0) {
        const firstImage = images[0]
        if (typeof firstImage === "string") {
          return firstImage.startsWith("http") ? firstImage : `/uploads/products/${firstImage}`
        }
        if (typeof firstImage === "object" && firstImage.url) {
          return firstImage.url.startsWith("http") ? firstImage.url : `/uploads/products/${firstImage.url}`
        }
      }

      // If images is an object with url property
      if (typeof images === "object" && images.url) {
        return images.url.startsWith("http") ? images.url : `/uploads/products/${images.url}`
      }
    } catch (error) {
      console.warn("Error parsing product images:", error.message)
    }
  }

  return null
}

// Update the getOrderItemImage function as well:
const getOrderItemImage = (orderItem) => {
  // First try the stored productImage from order item
  if (orderItem.productImage) {
    if (orderItem.productImage.startsWith("http")) {
      return orderItem.productImage
    }
    return `/uploads/products/${orderItem.productImage}`
  }

  // Then try to get from associated product
  if (orderItem.product) {
    return getProductImage(orderItem.product)
  }

  return null
}

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod = "creditCard",
      specialInstructions,
      subtotal,
      shipping = 0,
      tax = 0,
      discount = 0,
      total,
    } = req.body

    console.log("Creating order for user:", userId)
    console.log("Order items:", JSON.stringify(items, null, 2))

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      })
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      })
    }

    if (!total || total <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order total is required and must be greater than 0",
      })
    }

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order
    const order = await Order.create({
      orderNumber,
      userId,
      status: "pending",
      paymentMethod,
      paymentStatus: "pending",
      subtotal: Number.parseFloat(subtotal) || 0,
      shipping: Number.parseFloat(shipping) || 0,
      tax: Number.parseFloat(tax) || 0,
      discount: Number.parseFloat(discount) || 0,
      total: Number.parseFloat(total),
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      specialInstructions,
      orderDate: new Date(),
    })

    console.log("Order created with ID:", order.id)

    // Create order items
    const orderItems = []
    for (const item of items) {
      let product = null
      let productName = item.productName || item.name || "Unknown Product"
      let productImage = item.productImage || item.image || null
      let unitPrice = Number.parseFloat(item.unitPrice || item.price || 0)

      // Try to get product details if productId is provided
      if (item.productId) {
        try {
          product = await Product.findByPk(item.productId)
          if (product) {
            productName = product.name
            productImage = getProductImage(product)

            // Get price from variant if available
            if (item.variant) {
              unitPrice = getProductPrice(product, item.variant)
            } else {
              unitPrice = getProductPrice(product)
            }
          } else {
            console.warn(`Product ${item.productId} not found, using provided data`)
          }
        } catch (error) {
          console.warn(`Error fetching product ${item.productId}:`, error.message)
        }
      }

      const quantity = Number.parseInt(item.quantity) || 1
      const totalPrice = Number.parseFloat(item.totalPrice) || quantity * unitPrice


      // In the createOrder function, update the orderItem creation part:
      const orderItem = await OrderItem.create({
        orderId: order.id,
        productId: item.productId || null,
        productName,
        productImage: productImage, 
        variant: item.variant || {
          color: item.color || null,
          size: item.size || null,
          type: item.type || null,
          carat: item.carat || null,
        },
        quantity,
        unitPrice,
        totalPrice,
      })

      orderItems.push(orderItem)
      console.log(`Created order item: ${productName} x${quantity}`)
    }

    // Create initial status history
    await OrderStatusHistory.create({
      orderId: order.id,
      status: "pending",
      notes: "Order created",
      changedBy: userId,
      changedAt: new Date(),
    })

    // Fetch the complete order with items and product details
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "images", "variants", "description"],
              required: false,
            },
          ],
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          order: [["changedAt", "DESC"]],
        },
      ],
    })

    console.log("Order creation successful")

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: completeOrder,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    })
  }
}

// Get user orders with pagination
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const status = req.query.status
    const offset = (page - 1) * limit

    console.log(`Fetching orders for user ${userId}, page ${page}, limit ${limit}`)

    // Build where clause
    const whereClause = { userId }
    if (status) {
      whereClause.status = status
    }

    // Get orders with pagination
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "images", "variants", "description"],
              required: false, // LEFT JOIN to handle deleted products
            },
          ],
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          order: [["changedAt", "DESC"]],
          limit: 1, // Only get the latest status
        },
      ],
      order: [["orderDate", "DESC"]],
      limit,
      offset,
    })

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    console.log(`Found ${orders.length} orders out of ${count} total`)

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders: count,
        hasNext,
        hasPrev,
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
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params
    const userId = req.user.id

    console.log(`Fetching order ${orderId} for user ${userId}`)

    const order = await Order.findOne({
      where: {
        id: orderId,
        userId,
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "images", "variants", "description"],
              required: false,
            },
          ],
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          order: [["changedAt", "DESC"]],
        },
      ],
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    console.log("Order found successfully")

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

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params
    const { status, notes } = req.body
    const userId = req.user.id

    console.log(`Updating order ${orderId} status to ${status}`)

    // Validate status
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      })
    }

    // Find order
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId,
      },
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if status change is allowed
    if (order.status === "delivered" && status !== "returned") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of delivered order",
      })
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of cancelled order",
      })
    }

    // Update order status
    await order.update({ status })

    // Create status history entry
    await OrderStatusHistory.create({
      orderId: order.id,
      status,
      notes: notes || `Status changed to ${status}`,
      changedBy: userId,
      changedAt: new Date(),
    })

    // Fetch updated order
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "images", "variants", "description"],
              required: false,
            },
          ],
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          order: [["changedAt", "DESC"]],
        },
      ],
    })

    console.log("Order status updated successfully")

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    })
  }
}

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const userId = req.user.id

    console.log(`Fetching order stats for user ${userId}`)

    const stats = await Order.findAll({
      where: { userId },
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total")), "totalAmount"],
      ],
      group: ["status"],
      raw: true,
    })

    const totalOrders = await Order.count({ where: { userId } })
    const totalSpent = await Order.sum("total", { where: { userId } })

    console.log("Order stats fetched successfully")

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalSpent: totalSpent || 0,
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
