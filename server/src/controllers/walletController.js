const { Wallet, WalletTransaction } = require("../models/Wallet");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");

/**
 * Get user's wallet information
 */
const getWallet = catchAsync(async (req, res) => {
  let wallet = await Wallet.findOne({ user: req.user._id }).populate(
    "user",
    "name email"
  );

  // Create wallet if it doesn't exist
  if (!wallet) {
    wallet = await Wallet.createWallet(req.user._id);
    await wallet.populate("user", "name email");
  }

  res.json({
    status: "success",
    data: { wallet },
  });
});

/**
 * Get wallet transactions with pagination
 */
const getTransactions = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, type, status, startDate, endDate } = req.query;

  const query = { user: req.user._id };

  // Add filters
  if (type) query.type = type;
  if (status) query.status = status;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      {
        path: "booking",
        select: "scheduledDate duration totalAmount client",
        populate: { path: "client", select: "name email" },
      },
    ],
  };

  const transactions = await WalletTransaction.paginate(query, options);

  res.json({
    status: "success",
    data: {
      transactions: transactions.docs,
      pagination: {
        currentPage: transactions.page,
        totalPages: transactions.totalPages,
        totalTransactions: transactions.totalDocs,
        hasNextPage: transactions.hasNextPage,
        hasPrevPage: transactions.hasPrevPage,
      },
    },
  });
});

/**
 * Get wallet statistics
 */
const getWalletStats = catchAsync(async (req, res) => {
  const { period = "month" } = req.query;

  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    throw new ApiError("Wallet not found", 404);
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Get current month earnings
  const currentMonthStats = await wallet.getMonthlyEarnings(
    currentYear,
    currentMonth
  );

  // Get previous month earnings
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const previousMonthStats = await wallet.getMonthlyEarnings(
    prevYear,
    prevMonth
  );

  // Calculate growth percentage
  const growthPercentage =
    previousMonthStats.totalNetAmount > 0
      ? ((currentMonthStats.totalNetAmount -
          previousMonthStats.totalNetAmount) /
          previousMonthStats.totalNetAmount) *
        100
      : 0;

  // Get recent transactions
  const recentTransactions = await WalletTransaction.find({
    user: req.user._id,
    status: "completed",
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("booking", "scheduledDate client")
    .populate({
      path: "booking",
      populate: { path: "client", select: "name" },
    });

  // Get monthly earnings for the last 12 months using aggregation (much faster)
  const twelveMonthsAgo = new Date(currentYear, currentMonth - 13, 1);

  const monthlyEarningsAggregation = await WalletTransaction.aggregate([
    {
      $match: {
        user: req.user._id,
        status: "completed",
        type: "credit",
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalEarnings: { $sum: "$netAmount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  // Create a map for quick lookup
  const earningsMap = new Map();
  monthlyEarningsAggregation.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    earningsMap.set(key, {
      earnings: item.totalEarnings,
      bookings: item.count,
    });
  });

  // Build the monthly earnings array with all 12 months
  const monthlyEarnings = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;
    const data = earningsMap.get(key) || { earnings: 0, bookings: 0 };

    monthlyEarnings.push({
      month: date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
      earnings: data.earnings,
      bookings: data.bookings,
    });
  }

  res.json({
    status: "success",
    data: {
      currentBalance: wallet.balance,
      totalEarnings: wallet.totalEarnings,
      totalWithdrawals: wallet.totalWithdrawals,
      currentMonth: {
        earnings: currentMonthStats.totalNetAmount,
        bookings: currentMonthStats.count,
        commission: currentMonthStats.totalCommission,
      },
      previousMonth: {
        earnings: previousMonthStats.totalNetAmount,
        bookings: previousMonthStats.count,
      },
      growthPercentage: growthPercentage.toFixed(1),
      recentTransactions,
      monthlyEarnings,
      withdrawalSettings: wallet.withdrawalSettings,
    },
  });
});

/**
 * Request withdrawal
 */
const requestWithdrawal = catchAsync(async (req, res) => {
  const { amount, bankDetails } = req.body;

  if (!amount || amount <= 0) {
    throw new ApiError("Invalid withdrawal amount", 400);
  }

  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    throw new ApiError("Wallet not found", 404);
  }

  if (amount > wallet.balance.available) {
    throw new ApiError("Insufficient balance", 400);
  }

  if (amount < wallet.withdrawalSettings.minimumAmount) {
    throw new ApiError(
      `Minimum withdrawal amount is ${wallet.withdrawalSettings.minimumAmount} LKR`,
      400
    );
  }

  // Update bank details if provided
  if (bankDetails) {
    wallet.bankDetails = { ...wallet.bankDetails, ...bankDetails };
    await wallet.save();
  }

  // Create withdrawal transaction
  const withdrawalData = {
    type: "withdrawal",
    amount: amount,
    netAmount: amount,
    description: `Withdrawal request for ${amount} LKR`,
    status: "pending",
    withdrawalDetails: {
      bankAccount: wallet.bankDetails.bankName,
      accountNumber: wallet.bankDetails.accountNumber,
      accountHolderName: wallet.bankDetails.accountHolderName,
      withdrawalMethod: "bank_transfer",
    },
  };

  const transaction = await wallet.addTransaction(withdrawalData);

  logger.info(`Withdrawal requested: ${amount} LKR by user ${req.user._id}`);

  res.json({
    status: "success",
    message: "Withdrawal request submitted successfully",
    data: { transaction },
  });
});

/**
 * Update bank details
 */
const updateBankDetails = catchAsync(async (req, res) => {
  const {
    bankName,
    accountNumber,
    accountHolderName,
    accountType,
    branchCode,
    swiftCode,
  } = req.body;

  let wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    wallet = await Wallet.createWallet(req.user._id);
  }

  wallet.bankDetails = {
    bankName,
    accountNumber,
    accountHolderName,
    accountType: accountType || "savings",
    branchCode,
    swiftCode,
    isVerified: false, // Reset verification status
  };

  await wallet.save();

  res.json({
    status: "success",
    message: "Bank details updated successfully",
    data: { bankDetails: wallet.bankDetails },
  });
});

/**
 * Update withdrawal settings
 */
const updateWithdrawalSettings = catchAsync(async (req, res) => {
  const { minimumAmount, autoWithdrawal } = req.body;

  let wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    wallet = await Wallet.createWallet(req.user._id);
  }

  if (minimumAmount !== undefined) {
    wallet.withdrawalSettings.minimumAmount = minimumAmount;
  }

  if (autoWithdrawal !== undefined) {
    wallet.withdrawalSettings.autoWithdrawal = autoWithdrawal;
  }

  await wallet.save();

  res.json({
    status: "success",
    message: "Withdrawal settings updated successfully",
    data: { withdrawalSettings: wallet.withdrawalSettings },
  });
});

/**
 * Get transaction details
 */
const getTransaction = catchAsync(async (req, res) => {
  const { transactionId } = req.params;

  const transaction = await WalletTransaction.findOne({
    _id: transactionId,
    user: req.user._id,
  }).populate([
    {
      path: "booking",
      populate: { path: "client studio artist", select: "name email" },
    },
    { path: "user", select: "name email" },
  ]);

  if (!transaction) {
    throw new ApiError("Transaction not found", 404);
  }

  res.json({
    status: "success",
    data: { transaction },
  });
});

/**
 * Admin: Get all withdrawal requests
 */
const getWithdrawalRequests = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status = "pending" } = req.query;

  const query = {
    type: "withdrawal",
    status: status,
  };

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [{ path: "user", select: "name email phone" }],
  };

  const withdrawals = await WalletTransaction.paginate(query, options);

  res.json({
    status: "success",
    data: {
      withdrawals: withdrawals.docs,
      pagination: {
        currentPage: withdrawals.page,
        totalPages: withdrawals.totalPages,
        totalWithdrawals: withdrawals.totalDocs,
        hasNextPage: withdrawals.hasNextPage,
        hasPrevPage: withdrawals.hasPrevPage,
      },
    },
  });
});

