import { apiSlice } from './apiSlice';

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrderMessages: builder.query({
      query: (orderId) => ({ url: `/chat/${orderId}/messages` }),
      providesTags: (result, error, id) => [{ type: 'Chat', id }],
    }),
  }),
});

export const { useGetOrderMessagesQuery } = chatApi;
