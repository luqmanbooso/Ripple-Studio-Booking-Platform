import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const artistApi = createApi({
  reducerPath: 'artistApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/artists',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
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
