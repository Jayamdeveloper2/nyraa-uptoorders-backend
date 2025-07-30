import { createSlice } from "@reduxjs/toolkit"

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: JSON.parse(localStorage.getItem("cart")) || [],
    cartCount: JSON.parse(localStorage.getItem("cart"))?.reduce((total, item) => total + item.quantity, 0) || 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload
      const existingItem = state.items.find((item) => item.id === product.id)
      if (existingItem) {
        existingItem.quantity += product.quantity
      } else {
        state.items.push({ ...product, quantity: product.quantity })
      }
      state.cartCount += product.quantity
      localStorage.setItem("cart", JSON.stringify(state.items))
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find((item) => item.id === id)
      if (item) {
        state.cartCount += quantity - item.quantity
        item.quantity = quantity
        localStorage.setItem("cart", JSON.stringify(state.items))
      }
    },
    removeFromCart: (state, action) => {
      const id = action.payload
      const item = state.items.find((item) => item.id === id)
      if (item) {
        state.cartCount -= item.quantity
        state.items = state.items.filter((item) => item.id !== id)
        localStorage.setItem("cart", JSON.stringify(state.items))
      }
    },
    clearCart: (state) => {
      state.items = []
      state.cartCount = 0
      localStorage.removeItem("cart")
    },
  },
})

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions
export default cartSlice.reducer
