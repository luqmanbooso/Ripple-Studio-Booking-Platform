import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from './authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/media',
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

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Media'],
  endpoints: (builder) => ({
    getStudioMedia: builder.query({
      query: ({ studioId, ...params }) => ({
        url: `/studio/${studioId}`,
        params
      }),
      providesTags: ['Media']
    }),
    getMedia: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Media', id }]
    }),
    createMedia: builder.mutation({
      query: (mediaData) => ({
        url: '/',
        method: 'POST',
        body: mediaData
      }),
      invalidatesTags: ['Media']
    }),
    updateMedia: builder.mutation({
      query: ({ id, ...mediaData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: mediaData
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Media', id }, 'Media']
    }),
    deleteMedia: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Media']
    }),
    toggleFeatured: builder.mutation({
      query: (id) => ({
        url: `/${id}/featured`,
        method: 'PATCH'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Media', id }, 'Media']
    }),
    searchMedia: builder.query({
      query: (params) => ({
        url: '/search',
        params
      }),
      providesTags: ['Media']
    })
  })
})

export const {
  useGetStudioMediaQuery,
  useGetMediaQuery,
  useCreateMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
  useToggleFeaturedMutation,
  useSearchMediaQuery
} = mediaApi
