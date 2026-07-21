import { apiSlice } from './apiSlice';

export const couponApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    validateCoupon: builder.mutation({
      query: (data) => ({ url: '/coupons/validate', method: 'POST', data }),
    }),
    getCoupons: builder.query({
      query: () => ({ url: '/coupons' }),
      providesTags: ['Coupon'],
    }),
    createCoupon: builder.mutation({
      query: (data) => ({ url: '/coupons', method: 'POST', data }),
      invalidatesTags: ['Coupon'],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, data }) => ({ url: `/coupons/${id}`, method: 'PATCH', data }),
      invalidatesTags: ['Coupon'],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({ url: `/coupons/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Coupon'],
    }),
  }),
});

export const {
  useValidateCouponMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
