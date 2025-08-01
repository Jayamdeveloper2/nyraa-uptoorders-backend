import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';
import orderReducer from "./orderSlice"
import addressReducer from "./addressSlice"



export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
     orders: orderReducer,
     addresses: addressReducer,

  },
});