import { createSlice } from "@reduxjs/toolkit"

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const serializedCart = localStorage.getItem("cart")
    if (serializedCart === null) {
      return []
    }
    return JSON.parse(serializedCart)
  } catch (err) {
    console.error("Error loading cart from localStorage:", err)
    return []
  }
}

// Save cart to localStorage
const saveCartToStorage = (cartItems) => {
  try {
    const serializedCart = JSON.stringify(cartItems)
    localStorage.setItem("cart", serializedCart)
  } catch (err) {
    console.error("Error saving cart to localStorage:", err)
  }
}

const initialState = {
  items: loadCartFromStorage(),
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { id, name, price, image, color, size, type, carat, quantity = 1 } = action.payload

      // Check if item with same id and variant already exists
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.id === id && item.color === color && item.size === size && item.type === type && item.carat === carat,
      )

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        state.items[existingItemIndex].quantity += quantity
      } else {
        // Add new item
        state.items.push({
          id,
          name,
          price,
          image,
          color,
          size,
          type,
          carat,
          quantity,
          addedAt: new Date().toISOString(),
        })
      }

      // Save to localStorage
      saveCartToStorage(state.items)
    },

    removeFromCart: (state, action) => {
      const itemId = action.payload
      state.items = state.items.filter((item) => item.id !== itemId)
      saveCartToStorage(state.items)
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find((item) => item.id === id)
      if (item && quantity > 0) {
        item.quantity = quantity
        saveCartToStorage(state.items)
      }
    },

    clearCart: (state) => {
      state.items = []
      localStorage.removeItem("cart")
    },

    // Load cart from storage (useful for hydration)
    loadCart: (state) => {
      state.items = loadCartFromStorage()
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, loadCart } = cartSlice.actions

// Selectors
export const selectCartItems = (state) => state.cart.items
export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
export const selectCartItemCount = (state) => state.cart.items.reduce((count, item) => count + item.quantity, 0)

export default cartSlice.reducer
