import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from './authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/notifications',
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

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Notifications', 'NotificationStats'],

  endpoints: (builder) => ({
    // Get user notifications
    getNotifications: builder.query({
      query: (params = {}) => ({
        url: '/',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          unreadOnly: params.unreadOnly || false
        }
      }),
      providesTags: ['Notifications'],
      transformResponse: (response) => response.data
    }),

    // Get notification statistics
    getNotificationStats: builder.query({
      query: () => '/stats',
      providesTags: ['NotificationStats'],
      transformResponse: (response) => response.data
    }),

    // Mark notification as read
    markAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/${notificationId}/read`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Notifications', 'NotificationStats']
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/read-all',
        method: 'PATCH'
      }),
      invalidatesTags: ['Notifications', 'NotificationStats']
    }),

    // Delete notification
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/${notificationId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Notifications', 'NotificationStats']
    })
  })
})

export const {
  useGetNotificationsQuery,
  useGetNotificationStatsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation
} = notificationApi