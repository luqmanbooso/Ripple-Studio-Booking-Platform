const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const walletTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit", "withdrawal", "commission_deduction"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "LKR",
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    paymentId: {
      type: String, // PayHere payment ID
    },
    orderId: {
      type: String, // PayHere order ID
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    platformCommission: {
      rate: {
        type: Number,
        default: 0,
      },
      amount: {
        type: Number,
        default: 0,
      },
    },
    netAmount: {
      type: Number, // Amount after commission deduction
      required: true,
    },
    withdrawalDetails: {
      bankAccount: String,
      accountNumber: String,
      accountHolderName: String,
      withdrawalMethod: {
        type: String,
        enum: ["bank_transfer", "payhere_payout"],
      },
      processedAt: Date,
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    metadata: {
      paymentMethod: String,
      paymentGateway: String,
      customerName: String,
      studioName: String,
    },
  },
  {
    timestamps: true,
  }
);

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      available: {
        type: Number,
        default: 0,
        min: 0,
      },
      pending: {
        type: Number,
        default: 0,
        min: 0,
      },
      total: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    currency: {
      type: String,
      default: "LKR",
      uppercase: true,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWithdrawals: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCommissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      accountHolderName: String,
      accountType: {
        type: String,
        enum: ["savings", "current", "checking"],
        default: "savings",
      },
      branchCode: String,
      swiftCode: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
    withdrawalSettings: {
      minimumAmount: {
        type: Number,
        default: 1000, // Minimum withdrawal amount in LKR
      },
      autoWithdrawal: {
        enabled: {
          type: Boolean,
          default: false,
        },
        threshold: {
          type: Number,
          default: 10000,
        },
      },
    },
    statistics: {
      totalBookings: {
        type: Number,
        default: 0,
      },
      averageBookingValue: {
        type: Number,
        default: 0,
      },
      thisMonthEarnings: {
        type: Number,
        default: 0,
      },
      lastMonthEarnings: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTransactionAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ type: 1, status: 1 });
walletTransactionSchema.index({ booking: 1 });
walletTransactionSchema.index({ paymentId: 1 });

// Add pagination plugin
walletTransactionSchema.plugin(mongoosePaginate);

walletSchema.index({ user: 1 });

// Virtual for available balance calculation
walletSchema.virtual("availableForWithdrawal").get(function () {
  return this.balance.available;
});

// Methods
walletSchema.methods.addTransaction = async function (transactionData) {
  const WalletTransaction = mongoose.model("WalletTransaction");

  const transaction = new WalletTransaction({
    user: this.user,
    ...transactionData,
  });

  await transaction.save();

  // Update wallet balance
  if (transaction.type === "credit" && transaction.status === "completed") {
    this.balance.available += transaction.netAmount;
    this.balance.total += transaction.netAmount;
    this.totalEarnings += transaction.amount;
    this.totalCommissions += transaction.platformCommission.amount;
  } else if (
    transaction.type === "debit" ||
    transaction.type === "withdrawal"
  ) {
    this.balance.available -= transaction.amount;
    this.balance.total -= transaction.amount;
    if (transaction.type === "withdrawal") {
      this.totalWithdrawals += transaction.amount;
    }
  }

  this.lastTransactionAt = new Date();
  await this.save();

  return transaction;
};

walletSchema.methods.getMonthlyEarnings = async function (year, month) {
  const WalletTransaction = mongoose.model("WalletTransaction");

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const result = await WalletTransaction.aggregate([
    {
      $match: {
        user: this.user,
        type: "credit",
        status: "completed",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalNetAmount: { $sum: "$netAmount" },
        totalCommission: { $sum: "$platformCommission.amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0
    ? result[0]
    : {
        totalAmount: 0,
        totalNetAmount: 0,
        totalCommission: 0,
        count: 0,
      };
};

// Static methods
walletSchema.statics.createWallet = async function (userId) {
  const existingWallet = await this.findOne({ user: userId });
  if (existingWallet) {
    return existingWallet;
  }

  const wallet = new this({
    user: userId,
    balance: {
      available: 0,
      pending: 0,
      total: 0,
    },
  });

  return await wallet.save();
};

walletSchema.statics.creditFromBooking = async function (
  booking,
  paymentDetails
) {
  const wallet = await this.findOne({
    user: booking.studio.user || booking.artist.user,
  });
  if (!wallet) {
    throw new Error("Wallet not found for user");
  }

  // Calculate platform commission (default 7.1%)
  const commissionRate = process.env.PLATFORM_COMMISSION_RATE || 0.071;
  const bookingAmount = booking.totalAmount || booking.price; // Support both field names
  const commissionAmount = bookingAmount * commissionRate;
  const netAmount = bookingAmount - commissionAmount;

  const transactionData = {
    type: "credit",
    amount: bookingAmount,
    netAmount: netAmount,
    description: `Payment received for booking ${booking._id}`,
    booking: booking._id,
    paymentId: paymentDetails.paymentId,
    orderId: paymentDetails.orderId,
    status: "completed",
    platformCommission: {
      rate: commissionRate,
      amount: commissionAmount,
    },
    metadata: {
      paymentMethod: paymentDetails.method,
      paymentGateway: "PayHere",
      customerName: booking.client.name,
      studioName: booking.studio?.name || booking.artist?.user?.name,
    },
  };

  return await wallet.addTransaction(transactionData);
};

const WalletTransaction = mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);
const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = { Wallet, WalletTransaction };
