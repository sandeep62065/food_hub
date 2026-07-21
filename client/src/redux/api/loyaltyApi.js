import { apiSlice } from './apiSlice';

export const loyaltyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLoyaltySettings: builder.query({
      query: () => ({ url: '/admin/loyalty/settings' }),
      providesTags: ['LoyaltySettings'],
    }),
    updateLoyaltySettings: builder.mutation({
      query: (data) => ({ url: '/admin/loyalty/settings', method: 'PATCH', data }),
      invalidatesTags: ['LoyaltySettings'],
    }),
    getLoyaltyStats: builder.query({
      query: () => ({ url: '/admin/loyalty/stats' }),
      providesTags: ['LoyaltyStats'],
    }),
    adjustUserPoints: builder.mutation({
      query: ({ id, amount }) => ({ url: `/admin/loyalty/users/${id}/adjust`, method: 'PATCH', data: { amount } }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetLoyaltySettingsQuery,
  useUpdateLoyaltySettingsMutation,
  useGetLoyaltyStatsQuery,
  useAdjustUserPointsMutation,
} = loyaltyApi;
