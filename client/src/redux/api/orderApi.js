import { apiSlice } from './apiSlice';

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    placeOrder: builder.mutation({
      query: (data) => ({ url: '/orders', method: 'POST', data }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    getMyOrders: builder.query({
      query: (params) => ({ url: '/orders', params }),
      providesTags: ['Order'],
    }),
    getOrder: builder.query({
      query: (id) => ({ url: `/orders/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Order', id }],
      pollingInterval: 3000,
    }),
    cancelOrder: builder.mutation({
      query: ({ id, reason }) => ({ url: `/orders/${id}/cancel`, method: 'PATCH', data: { reason } }),
      invalidatesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status, note }) => ({ url: `/orders/${id}/status`, method: 'PATCH', data: { status, note } }),
      invalidatesTags: ['Order'],
    }),
    getRestaurantOrders: builder.query({
      query: (params) => ({ url: '/orders/restaurant', params }),
      providesTags: ['Order'],
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
  useUpdateOrderStatusMutation,
  useGetRestaurantOrdersQuery,
} = orderApi;
