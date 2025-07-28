// Order service for API calls
const API_BASE_URL = "http://localhost:5000/api"

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token")
}

// Update the getAuthHeaders function to match your backend's expected format
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to create order")
      }

      return result
    } catch (error) {
      console.error("Create order error:", error)
      throw error
    }
  },

  // Get user orders
  getUserOrders: async (page = 1, limit = 10, status = null) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (status) {
        params.append("status", status)
      }

      const response = await fetch(`${API_BASE_URL}/orders?${params}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch orders")
      }

      return result
    } catch (error) {
      console.error("Get orders error:", error)
      throw error
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch order")
      }

      return result
    } catch (error) {
      console.error("Get order error:", error)
      throw error
    }
  },

  // Update order status (cancel order)
  updateOrderStatus: async (orderId, status, notes = "") => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, notes }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to update order status")
      }

      return result
    } catch (error) {
      console.error("Update order status error:", error)
      throw error
    }
  },

  // Get order statistics
  getOrderStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/stats`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch order stats")
      }

      return result
    } catch (error) {
      console.error("Get order stats error:", error)
      throw error
    } 
  },
}
 