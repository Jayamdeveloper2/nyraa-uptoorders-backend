const API_BASE_URL = "http://localhost:5000/api"

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token")
}

// Create headers with auth token
const getHeaders = () => {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(),
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Order API functions
export const orderAPI = {
  // Get all orders (admin)
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/orders?${queryString}` : "/orders"
    return apiRequest(endpoint)
  },

  // Get single order
  getOrder: async (orderId) => {
    return apiRequest(`/orders/${orderId}`)
  },

  // Update order status (admin)
  updateOrderStatus: async (orderId, statusData) => {
    return apiRequest(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify(statusData),
    })
  },

  // Get order statistics (admin)
  getOrderStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/orders/admin/stats?${queryString}` : "/orders/admin/stats"
    return apiRequest(endpoint)
  },

  // Create new order
  createOrder: async (orderData) => {
    return apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    return apiRequest(`/orders/${orderId}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    })
  },

  // Get user's orders
  getUserOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/orders/user?${queryString}` : "/orders/user"
    return apiRequest(endpoint)
  },
}

// Auth API functions - FIXED VERSION
export const authAPI = {
  adminLogin: async (credentials) => {
    return apiRequest("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  userLogin: async (credentials) => {
    return apiRequest("/auth/user/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  sendOTP: async (email) => {
    return apiRequest("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  verifyOTP: async (email, otp) => {
    return apiRequest("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    })
  },

  googleLogin: async (token) => {
    return apiRequest("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  },

  // FIXED: Get Profile function
  getProfile: async () => {
    try {
      console.log("Fetching profile with token:", getAuthToken())
      const response = await apiRequest("/auth/profile")
      console.log("Profile response:", response)
      return response
    } catch (error) {
      console.error("Error fetching profile:", error)
      throw error
    }
  },

  updateProfile: async (profileData) => {
    return apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  },

  changePassword: async (passwordData) => {
    return apiRequest("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    })
  },

  uploadAvatar: async (formData) => {
    const token = getAuthToken()
    return fetch(`${API_BASE_URL}/auth/upload-avatar`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }
      return data
    })
  },

  logout: async () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    return { success: true, message: "Logged out successfully" }
  },
}

// Product API functions
export const productAPI = {
  getAllProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/products?${queryString}` : "/products"
    return apiRequest(endpoint)
  },

  getProduct: async (id) => {
    return apiRequest(`/products/${id}`)
  },

  createProduct: async (productData) => {
    return apiRequest("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  },

  updateProduct: async (id, productData) => {
    return apiRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
  },

  deleteProduct: async (id) => {
    return apiRequest(`/products/${id}`, {
      method: "DELETE",
    })
  },
}

// Category API functions
export const categoryAPI = {
  getAllCategories: async () => {
    return apiRequest("/categories")
  },

  getCategory: async (id) => {
    return apiRequest(`/categories/${id}`)
  },

  createCategory: async (categoryData) => {
    return apiRequest("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    })
  },

  updateCategory: async (id, categoryData) => {
    return apiRequest(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    })
  },

  deleteCategory: async (id) => {
    return apiRequest(`/categories/${id}`, {
      method: "DELETE",
    })
  },
}

export default apiRequest
