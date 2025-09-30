import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from './authSlice'

// Custom baseQuery that attempts refresh when a 401 is returned
const baseQuery = fetchBaseQuery({
  baseUrl: '/api/bookings',
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
    // Try refresh
    try {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'GET',
        credentials: 'include'
      })

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        const newToken = refreshData.data.accessToken

  // Update store via api context to avoid circular imports
  const user = api.getState().auth.user
  api.dispatch(setCredentials({ user, token: newToken }))

        // Retry original request with new token
        result = await baseQuery(args, api, extraOptions)
      } else {
  // Refresh failed - logout
  api.dispatch(logout())
      }
    } catch (err) {
      api.dispatch(logout())
    }
  }

  return result
}

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Booking', 'Bookings'],
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bookings'],
    }),
    getMyBookings: builder.query({
      query: (params) => ({
        url: '/my',
        params,
      }),
      providesTags: ['Bookings'],
    }),
    getBooking: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),
    cancelBooking: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Booking', id },
        'Bookings',
      ],
    }),
    completeBooking: builder.mutation({
      query: ({ id, notes }) => ({
        url: `/${id}/complete`,
        method: 'PATCH',
        body: { notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Booking', id },
        'Bookings',
      ],
    }),
    updateBooking: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Booking', id },
        'Bookings',
      ],
    }),
    confirmBooking: builder.mutation({
      query: (id) => ({
        url: `/${id}/confirm`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Booking', id },
        'Bookings',
      ],
    }),
    rejectBooking: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Booking', id },
        'Bookings',
      ],
    }),
    updateBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Booking', id },
        'Bookings',
      ],
    }),
  }),
})

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetBookingQuery,
  useCancelBookingMutation,
  useCompleteBookingMutation,
  useUpdateBookingMutation,
  useConfirmBookingMutation,
  useRejectBookingMutation,
  useUpdateBookingStatusMutation,
} = bookingApi
