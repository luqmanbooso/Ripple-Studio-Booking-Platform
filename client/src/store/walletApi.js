import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const walletApi = createApi({
  reducerPath: "walletApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/wallet",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Wallet", "Transaction", "WithdrawalRequest"],
  endpoints: (builder) => ({
    // Get wallet information
    getWallet: builder.query({
      query: () => "/",
      providesTags: ["Wallet"],
    }),

    // Get wallet statistics
    getWalletStats: builder.query({
      query: (period = "month") => `/stats?period=${period}`,
      providesTags: ["Wallet"],
    }),

    // Get transactions with pagination
    getTransactions: builder.query({
      query: ({
        page = 1,
        limit = 20,
        type,
        status,
        startDate,
        endDate,
      } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (type) params.append("type", type);
        if (status) params.append("status", status);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        return `/transactions?${params.toString()}`;
      },
      providesTags: ["Transaction"],
    }),

    // Get single transaction
    getTransaction: builder.query({
      query: (transactionId) => `/transactions/${transactionId}`,
      providesTags: (result, error, id) => [{ type: "Transaction", id }],
    }),

    // Request withdrawal
    requestWithdrawal: builder.mutation({
      query: (withdrawalData) => ({
        url: "/withdraw",
        method: "POST",
        body: withdrawalData,
      }),
      invalidatesTags: ["Wallet", "Transaction"],
    }),

    // Update bank details
    updateBankDetails: builder.mutation({
      query: (bankDetails) => ({
        url: "/bank-details",
        method: "PUT",
        body: bankDetails,
      }),
      invalidatesTags: ["Wallet"],
    }),

    // Update withdrawal settings
    updateWithdrawalSettings: builder.mutation({
      query: (settings) => ({
        url: "/withdrawal-settings",
        method: "PUT",
        body: settings,
      }),
      invalidatesTags: ["Wallet"],
    }),

    // Admin: Get withdrawal requests
    getWithdrawalRequests: builder.query({
      query: ({ page = 1, limit = 20, status = "pending" } = {}) =>
        `/admin/withdrawals?page=${page}&limit=${limit}&status=${status}`,
      providesTags: ["WithdrawalRequest"],
    }),

    // Admin: Process withdrawal
    processWithdrawal: builder.mutation({
      query: ({ transactionId, ...data }) => ({
        url: `/admin/withdrawals/${transactionId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["WithdrawalRequest", "Transaction"],
    }),
  }),
});

export const {
  useGetWalletQuery,
  useGetWalletStatsQuery,
  useGetTransactionsQuery,
  useGetTransactionQuery,
  useRequestWithdrawalMutation,
  useUpdateBankDetailsMutation,
  useUpdateWithdrawalSettingsMutation,
  useGetWithdrawalRequestsQuery,
  useProcessWithdrawalMutation,
} = walletApi;
