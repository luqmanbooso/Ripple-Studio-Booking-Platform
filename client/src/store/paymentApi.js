import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/payments',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (data) => ({
        url: '/create-checkout-session',
        method: 'POST',
        body: data,
      }),
    }),
    refundBooking: builder.mutation({
      query: (bookingId) => ({
        url: `/refund/${bookingId}`,
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useCreateCheckoutSessionMutation,
  useRefundBookingMutation,
} = paymentApi