/**
 * Admin: Process withdrawal request
 */
const processWithdrawal = catchAsync(async (req, res) => {
  const { transactionId } = req.params;
  const { status, remarks } = req.body;

  if (!["completed", "failed"].includes(status)) {
    throw new ApiError("Invalid status. Must be 'completed' or 'failed'", 400);
  }

  const transaction = await WalletTransaction.findOne({
    _id: transactionId,
    type: "withdrawal",
    status: "pending",
  });

  if (!transaction) {
    throw new ApiError(
      "Withdrawal request not found or already processed",
      404
    );
  }

  transaction.status = status;
  transaction.withdrawalDetails.processedAt = new Date();
  transaction.withdrawalDetails.processedBy = req.user._id;

  if (remarks) {
    transaction.description += ` - Admin remarks: ${remarks}`;
  }

  await transaction.save();

  // If withdrawal failed, credit back the amount to wallet
  if (status === "failed") {
    const wallet = await Wallet.findOne({ user: transaction.user });
    if (wallet) {
      // Update wallet balance
      wallet.balance.available += transaction.amount;
      wallet.balance.total += transaction.amount;
      await wallet.save();

      // Create a credit transaction record for audit trail
      const creditTransaction = await WalletTransaction.create({
        wallet: wallet._id,
        user: transaction.user,
        type: "credit",
        amount: transaction.amount,
        status: "completed",
        description: `Refund for rejected withdrawal request. Reason: ${remarks || "Withdrawal rejected by admin"}`,
        metadata: {
          rejectedWithdrawalId: transaction._id,
          processedBy: req.user._id,
          originalWithdrawalDate: transaction.createdAt,
        },
      });

      logger.info(
        `Credited back ${transaction.amount} to wallet for rejected withdrawal ${transactionId}, credit transaction: ${creditTransaction._id}`
      );
    }
  }

  logger.info(
    `Withdrawal ${status} by admin ${req.user._id} for transaction ${transactionId}`
  );

  res.json({
    status: "success",
    message: `Withdrawal request ${status} successfully`,
    data: { transaction },
  });
});

module.exports = {
  getWallet,
  getTransactions,
  getWalletStats,
  requestWithdrawal,
  updateBankDetails,
  updateWithdrawalSettings,
  getTransaction,
  getWithdrawalRequests,
  processWithdrawal,
};
