import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from './authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/tickets',
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

export const ticketApi = createApi({
  reducerPath: 'ticketApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Ticket', 'TicketStats'],
  endpoints: (builder) => ({
    createTicket: builder.mutation({
      query: (ticketData) => ({
        url: '',
        method: 'POST',
        body: ticketData,
      }),
      invalidatesTags: ['Ticket', 'TicketStats'],
    }),
    getTickets: builder.query({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: ['Ticket'],
    }),
    getTicket: builder.query({
      query: (ticketId) => `/${ticketId}`,
      providesTags: (result, error, ticketId) => [{ type: 'Ticket', id: ticketId }],
    }),
    addMessage: builder.mutation({
      query: ({ ticketId, message, isInternal }) => ({
        url: `/${ticketId}/messages`,
        method: 'POST',
        body: { message, isInternal },
      }),
      invalidatesTags: (result, error, { ticketId }) => [{ type: 'Ticket', id: ticketId }],
    }),
    updateTicketStatus: builder.mutation({
      query: ({ ticketId, ...statusData }) => ({
        url: `/${ticketId}/status`,
        method: 'PATCH',
        body: statusData,
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        { type: 'Ticket', id: ticketId },
        'Ticket',
        'TicketStats'
      ],
    }),
    assignTicket: builder.mutation({
      query: ({ ticketId, adminId }) => ({
        url: `/${ticketId}/assign`,
        method: 'PATCH',
        body: { adminId },
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        { type: 'Ticket', id: ticketId },
        'Ticket'
      ],
    }),
    getTicketStats: builder.query({
      query: () => '/stats',
      providesTags: ['TicketStats'],
    }),
  }),
})

export const {
  useCreateTicketMutation,
  useGetTicketsQuery,
  useGetTicketQuery,
  useAddMessageMutation,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
  useGetTicketStatsQuery,
} = ticketApi
