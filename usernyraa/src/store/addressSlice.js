import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_BASE_URL = "http://localhost:5000/api"

// Async thunks
export const fetchAddresses = createAsyncThunk("addresses/fetchAddresses", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.message || "Failed to fetch addresses")
    }

    return data.addresses
  } catch (error) {
    return rejectWithValue(error.message || "Network error")
  }
})

export const createAddress = createAsyncThunk("addresses/createAddress", async (addressData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.message || "Failed to create address")
    }

    return data.address
  } catch (error) {
    return rejectWithValue(error.message || "Network error")
  }
})

export const updateAddress = createAsyncThunk(
  "addresses/updateAddress",
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update address")
      }

      return data.address
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const setDefaultAddress = createAsyncThunk("addresses/setDefaultAddress", async (id, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/addresses/${id}/default`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.message || "Failed to set default address")
    }

    return data.address
  } catch (error) {
    return rejectWithValue(error.message || "Network error")
  }
})

export const deleteAddress = createAsyncThunk("addresses/deleteAddress", async (id, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.message || "Failed to delete address")
    }

    return id
  } catch (error) {
    return rejectWithValue(error.message || "Network error")
  }
})

const addressSlice = createSlice({
  name: "addresses",
  initialState: {
    addresses: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false
        state.addresses = action.payload
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create address
      .addCase(createAddress.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.loading = false
        state.addresses.push(action.payload)
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update address
      .addCase(updateAddress.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false
        const index = state.addresses.findIndex((addr) => addr.id === action.payload.id)
        if (index !== -1) {
          state.addresses[index] = action.payload
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Set default address
      .addCase(setDefaultAddress.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.loading = false
        // Update all addresses to remove default, then set the new default
        state.addresses = state.addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === action.payload.id,
        }))
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete address
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false
        state.addresses = state.addresses.filter((addr) => addr.id !== action.payload)
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = addressSlice.actions
export default addressSlice.reducer
