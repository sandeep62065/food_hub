import { apiSlice } from './apiSlice';

export const deliveryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableOrders: builder.query({
      query: () => ({ url: '/delivery/orders/available' }),
      providesTags: ['Order'],
    }),
    getMyDeliveries: builder.query({
      query: () => ({ url: '/delivery/orders/my' }),
      providesTags: ['Order'],
    }),
    acceptOrder: builder.mutation({
      query: (id) => ({ url: `/delivery/orders/${id}/accept`, method: 'PATCH' }),
      invalidatesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/delivery/orders/${id}/status`, method: 'PATCH', data: { status } }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetAvailableOrdersQuery,
  useGetMyDeliveriesQuery,
  useAcceptOrderMutation,
  useUpdateOrderStatusMutation,
} = deliveryApi;
