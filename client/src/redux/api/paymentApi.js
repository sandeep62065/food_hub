import { apiSlice } from './apiSlice';

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation({
      query: (data) => ({ url: '/payments/create-order', method: 'POST', data }),
    }),
    verifyRazorpayPayment: builder.mutation({
      query: (data) => ({ url: '/payments/verify', method: 'POST', data }),
    }),
  }),
});

export const {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} = paymentApi;
