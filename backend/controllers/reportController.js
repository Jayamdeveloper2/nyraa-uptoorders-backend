const Order = require("../models/Order")
const OrderItem = require("../models/OrderItem")
const Customer = require("../models/Customer")
const { Op } = require("sequelize")
const sequelize = require("../config/db")

// Get sales report
exports.getSalesReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      period = "daily", // daily, weekly, monthly, yearly
      category,
      product,
    } = req.query

    const dateFilter = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt[Op.gte] = new Date(startDate)
      if (endDate) dateFilter.createdAt[Op.lte] = new Date(endDate)
    }

    // Get date format based on period
    let dateFormat
    switch (period) {
      case "weekly":
        dateFormat = "%Y-%u" // Year-Week
        break
      case "monthly":
        dateFormat = "%Y-%m" // Year-Month
        break
      case "yearly":
        dateFormat = "%Y" // Year
        break
      default:
        dateFormat = "%Y-%m-%d" // Year-Month-Day
    }

    // Base query for sales data
    const salesQuery = {
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("Order.createdAt"), dateFormat), "period"],
        [sequelize.fn("COUNT", sequelize.col("Order.id")), "totalOrders"],
        [sequelize.fn("SUM", sequelize.col("Order.totalAmount")), "totalRevenue"],
        [sequelize.fn("AVG", sequelize.col("Order.totalAmount")), "avgOrderValue"],
        [sequelize.fn("SUM", sequelize.col("items.quantity")), "totalItems"],
      ],
      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: [],
          include:
            category || product
              ? [
                  {
                    model: Product,
                    as: "product",
                    attributes: [],
                    where: {
                      ...(category && { category }),
                      ...(product && { id: product }),
                    },
                  },
                ]
              : [],
        },
      ],
      where: {
        ...dateFilter,
        paymentStatus: "Paid",
      },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("Order.createdAt"), dateFormat)],
      order: [[sequelize.fn("DATE_FORMAT", sequelize.col("Order.createdAt"), dateFormat), "ASC"]],
      raw: true,
    }

    const salesData = await Order.findAll(salesQuery)

    // Get top products
    const topProducts = await OrderItem.findAll({
      attributes: [
        "productId",
        "productName",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
        [sequelize.fn("SUM", sequelize.col("totalPrice")), "totalRevenue"],
      ],
      include: [
        {
          model: Order,
          as: "order",
          attributes: [],
          where: {
            ...dateFilter,
            paymentStatus: "Paid",
          },
        },
      ],
      group: ["productId", "productName"],
      order: [[sequelize.fn("SUM", sequelize.col("totalPrice")), "DESC"]],
      limit: 10,
      raw: true,
    })

    // Get category performance
    const categoryPerformance = await OrderItem.findAll({
      attributes: [
        [sequelize.col("product.category"), "category"],
        [sequelize.fn("SUM", sequelize.col("OrderItem.quantity")), "totalQuantity"],
        [sequelize.fn("SUM", sequelize.col("OrderItem.totalPrice")), "totalRevenue"],
        [sequelize.fn("COUNT", sequelize.fn("DISTINCT", sequelize.col("OrderItem.orderId"))), "totalOrders"],
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: [],
        },
        {
          model: Order,
          as: "order",
          attributes: [],
          where: {
            ...dateFilter,
            paymentStatus: "Paid",
          },
        },
      ],
      group: [sequelize.col("product.category")],
      order: [[sequelize.fn("SUM", sequelize.col("OrderItem.totalRevenue")), "DESC"]],
      raw: true,
    })

    res.json({
      success: true,
      data: {
        salesData,
        topProducts,
        categoryPerformance,
        summary: {
          totalOrders: salesData.reduce((sum, item) => sum + Number.parseInt(item.totalOrders), 0),
          totalRevenue: salesData.reduce((sum, item) => sum + Number.parseFloat(item.totalRevenue || 0), 0),
          avgOrderValue:
            salesData.length > 0
              ? salesData.reduce((sum, item) => sum + Number.parseFloat(item.avgOrderValue || 0), 0) / salesData.length
              : 0,
        },
      },
    })
  } catch (error) {
    console.error("Error generating sales report:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate sales report",
      error: error.message,
    })
  }
}

