import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from './authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/admin',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) headers.set('authorization', `Bearer ${token}`)
    return headers
  }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    try {
  const refreshRes = await fetch('/api/auth/refresh', { method: 'GET', credentials: 'include' })
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        const newToken = refreshData.data.accessToken
        const user = api.getState().auth.user
        api.dispatch(setCredentials({ user, token: newToken }))
        result = await baseQuery(args, api, extraOptions)
      } else {
        api.dispatch(logout())
      }
    } catch (err) {
      api.dispatch(logout())
    }
  }

  return result
}

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

  baseQuery: baseQueryWithReauth,
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
    getUserStats: builder.query({
      query: () => '/users/stats',
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
    verifyUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/verify`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    unverifyUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/unverify`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    blockUser: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/users/${id}/block`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    unblockUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/unblock`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    toggleUserStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    bulkUserActions: builder.mutation({
      query: ({ userIds, action, reason }) => ({
        url: '/users/bulk-actions',
        method: 'POST',
        body: { userIds, action, reason },
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
  useGetUserStatsQuery,
  useUpdateUserRoleMutation,
  // User Management
  useVerifyUserMutation,
  useUnverifyUserMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
  useBulkUserActionsMutation,
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
