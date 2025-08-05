// Date formatting utilities
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "N/A"

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  return new Date(dateString).toLocaleDateString("en-US", { ...defaultOptions, ...options })
}

export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A"

  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatTimeAgo = (dateString) => {
  if (!dateString) return "N/A"

  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return formatDate(dateString)
}

// Currency formatting utilities
export const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(amount || 0)
}

export const formatNumber = (number) => {
  return new Intl.NumberFormat("en-IN").format(number || 0)
}

// Order status utilities
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-800"
    case "shipped":
      return "bg-blue-100 text-blue-800"
    case "processing":
      return "bg-yellow-100 text-yellow-800"
    case "confirmed":
      return "bg-purple-100 text-purple-800"
    case "pending":
      return "bg-gray-100 text-gray-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "refunded":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

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
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Address formatting
export const formatAddress = (address) => {
  if (!address) return "N/A"

  if (typeof address === "string") {
    try {
      address = JSON.parse(address)
    } catch {
      return address
    }
  }

  if (typeof address === "object") {
    const parts = [
      address.name,
      address.street,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.zip}`,
      address.country,
    ].filter(Boolean)

    return parts.join("\n")
  }

  return "N/A"
}

// Phone number formatting
export const formatPhoneNumber = (phone) => {
  if (!phone) return "N/A"

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "")

  // Format Indian phone numbers
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }

  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
  }

  return phone
}

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Percentage formatting
export const formatPercentage = (value, total) => {
  if (!total || total === 0) return "0%"
  return `${Math.round((value / total) * 100)}%`
}
