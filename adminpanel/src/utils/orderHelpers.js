import { ORDER_STATUSES, PAYMENT_STATUSES } from "../constants/orderStatus"

// Helper functions for order management

export const transformOrderData = (order) => {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customer: order.user?.name || "N/A",
    email: order.user?.email || "N/A",
    phone: order.user?.phone || "N/A",
    products: order.items || [],
    date: order.orderDate
      ? new Date(order.orderDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    status: order.status,
    total: Number.parseFloat(order.total) || 0,
    paymentStatus: order.paymentStatus === "paid" ? "Paid" : "Pending",
    paymentMethod: order.paymentMethod || "N/A",
    shippingAddress:
      typeof order.shippingAddress === "string" ? JSON.parse(order.shippingAddress) : order.shippingAddress,
    trackingNumber: order.trackingNumber || "",
    subtotal: Number.parseFloat(order.subtotal) || 0,
    shipping: Number.parseFloat(order.shipping) || 0,
    tax: Number.parseFloat(order.tax) || 0,
    discount: Number.parseFloat(order.discount) || 0,
    specialInstructions: order.specialInstructions || "",
    items: order.items || [],
    statusHistory: order.statusHistory || [],
    user: order.user || {},
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    deliveryDate: order.deliveryDate,
    couponCode: order.couponCode,
  }
}

export const getOrderStatusOptions = () => [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
]

export const getPaymentStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "failed":
      return "bg-red-100 text-red-800"
    case "refunded":
      return "bg-orange-100 text-orange-800"
    case "partially_refunded":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const formatOrderDate = (dateString) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const formatOrderCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0)
}

// Calculate order statistics
export const calculateOrderStats = (orders) => {
  const stats = {
    totalOrders: orders.length,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
    paidOrders: 0,
    pendingPayments: 0,
    averageOrderValue: 0,
  }

  orders.forEach((order) => {
    stats.totalRevenue += order.total || 0

    // Count by status
    switch (order.status?.toLowerCase()) {
      case ORDER_STATUSES.PENDING:
        stats.pendingOrders++
        break
      case ORDER_STATUSES.CONFIRMED:
        stats.confirmedOrders++
        break
      case ORDER_STATUSES.PROCESSING:
        stats.processingOrders++
        break
      case ORDER_STATUSES.SHIPPED:
        stats.shippedOrders++
        break
      case ORDER_STATUSES.DELIVERED:
        stats.deliveredOrders++
        break
      case ORDER_STATUSES.CANCELLED:
        stats.cancelledOrders++
        break
      case ORDER_STATUSES.REFUNDED:
        stats.refundedOrders++
        break
    }

    // Count by payment status
    if (order.paymentStatus?.toLowerCase() === PAYMENT_STATUSES.PAID) {
      stats.paidOrders++
    } else {
      stats.pendingPayments++
    }
  })

  // Calculate average order value
  stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0

  return stats
}

// Filter orders by date range
export const filterOrdersByDateRange = (orders, dateRange) => {
  if (!dateRange || dateRange === "all") return orders

  const now = new Date()
  const startDate = new Date()

  switch (dateRange) {
    case "today":
      startDate.setHours(0, 0, 0, 0)
      break
    case "week":
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate.setMonth(now.getMonth() - 1)
      break
    case "quarter":
      startDate.setMonth(now.getMonth() - 3)
      break
    case "year":
      startDate.setFullYear(now.getFullYear() - 1)
      break
    default:
      return orders
  }

  return orders.filter((order) => {
    const orderDate = new Date(order.date || order.orderDate)
    return orderDate >= startDate && orderDate <= now
  })
}

// Search orders by query
export const searchOrders = (orders, query) => {
  if (!query) return orders

  const searchLower = query.toLowerCase()
  return orders.filter((order) => {
    return (
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.customer?.toLowerCase().includes(searchLower) ||
      order.email?.toLowerCase().includes(searchLower) ||
      order.phone?.toLowerCase().includes(searchLower) ||
      order.status?.toLowerCase().includes(searchLower) ||
      order.paymentMethod?.toLowerCase().includes(searchLower)
    )
  })
}

// Generate order export data
export const generateOrderExportData = (orders) => {
  return orders.map((order) => ({
    "Order Number": order.orderNumber,
    "Customer Name": order.customer,
    Email: order.email,
    Phone: order.phone,
    "Order Date": formatOrderDate(order.date),
    Status: order.status,
    "Payment Status": order.paymentStatus,
    "Payment Method": order.paymentMethod,
    "Items Count": order.items?.length || 0,
    Subtotal: order.subtotal,
    Shipping: order.shipping,
    Tax: order.tax,
    Discount: order.discount,
    Total: order.total,
    "Tracking Number": order.trackingNumber || "",
    "Special Instructions": order.specialInstructions || "",
  }))
}

// Validate order data
export const validateOrderData = (orderData) => {
  const errors = []

  if (!orderData.items || orderData.items.length === 0) {
    errors.push("Order must have at least one item")
  }

  if (!orderData.shippingAddress) {
    errors.push("Shipping address is required")
  }

  if (!orderData.paymentMethod) {
    errors.push("Payment method is required")
  }

  if (!orderData.total || orderData.total <= 0) {
    errors.push("Order total must be greater than 0")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Calculate order totals
export const calculateOrderTotals = (items, shipping = 0, tax = 0, discount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)

  const total = subtotal + shipping + tax - discount

  return {
    subtotal,
    shipping,
    tax,
    discount,
    total: Math.max(0, total), // Ensure total is not negative
  }
}
