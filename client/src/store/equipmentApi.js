import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from './authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/equipment',
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

export const equipmentApi = createApi({
  reducerPath: 'equipmentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Equipment'],
  endpoints: (builder) => ({
    getStudioEquipment: builder.query({
      query: ({ studioId, ...params }) => ({
        url: `/studio/${studioId}`,
        params
      }),
      providesTags: ['Equipment']
    }),
    getEquipment: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Equipment', id }]
    }),
    getEquipmentStats: builder.query({
      query: (studioId) => `/studio/${studioId}/stats`,
      providesTags: ['Equipment']
    }),
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Equipment']
    }),
    createEquipment: builder.mutation({
      query: (equipmentData) => ({
        url: '/',
        method: 'POST',
        body: equipmentData
      }),
      invalidatesTags: ['Equipment']
    }),
    updateEquipment: builder.mutation({
      query: ({ id, ...equipmentData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: equipmentData
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Equipment', id }, 'Equipment']
    }),
    deleteEquipment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Equipment']
    }),
    addMaintenance: builder.mutation({
      query: ({ id, ...maintenanceData }) => ({
        url: `/${id}/maintenance`,
        method: 'POST',
        body: maintenanceData
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Equipment', id }, 'Equipment']
    }),
    searchEquipment: builder.query({
      query: (params) => ({
        url: '/search',
        params
      }),
      providesTags: ['Equipment']
    })
  })
})

export const {
  useGetStudioEquipmentQuery,
  useGetEquipmentQuery,
  useGetEquipmentStatsQuery,
  useGetCategoriesQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
  useAddMaintenanceMutation,
  useSearchEquipmentQuery
} = equipmentApi
