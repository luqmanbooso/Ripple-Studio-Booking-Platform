const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required']
  },
  recipientType: {
    type: String,
    enum: ['artist', 'studio'],
    required: [true, 'Recipient type is required']
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Recipient ID is required'],
    refPath: 'recipientType'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  platformFee: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: [true, 'Net amount is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  stripeTransferId: String,
  stripeAccountId: String,
  failureReason: String,
  processedAt: Date,
  completedAt: Date,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
payoutSchema.index({ booking: 1 });
payoutSchema.index({ recipientType: 1, recipientId: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ createdAt: -1 });

// Calculate net amount after platform fee
payoutSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('platformFee')) {
    this.netAmount = this.amount - this.platformFee;
  }
  next();
});

module.exports = mongoose.model('Payout', payoutSchema);
