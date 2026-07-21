import { apiSlice } from './apiSlice';

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => ({ url: '/categories' }),
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: (data) => ({ url: '/categories', method: 'POST', data, headers: { 'Content-Type': 'multipart/form-data' } }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({ url: `/categories/${id}`, method: 'PATCH', data, headers: { 'Content-Type': 'multipart/form-data' } }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => ({ url: '/users/me' }),
      providesTags: ['User'],
    }),
    getLoyaltyPoints: builder.query({
      query: () => ({ url: '/users/loyalty-points' }),
      providesTags: ['User'],
    }),
    updateMe: builder.mutation({
      query: (data) => ({ url: '/users/me', method: 'PATCH', data, headers: { 'Content-Type': 'multipart/form-data' } }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (data) => ({ url: '/users/me/password', method: 'PATCH', data }),
    }),
    getAddresses: builder.query({
      query: () => ({ url: '/users/me/addresses' }),
      providesTags: ['Address'],
    }),
    addAddress: builder.mutation({
      query: (data) => ({ url: '/users/me/addresses', method: 'POST', data }),
      invalidatesTags: ['Address'],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/users/me/addresses/${id}`, method: 'PATCH', data }),
      invalidatesTags: ['Address'],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({ url: `/users/me/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Address'],
    }),
  }),
});

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query({
      query: () => ({ url: '/admin/stats' }),
    }),
    getAdminUsers: builder.query({
      query: (params) => ({ url: '/admin/users', params }),
      providesTags: ['User'],
    }),
    toggleBan: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}/ban`, method: 'PATCH' }),
      invalidatesTags: ['User'],
    }),
    getAdminRestaurants: builder.query({
      query: (params) => ({ url: '/admin/restaurants', params }),
      providesTags: ['Restaurant'],
    }),
    updateRestaurantApproval: builder.mutation({
      query: ({ id, isApproved }) => ({ url: `/admin/restaurants/${id}/approval`, method: 'PATCH', data: { isApproved } }),
      invalidatesTags: ['Restaurant'],
    }),
    deleteRestaurant: builder.mutation({
      query: (id) => ({ url: `/admin/restaurants/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Restaurant'],
    }),
    getAdminOrders: builder.query({
      query: (params) => ({ url: '/admin/orders', params }),
      providesTags: ['Order'],
    }),
    getAdminFoods: builder.query({
      query: (params) => ({ url: '/admin/foods', params }),
      providesTags: ['Food'],
    }),
  }),
});

export const { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } = categoryApi;
export const { useGetMeQuery, useGetLoyaltyPointsQuery, useUpdateMeMutation, useChangePasswordMutation, useGetAddressesQuery, useAddAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation } = userApi;
export const { useGetAdminStatsQuery, useGetAdminUsersQuery, useToggleBanMutation, useGetAdminRestaurantsQuery, useUpdateRestaurantApprovalMutation, useDeleteRestaurantMutation, useGetAdminOrdersQuery, useGetAdminFoodsQuery } = adminApi;
