import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from './authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/studios',
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

export const studioApi = createApi({
  reducerPath: 'studioApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Studio', 'Studios'],
  endpoints: (builder) => ({
    getStudios: builder.query({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: ['Studios'],
    }),
    getStudio: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Studio', id }],
    }),
    createStudio: builder.mutation({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Studios'],
    }),
    updateStudio: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Studio', id }, 'Studios'],
    }),
    addAvailability: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}/availability`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Studio', id }],
    }),

    // Admin endpoints
    getAllStudiosForAdmin: builder.query({
      query: (params) => ({
        url: '/admin/all',
        params,
      }),
      providesTags: ['Studios'],
    }),
    getStudioStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Studios'],
    }),
    getStudioAnalytics: builder.query({
      query: (params) => ({
        url: '/admin/analytics',
        params,
      }),
      providesTags: ['Studios'],
    }),
    updateStudioStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/${id}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Studios'],
    }),
    toggleStudioFeature: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/${id}/feature`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Studio', id }, 'Studios'],
    }),
    deleteStudio: builder.mutation({
      query: (id) => ({
        url: `/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Studios'],
    }),
    bulkStudioActions: builder.mutation({
      query: (data) => ({
        url: '/admin/bulk-actions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Studios'],
    }),
  }),
})

export const {
  useGetStudiosQuery,
  useGetStudioQuery,
  useCreateStudioMutation,
  useUpdateStudioMutation,
  useAddAvailabilityMutation,
  useGetAllStudiosForAdminQuery,
  useGetStudioStatsQuery,
  useGetStudioAnalyticsQuery,
  useUpdateStudioStatusMutation,
  useToggleStudioFeatureMutation,
  useDeleteStudioMutation,
  useBulkStudioActionsMutation,
} = studioApi
