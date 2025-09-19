import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from './authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/artists',
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

export const artistApi = createApi({
  reducerPath: 'artistApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Artist', 'Artists'],
  endpoints: (builder) => ({
    getArtists: builder.query({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: ['Artists'],
    }),
    getArtist: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Artist', id }],
    }),
    updateArtist: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Artist', id }],
    }),
    addAvailability: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}/availability`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Artist', id }],
    }),
  }),
})

export const {
  useGetArtistsQuery,
  useGetArtistQuery,
  useUpdateArtistMutation,
  useAddAvailabilityMutation,
} = artistApi
