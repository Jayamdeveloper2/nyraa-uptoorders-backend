import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_BASE_URL = "http://localhost:5000/api"

// Async thunks
export const createOrder = createAsyncThunk("orders/createOrder", async (orderData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.message || "Failed to create order")
    }

    return data.order
  } catch (error) {
    return rejectWithValue(error.message || "Network error")
  }
})

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async ({ page = 1, limit = 10, status } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      let url = `${API_BASE_URL}/orders?page=${page}&limit=${limit}`
      if (status) url += `&status=${status}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch orders")
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const fetchOrder = createAsyncThunk("orders/fetchOrder", async (orderId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.message || "Failed to fetch order")
    }

    return data.order
  } catch (error) {
    return rejectWithValue(error.message || "Network error")
  }
})

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    currentOrder: null,
    lastCreatedOrder: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
    clearLastCreatedOrder: (state) => {
      state.lastCreatedOrder = null
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
        state.lastCreatedOrder = action.payload
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

      // Fetch single order
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentOrder, clearLastCreatedOrder, setCurrentOrder } = orderSlice.actions
export default orderSlice.reducer
