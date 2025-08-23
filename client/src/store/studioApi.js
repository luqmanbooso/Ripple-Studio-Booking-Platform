import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const studioApi = createApi({
  reducerPath: 'studioApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/studios',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
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
