import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from './authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/payments',
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

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Payment', 'MyPayments'],
  endpoints: (builder) => ({
    // Checkout session creation
    createCheckoutSession: builder.mutation({
      query: (data) => ({
        url: '/create-checkout-session',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MyPayments'],
    }),

    // Test endpoint to create sample payment (development only)
    createTestPayment: builder.mutation({
      query: () => ({
        url: '/create-test-payment',
        method: 'POST',
      }),
      invalidatesTags: ['MyPayments'],
    }),
    
    // Get user's payment history
    getMyPayments: builder.query({
      query: ({ page = 1, limit = 10, status } = {}) => ({
        url: '/my-payments',
        params: { page, limit, status },
      }),
      providesTags: ['MyPayments'],
    }),
    
    // Get payments for a specific booking
    getBookingPayments: builder.query({
      query: (bookingId) => `/booking/${bookingId}/payments`,
      providesTags: (result, error, bookingId) => [
        { type: 'Payment', id: bookingId },
      ],
    }),
    
    // Get single payment details
    getPayment: builder.query({
      query: (paymentId) => `/${paymentId}`,
      providesTags: (result, error, paymentId) => [
        { type: 'Payment', id: paymentId },
      ],
    }),
    
    // Admin: Get all payments
    getAllPayments: builder.query({
      query: ({ page = 1, limit = 20, status, search } = {}) => ({
        url: '/admin/all',
        params: { page, limit, status, search },
      }),
      providesTags: ['Payment'],
    }),
    
    // Initiate refund
    initiateRefund: builder.mutation({
      query: ({ paymentId, amount, reason }) => ({
        url: `/${paymentId}/refund`,
        method: 'POST',
        body: { amount, reason },
      }),
      invalidatesTags: (result, error, { paymentId }) => [
        { type: 'Payment', id: paymentId },
        'MyPayments',
      ],
    }),
    
    // Legacy refund endpoint
    refundBooking: builder.mutation({
      query: (bookingId) => ({
        url: `/refund/${bookingId}`,
        method: 'POST',
      }),
      invalidatesTags: ['MyPayments'],
    }),
  }),
})

export const {
  useCreateCheckoutSessionMutation,
  useCreateTestPaymentMutation,
  useGetMyPaymentsQuery,
  useGetBookingPaymentsQuery,
  useGetPaymentQuery,
  useGetAllPaymentsQuery,
  useInitiateRefundMutation,
  useRefundBookingMutation,
} = paymentApi
