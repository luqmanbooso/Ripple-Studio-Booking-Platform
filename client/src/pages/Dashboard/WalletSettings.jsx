import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader,
} from "lucide-react";
import {
  useGetWalletQuery,
  useUpdateBankDetailsMutation,
} from "../../store/walletApi";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

const WalletSettings = () => {
  const navigate = useNavigate();
  const {
    data: walletData,
    isLoading: walletLoading,
    error: walletError,
  } = useGetWalletQuery();
  const [updateBankDetails, { isLoading: updateLoading }] =
    useUpdateBankDetailsMutation();

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    accountType: "savings",
    branchCode: "",
    swiftCode: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Populate form with existing bank details
  useEffect(() => {
    if (walletData?.wallet?.bankDetails) {
      setBankDetails({
        bankName: walletData.wallet.bankDetails.bankName || "",
        accountNumber: walletData.wallet.bankDetails.accountNumber || "",
        accountHolderName:
          walletData.wallet.bankDetails.accountHolderName || "",
        accountType: walletData.wallet.bankDetails.accountType || "savings",
        branchCode: walletData.wallet.bankDetails.branchCode || "",
        swiftCode: walletData.wallet.bankDetails.swiftCode || "",
      });
    }
  }, [walletData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    // Basic validation
    if (
      !bankDetails.bankName ||
      !bankDetails.accountNumber ||
      !bankDetails.accountHolderName
    ) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    console.log("=== SUBMITTING BANK DETAILS ===");
    console.log("Bank Details Object:", JSON.stringify(bankDetails, null, 2));
    console.log("Update Loading State:", updateLoading);

    try {
      console.log("Calling updateBankDetails mutation...");
      const result = await updateBankDetails(bankDetails).unwrap();
      console.log("✅ SUCCESS! Result:", result);
      setSuccessMessage("Bank details saved successfully! Redirecting...");

      // Navigate after showing success message
      setTimeout(() => {
        navigate("/dashboard/wallet", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("❌ ERROR CAUGHT:", error);
      console.error("Error details:", {
        status: error?.status,
        data: error?.data,
        message: error?.message,
        originalStatus: error?.originalStatus,
      });
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        "Failed to update bank details. Please try again.";
      setErrorMessage(errorMsg);
    }
  };

  if (walletLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (walletError) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-100 mb-2">
              Error Loading Wallet
            </h3>
            <p className="text-gray-400 mb-4">
              {walletError?.data?.message || "Unable to load wallet data"}
            </p>
            <Button onClick={() => navigate("/dashboard/wallet")}>
              Back to Wallet
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const wallet = walletData?.wallet;
  const hasExistingBankDetails = wallet?.bankDetails?.accountNumber;

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/wallet")}
            className="mb-4"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Wallet
          </Button>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            {hasExistingBankDetails ? "Update" : "Add"} Bank Details
          </h1>
          <p className="text-gray-400">
            {hasExistingBankDetails
              ? "Update your savings account details for withdrawals"
              : "Add your savings account details to receive withdrawals"}
          </p>
        </motion.div>

        {/* Success/Error Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-500">{successMessage}</p>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500">{errorMessage}</p>
          </motion.div>
        )}

        {/* Bank Details Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary-500/10 rounded-lg">
                <Building2 className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100">
                  Bank Account Information
                </h2>
                <p className="text-sm text-gray-400">
                  Enter your savings account details below
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setBankDetails((prev) => ({
                        ...prev,
                        accountType: "savings",
                      }))
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      bankDetails.accountType === "savings"
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-dark-600 bg-dark-700 hover:border-dark-500"
                    }`}
                  >
                    <CreditCard
                      className={`w-6 h-6 mx-auto mb-2 ${
                        bankDetails.accountType === "savings"
                          ? "text-primary-500"
                          : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        bankDetails.accountType === "savings"
                          ? "text-primary-500"
                          : "text-gray-400"
                      }`}
                    >
                      Savings
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBankDetails((prev) => ({
                        ...prev,
                        accountType: "current",
                      }))
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      bankDetails.accountType === "current"
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-dark-600 bg-dark-700 hover:border-dark-500"
                    }`}
                  >
                    <CreditCard
                      className={`w-6 h-6 mx-auto mb-2 ${
                        bankDetails.accountType === "current"
                          ? "text-primary-500"
                          : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        bankDetails.accountType === "current"
                          ? "text-primary-500"
                          : "text-gray-400"
                      }`}
                    >
                      Current
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBankDetails((prev) => ({
                        ...prev,
                        accountType: "checking",
                      }))
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      bankDetails.accountType === "checking"
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-dark-600 bg-dark-700 hover:border-dark-500"
                    }`}
                  >
                    <CreditCard
                      className={`w-6 h-6 mx-auto mb-2 ${
                        bankDetails.accountType === "checking"
                          ? "text-primary-500"
                          : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        bankDetails.accountType === "checking"
                          ? "text-primary-500"
                          : "text-gray-400"
                      }`}
                    >
                      Checking
                    </p>
                  </button>
                </div>
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bank Name <span className="text-red-500">*</span>
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
                  className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Holder Name <span className="text-red-500">*</span>
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
                  className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Number <span className="text-red-500">*</span>
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
                  className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Branch Code & SWIFT Code */}
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
                    className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                    className="w-full p-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-400">
                    <p className="font-medium mb-1">Important Information</p>
                    <ul className="space-y-1 text-blue-400/80">
                      <li>• Ensure your bank details are accurate</li>
                      <li>• Only savings accounts are currently supported</li>
                      <li>• Withdrawals will be processed to this account</li>
                      <li>• It may take 2-3 business days for verification</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/wallet")}
                  className="flex-1 sm:order-1"
                  disabled={updateLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 sm:order-2"
                  icon={!updateLoading && <CheckCircle className="w-4 h-4" />}
                >
                  {updateLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    `Save ${hasExistingBankDetails ? "Changes" : "Bank Details"}`
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletSettings;
