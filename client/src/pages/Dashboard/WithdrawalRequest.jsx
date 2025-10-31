import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Building,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Banknote,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import {
  useGetWalletQuery,
  useRequestWithdrawalMutation,
  useUpdateBankDetailsMutation,
} from "../../store/walletApi";

const WithdrawalRequest = () => {
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [note, setNote] = useState("");
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    accountType: "savings",
    branchCode: "",
    swiftCode: "",
  });
  const [showBankForm, setShowBankForm] = useState(false);

  const { data: walletData, isLoading: walletLoading } = useGetWalletQuery();
  const [requestWithdrawal, { isLoading: withdrawalLoading }] =
    useRequestWithdrawalMutation();
  const [updateBankDetails, { isLoading: bankUpdateLoading }] =
    useUpdateBankDetailsMutation();

  const wallet = walletData?.data?.wallet;
  const minWithdrawal = 1000; // LKR 1000 minimum
  const maxWithdrawal = wallet?.balance?.available || 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleBankDetailsSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBankDetails(bankDetails).unwrap();
      setShowBankForm(false);
      // Show success message
    } catch (error) {
      console.error("Failed to update bank details:", error);
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(withdrawalAmount);

    if (amount < minWithdrawal) {
      alert(`Minimum withdrawal amount is ${formatCurrency(minWithdrawal)}`);
      return;
    }

    if (amount > maxWithdrawal) {
      alert(
        `Insufficient balance. Available: ${formatCurrency(maxWithdrawal)}`
      );
      return;
    }

    try {
      await requestWithdrawal({
        amount,
        note: note.trim() || undefined,
      }).unwrap();

      // Reset form
      setWithdrawalAmount("");
      setNote("");

      // Show success message
      alert("Withdrawal request submitted successfully!");

      // Redirect to wallet
      window.location.href = "/dashboard/wallet";
    } catch (error) {
      console.error("Failed to request withdrawal:", error);
      alert("Failed to submit withdrawal request. Please try again.");
    }
  };

  const quickAmounts = [5000, 10000, 25000, 50000];

  if (walletLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container py-8 max-w-4xl">
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
                Request Withdrawal
              </h1>
              <p className="text-gray-400">
                Withdraw your earnings to your bank account
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Balance Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">
                Available Balance
              </h3>
              <div className="text-center py-6">
                <div className="text-3xl font-bold text-primary-400 mb-2">
                  {formatCurrency(wallet?.balance?.available || 0)}
                </div>
                <p className="text-gray-400 text-sm">Ready for withdrawal</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-dark-600">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Earnings</span>
                  <span className="text-gray-100">
                    {formatCurrency(wallet?.totalEarnings || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Withdrawn</span>
                  <span className="text-gray-100">
                    {formatCurrency(wallet?.totalWithdrawals || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pending Withdrawals</span>
                  <span className="text-yellow-400">
                    {formatCurrency(wallet?.balance?.pending || 0)}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-dark-700 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-gray-300 font-medium mb-1">
                      Withdrawal Information
                    </p>
                    <ul className="text-gray-400 space-y-1">
                      <li>• Minimum: {formatCurrency(minWithdrawal)}</li>
                      <li>• Processing: 3-5 business days</li>
                      <li>• No fees for withdrawals</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bank Details Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-100">
                  Bank Details
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowBankForm(!showBankForm)}
                >
                  {wallet?.bankDetails ? "Update" : "Add"}
                </Button>
              </div>

              {wallet?.bankDetails ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-100">
                      {wallet.bankDetails.bankName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-100">
                      ****{wallet.bankDetails.accountNumber.slice(-4)}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      ({wallet.bankDetails.accountType || "savings"})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-100">
                      {wallet.bankDetails.accountHolderName}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    No bank details added yet
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {!showBankForm ? (
              /* Withdrawal Form */
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-6">
                  Withdrawal Request
                </h3>

                <form onSubmit={handleWithdrawalSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Withdrawal Amount (LKR)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min={minWithdrawal}
                        max={maxWithdrawal}
                        step="0.01"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        placeholder={`Min ${minWithdrawal.toLocaleString()}`}
                        className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        Available: {formatCurrency(maxWithdrawal)}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setWithdrawalAmount(maxWithdrawal.toString())
                        }
                      >
                        Max
                      </Button>
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quick Amounts
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={amount > maxWithdrawal}
                          onClick={() => setWithdrawalAmount(amount.toString())}
                          className="text-sm"
                        >
                          {formatCurrency(amount)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Note (Optional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a note for this withdrawal..."
                      rows={3}
                      className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Withdrawal Conditions */}
                  <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-primary-300 font-medium mb-2">
                          Before you proceed:
                        </p>
                        <ul className="text-gray-300 space-y-1">
                          <li>• Ensure your bank details are correct</li>
                          <li>
                            • Withdrawals are processed within 3-5 business days
                          </li>
                          <li>• You'll receive an email confirmation</li>
                          <li>
                            • Contact support if you don't receive payment
                            within 7 days
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.history.back()}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        !wallet?.bankDetails ||
                        withdrawalLoading ||
                        !withdrawalAmount
                      }
                      isLoading={withdrawalLoading}
                      className="flex-1"
                      icon={<Banknote className="w-4 h-4" />}
                    >
                      Request Withdrawal
                    </Button>
                  </div>

                  {!wallet?.bankDetails && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <p className="text-yellow-300 text-sm">
                          You need to add your bank details before requesting a
                          withdrawal.
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </Card>
            ) : (
              /* Bank Details Form */
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-6">
                  {wallet?.bankDetails ? "Update" : "Add"} Bank Details
                </h3>

                <form onSubmit={handleBankDetailsSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Type
                    </label>
                    <select
                      value={bankDetails.accountType}
                      onChange={(e) =>
                        setBankDetails((prev) => ({
                          ...prev,
                          accountType: e.target.value,
                        }))
                      }
                      className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="savings">Savings Account</option>
                      <option value="current">Current Account</option>
                      <option value="checking">Checking Account</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) =>
                        setBankDetails((prev) => ({
                          ...prev,
                          bankName: e.target.value,
                        }))
                      }
                      placeholder="e.g., Commercial Bank of Ceylon"
                      className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) =>
                        setBankDetails((prev) => ({
                          ...prev,
                          accountNumber: e.target.value,
                        }))
                      }
                      placeholder="Enter your account number"
                      className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={bankDetails.accountHolderName}
                      onChange={(e) =>
                        setBankDetails((prev) => ({
                          ...prev,
                          accountHolderName: e.target.value,
                        }))
                      }
                      placeholder="Name as per bank account"
                      className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Branch Code
                      </label>
                      <input
                        type="text"
                        value={bankDetails.branchCode}
                        onChange={(e) =>
                          setBankDetails((prev) => ({
                            ...prev,
                            branchCode: e.target.value,
                          }))
                        }
                        placeholder="e.g., 001"
                        className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SWIFT Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={bankDetails.swiftCode}
                        onChange={(e) =>
                          setBankDetails((prev) => ({
                            ...prev,
                            swiftCode: e.target.value,
                          }))
                        }
                        placeholder="e.g., CCEYLKLX"
                        className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBankForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      isLoading={bankUpdateLoading}
                      className="flex-1"
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Save Bank Details
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalRequest;
