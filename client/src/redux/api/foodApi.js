import { apiSlice } from './apiSlice';
import { setCart, clearCartState } from '../slices/cartSlice';

export const foodApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFoods: builder.query({
      query: (params) => ({ url: '/foods', params }),
      providesTags: ['Food'],
    }),
    getFood: builder.query({
      query: (id) => ({ url: `/foods/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Food', id }],
    }),
    getFoodsByRestaurant: builder.query({
      query: (restaurantId) => ({ url: `/foods/restaurant/${restaurantId}` }),
      providesTags: ['Food'],
    }),
    addFood: builder.mutation({
      query: (data) => ({ url: '/foods', method: 'POST', data, headers: { 'Content-Type': 'multipart/form-data' } }),
      invalidatesTags: ['Food'],
    }),
    updateFood: builder.mutation({
      query: ({ id, data }) => ({ url: `/foods/${id}`, method: 'PATCH', data, headers: { 'Content-Type': 'multipart/form-data' } }),
      invalidatesTags: ['Food'],
    }),
    deleteFood: builder.mutation({
      query: (id) => ({ url: `/foods/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Food'],
    }),
  }),
});

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => ({ url: '/cart' }),
      providesTags: ['Cart'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCart(data.data));
        } catch {}
      },
    }),
    addToCart: builder.mutation({
      query: (data) => ({ url: '/cart', method: 'POST', data }),
      invalidatesTags: ['Cart'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCart(data.data));
        } catch {}
      },
    }),
    updateCartItem: builder.mutation({
      query: ({ itemId, quantity }) => ({ url: `/cart/${itemId}`, method: 'PATCH', data: { quantity } }),
      invalidatesTags: ['Cart'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCart(data.data));
        } catch {}
      },
    }),
    removeCartItem: builder.mutation({
      query: (itemId) => ({ url: `/cart/${itemId}`, method: 'DELETE' }),
      invalidatesTags: ['Cart'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCart(data.data));
        } catch {}
      },
    }),
    clearCart: builder.mutation({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearCartState());
        } catch {}
      },
    }),
  }),
});

export const { useGetFoodsQuery, useGetFoodQuery, useGetFoodsByRestaurantQuery, useAddFoodMutation, useUpdateFoodMutation, useDeleteFoodMutation } = foodApi;
export const { useGetCartQuery, useAddToCartMutation, useUpdateCartItemMutation, useRemoveCartItemMutation, useClearCartMutation } = cartApi;
