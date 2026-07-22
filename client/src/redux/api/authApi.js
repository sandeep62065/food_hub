import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (credentials) => ({ url: '/auth/register', method: 'POST', data: credentials }),
    }),
    login: builder.mutation({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', data: credentials }),
    }),
    googleLogin: builder.mutation({
      query: (credentials) => ({ url: '/auth/google', method: 'POST', data: credentials }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    refreshToken: builder.mutation({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({ url: '/auth/forgot-password', method: 'POST', data }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({ url: `/auth/reset-password/${token}`, method: 'POST', data: { password } }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
