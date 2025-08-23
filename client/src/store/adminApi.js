import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/admin',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Analytics', 'AdminUsers', 'AdminBookings', 'AdminReviews'],
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: (params) => ({
        url: '/analytics',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    getUsers: builder.query({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['AdminUsers'],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    getBookings: builder.query({
      query: (params) => ({
        url: '/bookings',
        params,
      }),
      providesTags: ['AdminBookings'],
    }),
    getReviews: builder.query({
      query: (params) => ({
        url: '/reviews',
        params,
      }),
      providesTags: ['AdminReviews'],
    }),
    approveReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AdminReviews'],
    }),
  }),
})

export const {
  useGetAnalyticsQuery,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useGetBookingsQuery,
  useGetReviewsQuery,
  useApproveReviewMutation,
} = adminApi