// Get customer report
exports.getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate, period = "monthly" } = req.query

    const dateFilter = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt[Op.gte] = new Date(startDate)
      if (endDate) dateFilter.createdAt[Op.lte] = new Date(endDate)
    }

    // Customer acquisition trends
    const dateFormat = period === "daily" ? "%Y-%m-%d" : "%Y-%m"

    const customerAcquisition = await Customer.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), dateFormat), "period"],
        [sequelize.fn("COUNT", sequelize.col("id")), "newCustomers"],
      ],
      where: dateFilter,
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), dateFormat)],
      order: [[sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), dateFormat), "ASC"]],
      raw: true,
    })

    // Customer segments by spending
    const customerSegments = await Customer.findAll({
      attributes: [
        [
          sequelize.literal(`
          CASE 
            WHEN totalSpent = 0 THEN 'No Purchase'
            WHEN totalSpent < 1000 THEN 'Low Value'
            WHEN totalSpent < 5000 THEN 'Medium Value'
            WHEN totalSpent < 10000 THEN 'High Value'
            ELSE 'VIP'
          END
        `),
          "segment",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "customerCount"],
        [sequelize.fn("AVG", sequelize.col("totalSpent")), "avgSpending"],
      ],
      group: [
        sequelize.literal(`
        CASE 
          WHEN totalSpent = 0 THEN 'No Purchase'
          WHEN totalSpent < 1000 THEN 'Low Value'
          WHEN totalSpent < 5000 THEN 'Medium Value'
          WHEN totalSpent < 10000 THEN 'High Value'
          ELSE 'VIP'
        END
      `),
      ],
      raw: true,
    })

    // Top customers
    const topCustomers = await Customer.findAll({
      attributes: ["id", "name", "email", "totalSpent", "totalOrders", "lastOrderDate"],
      order: [["totalSpent", "DESC"]],
      limit: 20,
    })

    // Customer retention analysis
    const retentionData = await sequelize.query(
      `
      SELECT 
        DATEDIFF(CURDATE(), MAX(lastOrderDate)) as daysSinceLastOrder,
        COUNT(*) as customerCount
      FROM Customers 
      WHERE lastOrderDate IS NOT NULL
      GROUP BY DATEDIFF(CURDATE(), MAX(lastOrderDate))
      ORDER BY daysSinceLastOrder
    `,
      { type: sequelize.QueryTypes.SELECT },
    )

    res.json({
      success: true,
      data: {
        customerAcquisition,
        customerSegments,
        topCustomers,
        retentionData,
      },
    })
  } catch (error) {
    console.error("Error generating customer report:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate customer report",
      error: error.message,
    }) 
  }
}

// Get product performance report
exports.getProductReport = async (req, res) => {
  try {
    const { startDate, endDate, category, limit = 50 } = req.query

    const dateFilter = {}
    if (startDate || endDate) {
      dateFilter["order.createdAt"] = {}
      if (startDate) dateFilter["order.createdAt"][Op.gte] = new Date(startDate)
      if (endDate) dateFilter["order.createdAt"][Op.lte] = new Date(endDate)
    }

    // Product performance
    const productPerformance = await OrderItem.findAll({
      attributes: [
        "productId",
        "productName",
        [sequelize.col("product.category"), "category"],
        [sequelize.col("product.price"), "currentPrice"],
        [sequelize.fn("SUM", sequelize.col("OrderItem.quantity")), "totalSold"],
        [sequelize.fn("SUM", sequelize.col("OrderItem.totalPrice")), "totalRevenue"],
        [sequelize.fn("COUNT", sequelize.fn("DISTINCT", sequelize.col("OrderItem.orderId"))), "totalOrders"],
        [sequelize.fn("AVG", sequelize.col("OrderItem.unitPrice")), "avgSellingPrice"],
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: [],
          where: category ? { category } : {},
        },
        {
          model: Order,
          as: "order",
          attributes: [],
          where: {
            paymentStatus: "Paid",
            ...(startDate || endDate
              ? {
                  createdAt: {
                    ...(startDate && { [Op.gte]: new Date(startDate) }),
                    ...(endDate && { [Op.lte]: new Date(endDate) }),
                  },
                }
              : {}),
          },
        },
      ],
      group: ["productId", "productName"],
      order: [[sequelize.fn("SUM", sequelize.col("OrderItem.totalPrice")), "DESC"]],
      limit: Number.parseInt(limit),
      raw: true,
    })

    // Low stock products
    const lowStockProducts = await Product.findAll({
      attributes: ["id", "name", "stockQuantity", "category"],
      where: {
        stockQuantity: { [Op.lt]: 10 },
        status: "Active",
      },
      order: [["stockQuantity", "ASC"]],
      limit: 20,
    })

    // Products with no sales
    const noSalesProducts = await Product.findAll({
      attributes: ["id", "name",  "price", "category", "createdAt"],
      where: {
        id: {
          [Op.notIn]: sequelize.literal(`(
            SELECT DISTINCT productId 
            FROM OrderItems 
            INNER JOIN Orders ON OrderItems.orderId = Orders.id 
            WHERE Orders.paymentStatus = 'Paid'
            ${startDate ? `AND Orders.createdAt >= '${startDate}'` : ""}
            ${endDate ? `AND Orders.createdAt <= '${endDate}'` : ""}
          )`),
        },
        status: "Active",
      },
      order: [["createdAt", "DESC"]],
      limit: 20,
    })

    res.json({
      success: true,
      data: {
        productPerformance,
        lowStockProducts,
        noSalesProducts,
      },
    })
  } catch (error) {
    console.error("Error generating product report:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate product report",
      error: error.message,
    })
  }
}

