import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from './authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/reviews',
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

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: baseQueryWithReauth,
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
    // Admin endpoints
    getAllReviewsForModeration: builder.query({
      query: (params) => {
        // Filter out empty string parameters to avoid validation errors
        const filteredParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {});
        
        return {
          url: '/admin/all',
          params: filteredParams,
        };
      },
      providesTags: ['Reviews'],
    }),
    moderateReview: builder.mutation({
      query: ({ reviewId, ...data }) => ({
        url: `/admin/${reviewId}/moderate`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Reviews'],
    }),
    deleteReview: builder.mutation({
      query: (reviewId) => ({
        url: `/admin/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews'],
    }),
    bulkModerateReviews: builder.mutation({
      query: (data) => ({
        url: '/admin/bulk-moderate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reviews'],
    }),
  }),
})

export const {
  useCreateReviewMutation,
  useGetReviewsQuery,
  useUpdateReviewMutation,
  useGetAllReviewsForModerationQuery,
  useModerateReviewMutation,
  useDeleteReviewMutation,
  useBulkModerateReviewsMutation,
} = reviewApi
