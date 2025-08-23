import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/reviews',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Review', 'Reviews'],
  endpoints: (builder) => ({
    createReview: builder.mutation({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reviews'],
    }),
    getReviews: builder.query({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: ['Reviews'],
    }),
    updateReview: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Review', id }],
    }),
  }),
})

export const {
  useCreateReviewMutation,
  useGetReviewsQuery,
  useUpdateReviewMutation,
} = reviewApi