// Get inventory report
exports.getInventoryReport = async (req, res) => {
  try {
    const { category, lowStockThreshold = 10 } = req.query

    const where = {}
    if (category) where.category = category

    // Inventory summary
    const inventorySummary = await Product.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("id")), "totalProducts"],
        [sequelize.fn("SUM", sequelize.col("stockQuantity")), "totalStock"],
        [sequelize.fn("AVG", sequelize.col("stockQuantity")), "avgStock"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN stockQuantity < " + lowStockThreshold + " THEN 1 ELSE 0 END"),
          ),
          "lowStockCount",
        ],
        [sequelize.fn("SUM", sequelize.literal("CASE WHEN stockQuantity = 0 THEN 1 ELSE 0 END")), "outOfStockCount"],
      ],
      where,
      group: ["category"],
      order: [["category", "ASC"]],
      raw: true,
    })

    // Stock alerts
    const stockAlerts = await Product.findAll({
      attributes: ["id", "name",  "category", "stockQuantity", "availability"],
      where: {
        ...where,
        [Op.or]: [{ stockQuantity: { [Op.lt]: lowStockThreshold } }, { availability: "Out of Stock" }],
      },
      order: [["stockQuantity", "ASC"]],
    })

    // Stock value by category
    const stockValue = await Product.findAll({
      attributes: [
        "category",
        [sequelize.fn("SUM", sequelize.literal("stockQuantity * price")), "totalValue"],
        [sequelize.fn("COUNT", sequelize.col("id")), "productCount"],
      ],
      where,
      group: ["category"],
      order: [[sequelize.fn("SUM", sequelize.literal("stockQuantity * price")), "DESC"]],
      raw: true,
    })

    res.json({
      success: true,
      data: {
        inventorySummary,
        stockAlerts,
        stockValue,
      },
    })
  } catch (error) {
    console.error("Error generating inventory report:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate inventory report",
      error: error.message,
    })
  }
}

// Get financial report
exports.getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate, period = "monthly" } = req.query

    const dateFilter = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt[Op.gte] = new Date(startDate)
      if (endDate) dateFilter.createdAt[Op.lte] = new Date(endDate)
    }

    const dateFormat = period === "daily" ? "%Y-%m-%d" : "%Y-%m"

    // Revenue breakdown
    const revenueBreakdown = await Order.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), dateFormat), "period"],
        [sequelize.fn("SUM", sequelize.col("subtotal")), "subtotal"],
        [sequelize.fn("SUM", sequelize.col("taxAmount")), "taxAmount"],
        [sequelize.fn("SUM", sequelize.col("shippingAmount")), "shippingAmount"],
        [sequelize.fn("SUM", sequelize.col("discountAmount")), "discountAmount"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalAmount"],
        [sequelize.fn("COUNT", sequelize.col("id")), "orderCount"],
      ],
      where: {
        ...dateFilter,
        paymentStatus: "Paid",
      },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), dateFormat)],
      order: [[sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), dateFormat), "ASC"]],
      raw: true,
    })

    // Payment method breakdown
    const paymentMethodBreakdown = await Order.findAll({
      attributes: [
        "paymentMethod",
        [sequelize.fn("COUNT", sequelize.col("id")), "orderCount"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalAmount"],
      ],
      where: {
        ...dateFilter,
        paymentStatus: "Paid",
      },
      group: ["paymentMethod"],
      order: [[sequelize.fn("SUM", sequelize.col("totalAmount")), "DESC"]],
      raw: true,
    })

    // Refund analysis
    const refundAnalysis = await Order.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), dateFormat), "period"],
        [sequelize.fn("COUNT", sequelize.col("id")), "refundCount"],
        [sequelize.fn("SUM", sequelize.col("refundAmount")), "totalRefunded"],
      ],
      where: {
        ...dateFilter,
        status: "Refunded",
      },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), dateFormat)],
      order: [[sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), dateFormat), "ASC"]],
      raw: true,
    })

    res.json({
      success: true,
      data: {
        revenueBreakdown,
        paymentMethodBreakdown,
        refundAnalysis,
      },
    })
  } catch (error) {
    console.error("Error generating financial report:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate financial report",
      error: error.message,
    })
  }
}

module.exports = exports
