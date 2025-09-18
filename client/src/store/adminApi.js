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
  tagTypes: ['Analytics', 'AdminUsers', 'AdminBookings', 'AdminReviews', 'AdminStudios', 'Revenue'],
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
    // Studio Management
    getStudios: builder.query({
      query: (params) => ({
        url: '/studios',
        params,
      }),
      providesTags: ['AdminStudios'],
    }),
    createStudio: builder.mutation({
      query: (studioData) => ({
        url: '/studios',
        method: 'POST',
        body: studioData,
      }),
      invalidatesTags: ['AdminStudios'],
    }),
    updateStudio: builder.mutation({
      query: ({ id, ...studioData }) => ({
        url: `/studios/${id}`,
        method: 'PATCH',
        body: studioData,
      }),
      invalidatesTags: ['AdminStudios'],
    }),
    deleteStudio: builder.mutation({
      query: (id) => ({
        url: `/studios/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminStudios'],
    }),
    toggleStudioStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/studios/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['AdminStudios'],
    }),
    // Revenue Analytics
    getRevenueAnalytics: builder.query({
      query: (params) => ({
        url: '/revenue',
        params,
      }),
      providesTags: ['Revenue'],
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
  // Studio Management
  useGetStudiosQuery,
  useCreateStudioMutation,
  useUpdateStudioMutation,
  useDeleteStudioMutation,
  useToggleStudioStatusMutation,
  // Revenue Analytics
  useGetRevenueAnalyticsQuery,
} = adminApi
