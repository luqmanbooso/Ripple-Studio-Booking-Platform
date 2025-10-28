import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Search,
  Filter,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import { useGetTransactionsQuery } from "../../store/walletApi";

const WalletTransactions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: transactionsData,
    isLoading,
    error,
  } = useGetTransactionsQuery({
    page: currentPage,
    limit: 20,
    ...filters,
  });

  const transactions = transactionsData?.data?.transactions || [];
  const pagination = transactionsData?.data?.pagination;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "credit":
        return <ArrowUpRight className="w-5 h-5 text-green-400" />;
      case "withdrawal":
        return <ArrowDownRight className="w-5 h-5 text-red-400" />;
      case "commission_deduction":
        return <ArrowDownRight className="w-5 h-5 text-orange-400" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/20";
      case "pending":
        return "text-yellow-400 bg-yellow-400/20";
      case "failed":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const exportTransactions = () => {
    // TODO: Implement CSV export
    console.log("Export transactions");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">
                Transaction History
              </h1>
              <p className="text-gray-400">
                View and manage your payment transactions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button
                onClick={exportTransactions}
                variant="outline"
                icon={<Download className="w-4 h-4" />}
              >
                Export
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full p-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="credit">Credit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="commission_deduction">Commission</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full p-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  className="w-full p-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                  className="w-full p-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {(filters.type ||
              filters.status ||
              filters.startDate ||
              filters.endDate) && (
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            {transactions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-700 border-b border-dark-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Transaction
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-600">
                      {transactions.map((transaction) => (
                        <tr
                          key={transaction._id}
                          className="hover:bg-dark-700/50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {getTransactionIcon(transaction.type)}
                              <div>
                                <p className="text-gray-100 font-medium">
                                  {transaction.description}
                                </p>
                                {transaction.booking?.client && (
                                  <p className="text-gray-400 text-sm">
                                    Client: {transaction.booking.client.name}
                                  </p>
                                )}
                                {transaction.paymentId && (
                                  <p className="text-gray-500 text-xs">
                                    Payment ID: {transaction.paymentId}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-100">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`font-medium ${
                                transaction.type === "credit"
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {transaction.type === "credit" ? "+" : "-"}
                              {formatCurrency(transaction.netAmount)}
                            </div>
                            {transaction.platformCommission?.amount > 0 && (
                              <div className="text-gray-500 text-sm">
                                Commission:{" "}
                                {formatCurrency(
                                  transaction.platformCommission.amount
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}
                            >
                              {getStatusIcon(transaction.status)}
                              {transaction.status.charAt(0).toUpperCase() +
                                transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                (window.location.href = `/dashboard/wallet/transactions/${transaction._id}`)
                              }
                              icon={<Eye className="w-4 h-4" />}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-dark-600 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Showing {(pagination.currentPage - 1) * 20 + 1} to{" "}
                      {Math.min(
                        pagination.currentPage * 20,
                        pagination.totalTransactions
                      )}{" "}
                      of {pagination.totalTransactions} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!pagination.hasPrevPage}
                        onClick={() =>
                          setCurrentPage(pagination.currentPage - 1)
                        }
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-400">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!pagination.hasNextPage}
                        onClick={() =>
                          setCurrentPage(pagination.currentPage + 1)
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-100 mb-2">
                  No transactions found
                </h3>
                <p className="text-gray-400">
                  {Object.values(filters).some((f) => f) || searchTerm
                    ? "Try adjusting your filters or search terms"
                    : "Transactions will appear here when you receive payments"}
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletTransactions;
