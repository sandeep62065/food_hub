import { apiSlice } from './apiSlice';

export const restaurantApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRestaurants: builder.query({
      query: (params) => ({ url: '/restaurants', params }),
      providesTags: ['Restaurant'],
    }),
    getRestaurant: builder.query({
      query: (id) => ({ url: `/restaurants/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Restaurant', id }],
    }),
    getMyRestaurant: builder.query({
      query: () => ({ url: '/restaurants/mine' }),
      providesTags: ['Restaurant'],
    }),
    createRestaurant: builder.mutation({
      query: (data) => ({ url: '/restaurants', method: 'POST', data, headers: { 'Content-Type': 'multipart/form-data' } }),
      invalidatesTags: ['Restaurant'],
    }),
    updateRestaurant: builder.mutation({
      query: ({ id, data }) => ({ url: `/restaurants/${id}`, method: 'PATCH', data, headers: { 'Content-Type': 'multipart/form-data' } }),
      invalidatesTags: ['Restaurant'],
    }),
  }),
});

export const {
  useGetRestaurantsQuery,
  useGetRestaurantQuery,
  useGetMyRestaurantQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
} = restaurantApi;
