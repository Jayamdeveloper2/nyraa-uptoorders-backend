// Order status constants
export const ORDER_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
}

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
}

export const ORDER_STATUS_OPTIONS = [
  { value: ORDER_STATUSES.PENDING, label: "Pending", color: "gray" },
  { value: ORDER_STATUSES.CONFIRMED, label: "Confirmed", color: "purple" },
  { value: ORDER_STATUSES.PROCESSING, label: "Processing", color: "yellow" },
  { value: ORDER_STATUSES.SHIPPED, label: "Shipped", color: "blue" },
  { value: ORDER_STATUSES.DELIVERED, label: "Delivered", color: "green" },
  { value: ORDER_STATUSES.CANCELLED, label: "Cancelled", color: "red" },
  { value: ORDER_STATUSES.REFUNDED, label: "Refunded", color: "orange" },
]

export const PAYMENT_STATUS_OPTIONS = [
  { value: PAYMENT_STATUSES.PENDING, label: "Pending", color: "yellow" },
  { value: PAYMENT_STATUSES.PAID, label: "Paid", color: "green" },
  { value: PAYMENT_STATUSES.FAILED, label: "Failed", color: "red" },
  { value: PAYMENT_STATUSES.REFUNDED, label: "Refunded", color: "orange" },
  { value: PAYMENT_STATUSES.PARTIALLY_REFUNDED, label: "Partially Refunded", color: "orange" },
]

export const PAYMENT_METHODS = {
  CREDIT_CARD: "creditCard",
  DEBIT_CARD: "debitCard",
  UPI: "upi",
  NET_BANKING: "netBanking",
  CASH_ON_DELIVERY: "cashOnDelivery",
  WALLET: "wallet",
  BANK_TRANSFER: "bankTransfer",
}

export const PAYMENT_METHOD_OPTIONS = [
  { value: PAYMENT_METHODS.CREDIT_CARD, label: "Credit Card" },
  { value: PAYMENT_METHODS.DEBIT_CARD, label: "Debit Card" },
  { value: PAYMENT_METHODS.UPI, label: "UPI" },
  { value: PAYMENT_METHODS.NET_BANKING, label: "Net Banking" },
  { value: PAYMENT_METHODS.CASH_ON_DELIVERY, label: "Cash on Delivery" },
  { value: PAYMENT_METHODS.WALLET, label: "Wallet" },
  { value: PAYMENT_METHODS.BANK_TRANSFER, label: "Bank Transfer" },
]

// Order status flow
export const ORDER_STATUS_FLOW = {
  [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.CONFIRMED]: [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PROCESSING]: [ORDER_STATUSES.SHIPPED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.SHIPPED]: [ORDER_STATUSES.DELIVERED],
  [ORDER_STATUSES.DELIVERED]: [ORDER_STATUSES.REFUNDED],
  [ORDER_STATUSES.CANCELLED]: [],
  [ORDER_STATUSES.REFUNDED]: [],
}

// Get next possible statuses
export const getNextStatuses = (currentStatus) => {
  return ORDER_STATUS_FLOW[currentStatus] || []
}

// Check if status transition is valid
export const isValidStatusTransition = (fromStatus, toStatus) => {
  const allowedTransitions = ORDER_STATUS_FLOW[fromStatus] || []
  return allowedTransitions.includes(toStatus)
}

// Order priority levels
export const ORDER_PRIORITIES = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
}

export const ORDER_PRIORITY_OPTIONS = [
  { value: ORDER_PRIORITIES.LOW, label: "Low", color: "gray" },
  { value: ORDER_PRIORITIES.NORMAL, label: "Normal", color: "blue" },
  { value: ORDER_PRIORITIES.HIGH, label: "High", color: "orange" },
  { value: ORDER_PRIORITIES.URGENT, label: "Urgent", color: "red" },
]
