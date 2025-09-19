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
