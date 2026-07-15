import { createApi } from '@reduxjs/toolkit/query/react';
import axiosInstance from '../../services/axiosInstance';

// Custom baseQuery using axios (handles withCredentials and interceptors)
const axiosBaseQuery = () => async ({ url, method = 'GET', data, params, headers }) => {
  try {
    const result = await axiosInstance({ url, method, data, params, headers });
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError.response;
    return {
      error: {
        status: err?.status,
        data: err?.data || axiosError.message,
      },
    };
  }
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Restaurant', 'Food', 'Category', 'Cart', 'Order', 'User', 'Address'],
  endpoints: () => ({}),
});
