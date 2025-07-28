// Order service for API calls with proper authentication
const API_BASE_URL = "http://localhost:5000/api"

// Get auth token from localStorage
const getAuthToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken")
  )
}

// Get user data from localStorage
const getUserData = () => {
  try {
    const userData = localStorage.getItem("user") || localStorage.getItem("userData")
    return userData ? JSON.parse(userData) : {}
  } catch (error) {
    console.error("Error parsing user data:", error)
    return {}
  }
}

// Get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken()
  console.log("Auth token found:", token ? "Yes" : "No")

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

// Test server connection
const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`)
    }

    const result = await response.json()
    console.log("Server connection test:", result)
    return result
  } catch (error) {
    console.error("Server connection failed:", error)
    throw new Error("Cannot connect to server. Please ensure the backend is running on http://localhost:5000")
  }
}

// Test authentication by making a simple authenticated request
const testAuth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed")
      }
      throw new Error(`Auth test failed with status: ${response.status}`)
    }

    const result = await response.json()
    console.log("Authentication test successful:", result)
    return result
  } catch (error) {
    console.error("Authentication test failed:", error)
    throw error
  }
}

// Check if user is authenticated
const isAuthenticated = () => {
  const token = getAuthToken()
  const userData = getUserData()
  return !!(token && userData.email)
}

export const orderService = {
  // Test server connection
  testConnection,

  // Test authentication
  testAuth,

  // Check authentication
  isAuthenticated,

  // Get user data
  getUserData,

  // Create new order
  createOrder: async (orderData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("Please log in to place an order")
      }

      console.log("Creating order with data:", JSON.stringify(orderData, null, 2))
      console.log("Auth headers:", getAuthHeaders())

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)

        let errorMessage = "Failed to create order"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }

        if (response.status === 401) {
          throw new Error("Authentication required. Please log in again.")
        }

        throw new Error(`Server Error (${response.status}): ${errorMessage}`)
      }

      const result = await response.json()
      console.log("Order creation successful:", result)
      return result
    } catch (error) {
      console.error("Create order error:", error)

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to server. Please ensure the backend server is running on http://localhost:5000",
        )
      }

      throw error
    }
  },

  // Get user orders
  getUserOrders: async (page = 1, limit = 10, status = null) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("Please log in to view orders")
      }

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

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to fetch orders"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }

        if (response.status === 401) {
          throw new Error("Authentication required. Please log in again.")
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Get orders error:", error)

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please ensure the backend server is running.")
      }

      throw error
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("Please log in to view order details")
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to fetch order"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }

        if (response.status === 401) {
          throw new Error("Authentication required. Please log in again.")
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Get order error:", error)

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please ensure the backend server is running.")
      }

      throw error
    }
  },

  // Update order status (cancel order)
  updateOrderStatus: async (orderId, status, notes = "") => {
    try {
      if (!isAuthenticated()) {
        throw new Error("Please log in to update order")
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, notes }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to update order status"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }

        if (response.status === 401) {
          throw new Error("Authentication required. Please log in again.")
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Update order status error:", error)

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please ensure the backend server is running.")
      }

      throw error
    }
  },

  // Get order statistics
  getOrderStats: async () => {
    try {
      if (!isAuthenticated()) {
        throw new Error("Please log in to view order statistics")
      }

      const response = await fetch(`${API_BASE_URL}/orders/stats`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to fetch order stats"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }

        if (response.status === 401) {
          throw new Error("Authentication required. Please log in again.")
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Get order stats error:", error)

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please ensure the backend server is running.")
      }

      throw error
    }
  },
}
