import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Building,
  CreditCard,
  Calendar,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  useGetWithdrawalRequestsQuery,
  useProcessWithdrawalMutation,
} from "../../store/adminApi";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";

const AdminPayouts = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processStatus, setProcessStatus] = useState("completed");
  const [remarks, setRemarks] = useState("");

  const {
    data: withdrawalsData,
    isLoading,
    error,
    refetch,
  } = useGetWithdrawalRequestsQuery({
    page: currentPage,
    limit: 20,
    status: statusFilter,
  });

  const [processWithdrawal, { isLoading: isProcessing }] =
    useProcessWithdrawalMutation();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleProcessWithdrawal = async () => {
    if (!selectedWithdrawal) return;

    try {
      await processWithdrawal({
        transactionId: selectedWithdrawal._id,
        status: processStatus,
        remarks: remarks.trim(),
      }).unwrap();

      toast.success(
        `Withdrawal ${processStatus === "completed" ? "approved" : "rejected"} successfully!`
      );
      setShowProcessModal(false);
      setSelectedWithdrawal(null);
      setRemarks("");
      refetch();
    } catch (error) {
      console.error("Failed to process withdrawal:", error);
      toast.error(error?.data?.message || "Failed to process withdrawal");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-500/10",
        text: "text-yellow-500",
        icon: Clock,
        label: "Pending",
      },
      completed: {
        bg: "bg-green-500/10",
        text: "text-green-500",
        icon: CheckCircle,
        label: "Completed",
      },
      failed: {
        bg: "bg-red-500/10",
        text: "text-red-500",
        icon: XCircle,
        label: "Failed",
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${badge.bg}`}
      >
        <Icon className={`w-3.5 h-3.5 ${badge.text}`} />
        <span className={`text-sm font-medium ${badge.text}`}>
          {badge.label}
        </span>
      </div>
    );
  };

  const withdrawals = withdrawalsData?.data?.withdrawals || [];
  const pagination = withdrawalsData?.data?.pagination || {};

  const filteredWithdrawals = withdrawals.filter(
    (w) =>
      w.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: withdrawals.length,
    totalAmount: withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 mb-2">
                Payout Management
              </h1>
              <p className="text-gray-400">
                Review and process studio owner withdrawal requests
              </p>
            </div>
            <Button
              variant="outline"
              onClick={refetch}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <p className="text-2xl font-bold text-gray-100 capitalize">
                    {statusFilter}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Filter className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {["pending", "completed", "failed"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "primary" : "outline"}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Withdrawals List */}
        {error ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-100 mb-2">
              Error Loading Withdrawals
            </h3>
            <p className="text-gray-400 mb-4">
              {error?.data?.message || "Failed to load withdrawal requests"}
            </p>
            <Button onClick={refetch}>Try Again</Button>
          </Card>
        ) : filteredWithdrawals.length === 0 ? (
          <Card className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-100 mb-2">
              No {statusFilter} withdrawals
            </h3>
            <p className="text-gray-400">
              {searchTerm
                ? "No withdrawals match your search"
                : `There are no ${statusFilter} withdrawal requests at the moment`}
            </p>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {filteredWithdrawals.map((withdrawal, index) => (
              <motion.div
                key={withdrawal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Section: User & Amount Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-100">
                                {withdrawal.user?.name || "Unknown User"}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {withdrawal.user?.email}
                              </p>
                            </div>
                          </div>
                          {withdrawal.user?.phone && (
                            <p className="text-sm text-gray-400 ml-8">
                              {withdrawal.user.phone}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(withdrawal.status)}
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Amount</p>
                          <p className="text-xl font-bold text-primary-500">
                            {formatCurrency(withdrawal.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">
                            Net Amount
                          </p>
                          <p className="text-lg font-semibold text-gray-100">
                            {formatCurrency(
                              withdrawal.netAmount || withdrawal.amount
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">
                            Requested
                          </p>
                          <p className="text-sm text-gray-300">
                            {formatDate(withdrawal.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">
                            Transaction ID
                          </p>
                          <p className="text-sm text-gray-300 font-mono">
                            {withdrawal._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      {/* Bank Details */}
                      {withdrawal.withdrawalDetails?.bankAccount && (
                        <div className="p-4 bg-dark-800 rounded-lg space-y-2">
                          <p className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Bank Details
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-gray-400">Bank</p>
                              <p className="text-gray-100">
                                {withdrawal.withdrawalDetails.bankAccount}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Account Number</p>
                              <p className="text-gray-100 font-mono">
                                {withdrawal.withdrawalDetails.accountNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Account Holder</p>
                              <p className="text-gray-100">
                                {withdrawal.withdrawalDetails.accountHolderName}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {withdrawal.description && (
                        <div className="text-sm text-gray-400">
                          <p className="font-medium text-gray-300 mb-1">
                            Note:
                          </p>
                          <p>{withdrawal.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Right Section: Actions */}
                    {withdrawal.status === "pending" && (
                      <div className="flex flex-col gap-2 lg:ml-6">
                        <Button
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setProcessStatus("completed");
                            setShowProcessModal(true);
                          }}
                          icon={<CheckCircle className="w-4 h-4" />}
                          className="whitespace-nowrap"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setProcessStatus("failed");
                            setShowProcessModal(true);
                          }}
                          icon={<XCircle className="w-4 h-4" />}
                          className="whitespace-nowrap"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!pagination.hasPrevPage}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!pagination.hasNextPage}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Process Modal */}
      {showProcessModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-100 mb-4">
              {processStatus === "completed" ? "Approve" : "Reject"} Withdrawal
            </h3>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-dark-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Amount</p>
                <p className="text-2xl font-bold text-primary-500">
                  {formatCurrency(selectedWithdrawal.amount)}
                </p>
              </div>

              <div className="p-4 bg-dark-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Studio Owner</p>
                <p className="text-lg font-semibold text-gray-100">
                  {selectedWithdrawal.user?.name}
                </p>
                <p className="text-sm text-gray-400">
                  {selectedWithdrawal.user?.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Remarks{" "}
                  {processStatus === "failed" && (
                    <span className="text-red-500">* Required</span>
                  )}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={`${processStatus === "failed" ? "Please provide a reason for rejection (required)" : "Add remarks for approval (optional)"}...`}
                  rows={3}
                  className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  required={processStatus === "failed"}
                  autoFocus={processStatus === "failed"}
                />
                {processStatus === "failed" && !remarks.trim() && (
                  <p className="text-xs text-red-400 mt-1">
                    You must provide a reason to reject this withdrawal
                  </p>
                )}
              </div>

              {processStatus === "failed" && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">
                    ⚠️ The amount will be credited back to the studio owner's
                    wallet
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowProcessModal(false);
                  setSelectedWithdrawal(null);
                  setRemarks("");
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProcessWithdrawal}
                disabled={
                  isProcessing ||
                  (processStatus === "failed" && !remarks.trim())
                }
                className={`flex-1 ${
                  processStatus === "completed"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                icon={
                  processStatus === "completed" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )
                }
              >
                {isProcessing
                  ? "Processing..."
                  : processStatus === "completed"
                    ? "Approve"
                    : "Reject"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;
