import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from './authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/services',
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

export const serviceApi = createApi({
  reducerPath: 'serviceApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Service'],
  endpoints: (builder) => ({
    getStudioServices: builder.query({
      query: ({ studioId }) => `/studio/${studioId}`,
      providesTags: (result, error, { studioId }) => [
        { type: 'Service', id: 'LIST' },
        { type: 'Service', id: studioId }
      ]
    }),
    getServiceStats: builder.query({
      query: ({ studioId }) => `/studio/${studioId}/stats`,
      providesTags: (result, error, { studioId }) => [
        { type: 'Service', id: `STATS-${studioId}` }
      ]
    }),
    addService: builder.mutation({
      query: ({ studioId, ...serviceData }) => ({
        url: `/studio/${studioId}`,
        method: 'POST',
        body: serviceData
      }),
      invalidatesTags: (result, error, { studioId }) => [
        { type: 'Service', id: 'LIST' },
        { type: 'Service', id: studioId },
        { type: 'Service', id: `STATS-${studioId}` }
      ]
    }),
    updateService: builder.mutation({
      query: ({ studioId, serviceId, ...serviceData }) => ({
        url: `/studio/${studioId}/${serviceId}`,
        method: 'PUT',
        body: serviceData
      }),
      invalidatesTags: (result, error, { studioId, serviceId }) => [
        { type: 'Service', id: 'LIST' },
        { type: 'Service', id: studioId },
        { type: 'Service', id: serviceId },
        { type: 'Service', id: `STATS-${studioId}` }
      ]
    }),
    deleteService: builder.mutation({
      query: ({ studioId, serviceId }) => ({
        url: `/studio/${studioId}/${serviceId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { studioId, serviceId }) => [
        { type: 'Service', id: 'LIST' },
        { type: 'Service', id: studioId },
        { type: 'Service', id: serviceId },
        { type: 'Service', id: `STATS-${studioId}` }
      ]
    })
  })
})

export const {
  useGetStudioServicesQuery,
  useGetServiceStatsQuery,
  useAddServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation
} = serviceApi
