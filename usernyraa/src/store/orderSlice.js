import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"

// Async thunks for API calls
export const createOrder = createAsyncThunk("orders/createOrder", async (orderData, { rejectWithValue }) => {
  try {
    console.log("Sending order data to API:", orderData)

    // Get JWT token from localStorage with better error handling
    const token = localStorage.getItem("token") || localStorage.getItem("authToken")

    console.log("Token found:", token ? "Yes" : "No")
    if (token) {
      console.log("Token preview:", token.substring(0, 20) + "...")
    }

    if (!token) {
      throw new Error("Authentication token not found. Please log in again.")
    }

    const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Order creation response:", response.data)
    return response.data.data
  } catch (error) {
    console.error("Order creation error:", error.response?.data || error.message)
    console.error("Full error object:", error)
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to create order")
  }
})

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async ({ userId, page = 1, limit = 10, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const params = new URLSearchParams({ page, limit })
      if (status) params.append("status", status)
      if (userId) params.append("userId", userId) // For admin use

      const response = await axios.get(`${API_BASE_URL}/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch orders")
    }
  },
)

export const fetchOrderById = createAsyncThunk("orders/fetchOrderById", async ({ orderId }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken")

    if (!token) {
      throw new Error("Authentication token not found. Please log in again.")
    }

    const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch order")
  }
})

export const cancelOrder = createAsyncThunk("orders/cancelOrder", async ({ orderId, reason }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken")

    if (!token) {
      throw new Error("Authentication token not found. Please log in again.")
    }

    const response = await axios.patch(
      `${API_BASE_URL}/orders/${orderId}/cancel`,
      {
        reason,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return response.data.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to cancel order")
  }
})

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
        state.orders.unshift(action.payload)
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.orders
        state.pagination = action.payload.pagination
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false
        // Update the order in the orders array
        const index = state.orders.findIndex((order) => order.id === action.payload.id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        // Update current order if it's the same
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = action.payload
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentOrder, setCurrentOrder } = orderSlice.actions
export default orderSlice.reducer
