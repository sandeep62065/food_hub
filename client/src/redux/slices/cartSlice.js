import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  restaurant: null,
  subtotal: 0,
  totalItems: 0,
  isDrawerOpen: false,
};

const calculateTotals = (items) => ({
  subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      const cart = action.payload;
      state.items = cart.items || [];
      state.restaurant = cart.restaurant || null;
      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.totalItems = totals.totalItems;
    },
    clearCartState: (state) => {
      state.items = [];
      state.restaurant = null;
      state.subtotal = 0;
      state.totalItems = 0;
    },
    toggleDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    openDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeDrawer: (state) => {
      state.isDrawerOpen = false;
    },
  },
});

export const { setCart, clearCartState, toggleDrawer, openDrawer, closeDrawer } = cartSlice.actions;

export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.subtotal;
export const selectCartCount = (state) => state.cart.totalItems;

export default cartSlice.reducer;
