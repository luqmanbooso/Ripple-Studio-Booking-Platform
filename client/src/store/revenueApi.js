import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/revenue',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  
  if (result.error && result.error.status === 401) {
    // Handle token refresh or logout
    api.dispatch({ type: 'auth/logout' })
  }
  
  return result
}

export const revenueApi = createApi({
  reducerPath: 'revenueApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Revenue', 'Payout', 'Statistics'],
  endpoints: (builder) => ({
    
    // ==================== STUDIO ENDPOINTS ====================
    
    // Get studio revenue dashboard
    getStudioRevenue: builder.query({
      query: (params = {}) => ({
        url: '/studio',
        params
      }),
      providesTags: ['Revenue', 'Statistics']
    }),

    // Get revenue details
    getRevenueDetails: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Revenue', id }]
    }),

    // Add adjustment to revenue
    addAdjustment: builder.mutation({
      query: ({ id, ...adjustment }) => ({
        url: `/${id}/adjustments`,
        method: 'POST',
        body: adjustment
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Revenue', id },
        'Statistics'
      ]
    }),

    // Request payout
    requestPayout: builder.mutation({
      query: (payoutData) => ({
        url: '/studio/payout',
        method: 'POST',
        body: payoutData
      }),
      invalidatesTags: ['Payout', 'Statistics']
    }),

    // Get payout history
    getPayoutHistory: builder.query({
      query: (params = {}) => ({
        url: '/studio/payouts',
        params
      }),
      providesTags: ['Payout']
    }),

    // ==================== CLIENT ENDPOINTS ====================

    // Get client spending history
    getClientSpending: builder.query({
      query: (params = {}) => ({
        url: '/client',
        params
      }),
      providesTags: ['Revenue']
    }),

    // Download spending report
    downloadSpendingReport: builder.query({
      query: (params = {}) => ({
        url: '/client/export',
        params
      })
    }),

    // ==================== ADMIN ENDPOINTS ====================

    // Get platform revenue overview
    getPlatformRevenue: builder.query({
      query: (params = {}) => ({
        url: '/admin/platform',
        params
      }),
      providesTags: ['Statistics']
    }),

    // Get all payout requests
    getAllPayoutRequests: builder.query({
      query: (params = {}) => ({
        url: '/admin/payouts',
        params
      }),
      providesTags: ['Payout']
    }),

    // Process payout request
    processPayoutRequest: builder.mutation({
      query: ({ revenueId, payoutIndex, ...data }) => ({
        url: `/admin/payouts/${revenueId}/${payoutIndex}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Payout', 'Statistics']
    }),

    // Update commission rate
    updateCommissionRate: builder.mutation({
      query: (data) => ({
        url: '/admin/commission-rate',
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Statistics']
    }),

    // Get studio revenue (admin view)
    getAdminStudioRevenue: builder.query({
      query: ({ studioId, ...params }) => ({
        url: `/admin/studio/${studioId}`,
        params
      }),
      providesTags: ['Revenue']
    }),

    // ==================== SHARED ENDPOINTS ====================

    // Generate invoice
    generateInvoice: builder.mutation({
      query: (id) => ({
        url: `/${id}/invoice`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Revenue', id }]
    })
  })
})

export const {
  // Studio hooks
  useGetStudioRevenueQuery,
  useGetRevenueDetailsQuery,
  useAddAdjustmentMutation,
  useRequestPayoutMutation,
  useGetPayoutHistoryQuery,
  
  // Client hooks
  useGetClientSpendingQuery,
  useLazyDownloadSpendingReportQuery,
  
  // Admin hooks
  useGetPlatformRevenueQuery,
  useGetAllPayoutRequestsQuery,
  useProcessPayoutRequestMutation,
  useUpdateCommissionRateMutation,
  useGetAdminStudioRevenueQuery,
  
  // Shared hooks
  useGenerateInvoiceMutation
} = revenueApi
