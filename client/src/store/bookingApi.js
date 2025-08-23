import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/bookings',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
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
  }),
})

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetBookingQuery,
  useCancelBookingMutation,
  useCompleteBookingMutation,
} = bookingApi
