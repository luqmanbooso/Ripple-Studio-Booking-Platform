import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  CreditCard,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import {
  useGetWalletQuery,
  useGetWalletStatsQuery,
} from "../../store/walletApi";

const WalletDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const {
    data: walletData,
    isLoading: walletLoading,
    error: walletError,
    isError: isWalletError,
  } = useGetWalletQuery(undefined, {
    pollingInterval: 0, // Disable polling
    refetchOnMountOrArgChange: true,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    isError: isStatsError,
  } = useGetWalletStatsQuery(selectedPeriod, {
    skip: !walletData, // Skip until wallet data loads
    pollingInterval: 0,
  });

  // Show loading only if wallet is loading (primary data)
  if (walletLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-400 mt-4">Loading wallet...</p>
        </div>
      </div>
    );
  }

  // Show error if wallet fails to load
  if (isWalletError) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-100 mb-2">
            Error Loading Wallet
          </h2>
          <p className="text-gray-400 mb-4">
            {walletError?.data?.message ||
              walletError?.error ||
              "Unable to load wallet data. Please try again."}
          </p>
          <Button onClick={() => window.location.reload()} variant="primary">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const wallet = walletData?.data?.wallet;
  const stats = statsData?.data;

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
        return <ArrowUpRight className="w-4 h-4 text-green-400" />;
      case "withdrawal":
        return <ArrowDownRight className="w-4 h-4 text-red-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-400" />;
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

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 mb-2">
                My Wallet
              </h1>
              <p className="text-gray-400">
                Manage your earnings and withdrawals
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() =>
                  (window.location.href = "/dashboard/wallet/withdraw")
                }
                icon={<Download className="w-4 h-4" />}
                disabled={
                  !wallet?.balance?.available ||
                  wallet.balance.available <
                    wallet.withdrawalSettings?.minimumAmount
                }
              >
                Withdraw
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Balance Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Available Balance */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-500/20 rounded-lg">
                <Wallet className="w-6 h-6 text-primary-400" />
              </div>
              <span className="text-sm text-gray-400">Available</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-100">
                {formatCurrency(wallet?.balance?.available || 0)}
              </h3>
              <p className="text-gray-400 text-sm mt-1">Ready for withdrawal</p>
            </div>
          </Card>

          {/* Total Earnings */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">Total Earnings</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-100">
                {formatCurrency(wallet?.totalEarnings || 0)}
              </h3>
              <p className="text-gray-400 text-sm mt-1">Lifetime earnings</p>
            </div>
          </Card>

          {/* This Month */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-accent-400" />
              </div>
              <span className="text-sm text-gray-400">This Month</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-100">
                {formatCurrency(stats?.currentMonth?.earnings || 0)}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {parseFloat(stats?.growthPercentage || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span
                  className={`text-sm ${
                    parseFloat(stats?.growthPercentage || 0) >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {Math.abs(stats?.growthPercentage || 0)}% vs last month
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Earnings Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-6">
                Monthly Earnings
              </h3>
              <div className="space-y-4">
                {stats?.monthlyEarnings?.slice(-6).map((month, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-400">{month.month}</span>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-gray-100 font-medium">
                          {formatCurrency(month.earnings)}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {month.bookings} bookings
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-100">
                  Recent Transactions
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    (window.location.href = "/dashboard/wallet/transactions")
                  }
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {stats?.recentTransactions?.length > 0 ? (
                  stats.recentTransactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-3 bg-dark-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="text-gray-100 text-sm font-medium">
                            {transaction.description}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              transaction.type === "credit"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {transaction.type === "credit" ? "+" : "-"}
                            {formatCurrency(transaction.netAmount)}
                          </p>
                        </div>
                        {getStatusIcon(transaction.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No transactions yet</p>
                    <p className="text-gray-500 text-sm">
                      Transactions will appear here when you receive payments
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bank Details & Settings Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Withdrawal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Bank Details
                </h4>
                {wallet?.bankDetails?.accountNumber ? (
                  <div className="text-sm text-gray-400">
                    <p className="capitalize">
                      {wallet.bankDetails.accountType || "Savings"} Account
                    </p>
                    <p>{wallet.bankDetails.bankName}</p>
                    <p>****{wallet.bankDetails.accountNumber?.slice(-4)}</p>
                    <p>{wallet.bankDetails.accountHolderName}</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    <p>No bank details added</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() =>
                        (window.location.href = "/dashboard/wallet/settings")
                      }
                    >
                      Add Bank Details
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Withdrawal Settings
                </h4>
                <div className="text-sm text-gray-400">
                  <p>
                    Minimum withdrawal:{" "}
                    {formatCurrency(
                      wallet?.withdrawalSettings?.minimumAmount || 1000
                    )}
                  </p>
                  <p>
                    Auto withdrawal:{" "}
                    {wallet?.withdrawalSettings?.autoWithdrawal?.enabled
                      ? "Enabled"
                      : "Disabled"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletDashboard;
