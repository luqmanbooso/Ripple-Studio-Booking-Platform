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
    updateStudio: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Studio', id }],
    }),
    addAvailability: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}/availability`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Studio', id }],
    }),
  }),
})

export const {
  useGetStudiosQuery,
  useGetStudioQuery,
  useUpdateStudioMutation,
  useAddAvailabilityMutation,
} = studioApi
