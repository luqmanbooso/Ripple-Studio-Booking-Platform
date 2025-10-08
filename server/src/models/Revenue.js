const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  // Core Revenue Information
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true, // One revenue record per booking
    index: true
  },
  
  // Financial Breakdown
  breakdown: {
    slots: {
      amount: { type: Number, required: true, min: 0 },
      hours: { type: Number, required: true, min: 0 },
      rate: { type: Number, required: true, min: 0 }
    },
    services: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      category: { type: String }
    }],
    equipment: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      hours: { type: Number, required: true, min: 0 },
      rate: { type: Number, required: true, min: 0 }
    }],
    addOns: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      description: { type: String }
    }]
  },
  
  // Totals and Commission
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  platformCommissionRate: {
    type: Number,
    required: true,
    default: 0.10, // 10% default commission
    min: 0,
    max: 1
  },
  
  platformCommission: {
    type: Number,
    required: true,
    min: 0
  },
  
  studioEarnings: {
    type: Number,
    required: true,
    min: 0
  },
  
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Revenue Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'disputed', 'refunded', 'paid_out'],
    default: 'pending',
    index: true
  },
  
  // Payment Information
  paymentDetails: {
    paymentId: { type: String }, // PayHere/Stripe payment ID
    paymentMethod: { type: String }, // card, bank_transfer, etc.
    paymentDate: { type: Date },
    currency: { type: String, default: 'LKR' }
  },
  
  // Refunds and Adjustments
  refunds: [{
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date, default: Date.now },
    refundId: { type: String } // External refund ID
  }],
  
  adjustments: [{
    amount: { type: Number, required: true }, // Can be negative
    reason: { type: String, required: true },
    type: { type: String, enum: ['tip', 'discount', 'fee', 'correction'], required: true },
    appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: Date.now }
  }],
  
  // Payout Information
  payouts: [{
    amount: { type: Number, required: true, min: 0 },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    status: { 
      type: String, 
      enum: ['requested', 'approved', 'processing', 'completed', 'failed'],
      default: 'requested'
    },
    payoutId: { type: String }, // External payout ID
    bankDetails: {
      accountNumber: { type: String },
      bankName: { type: String },
      accountHolder: { type: String }
    },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  }],
  
  // Invoice Information
  invoices: [{
    invoiceNumber: { type: String, required: true, unique: true },
    generatedAt: { type: Date, default: Date.now },
    sentAt: { type: Date },
    paidAt: { type: Date },
    dueDate: { type: Date },
    status: { 
      type: String, 
      enum: ['draft', 'sent', 'viewed', 'paid', 'overdue'],
      default: 'draft'
    },
    pdfPath: { type: String }, // Path to generated PDF
    emailSent: { type: Boolean, default: false }
  }],
  
  // Relationships
  studio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Studio',
    required: true,
    index: true
  },
  
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Metadata
  notes: {
    type: String,
    maxlength: 1000
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  // Audit Trail
  auditLog: [{
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedAt: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
revenueSchema.index({ studio: 1, createdAt: -1 });
revenueSchema.index({ client: 1, createdAt: -1 });
revenueSchema.index({ status: 1, createdAt: -1 });
revenueSchema.index({ 'paymentDetails.paymentDate': -1 });
revenueSchema.index({ 'payouts.status': 1 });

// Virtual for net earnings after refunds and adjustments
revenueSchema.virtual('netEarnings').get(function() {
  const totalRefunds = this.refunds.reduce((sum, refund) => sum + refund.amount, 0);
  const totalAdjustments = this.adjustments.reduce((sum, adj) => sum + adj.amount, 0);
  return Math.max(0, this.studioEarnings - totalRefunds + totalAdjustments);
});

// Virtual for total commission earned by platform
revenueSchema.virtual('totalCommissionEarned').get(function() {
  return this.platformCommission;
});

// Virtual for pending payout amount
revenueSchema.virtual('pendingPayoutAmount').get(function() {
  const completedPayouts = this.payouts
    .filter(payout => payout.status === 'completed')
    .reduce((sum, payout) => sum + payout.amount, 0);
  
  return Math.max(0, this.netEarnings - completedPayouts);
});

// Pre-save middleware to calculate totals
revenueSchema.pre('save', function(next) {
  // Calculate subtotal from breakdown
  const slotsTotal = this.breakdown.slots.amount || 0;
  const servicesTotal = this.breakdown.services.reduce((sum, service) => sum + service.amount, 0);
  const equipmentTotal = this.breakdown.equipment.reduce((sum, equipment) => sum + equipment.amount, 0);
  const addOnsTotal = this.breakdown.addOns.reduce((sum, addOn) => sum + addOn.amount, 0);
  
  this.subtotal = slotsTotal + servicesTotal + equipmentTotal + addOnsTotal;
  
  // Calculate commission and earnings
  this.platformCommission = this.subtotal * this.platformCommissionRate;
  this.studioEarnings = this.subtotal - this.platformCommission;
  this.totalAmount = this.subtotal;
  
  next();
});

// Method to add audit log entry
revenueSchema.methods.addAuditLog = function(action, performedBy, details = {}, ipAddress = null) {
  this.auditLog.push({
    action,
    performedBy,
    details,
    ipAddress
  });
};

// Method to generate invoice number
revenueSchema.methods.generateInvoiceNumber = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  
  return `INV-${year}${month}-${timestamp}`;
};

// Method to calculate revenue breakdown percentages
revenueSchema.methods.getBreakdownPercentages = function() {
  if (this.subtotal === 0) return {};
  
  const slotsTotal = this.breakdown.slots.amount || 0;
  const servicesTotal = this.breakdown.services.reduce((sum, service) => sum + service.amount, 0);
  const equipmentTotal = this.breakdown.equipment.reduce((sum, equipment) => sum + equipment.amount, 0);
  const addOnsTotal = this.breakdown.addOns.reduce((sum, addOn) => sum + addOn.amount, 0);
  
  return {
    slots: Math.round((slotsTotal / this.subtotal) * 100),
    services: Math.round((servicesTotal / this.subtotal) * 100),
    equipment: Math.round((equipmentTotal / this.subtotal) * 100),
    addOns: Math.round((addOnsTotal / this.subtotal) * 100)
  };
};

// Static method to get revenue statistics
revenueSchema.statics.getRevenueStats = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalCommission: { $sum: '$platformCommission' },
        totalStudioEarnings: { $sum: '$studioEarnings' },
        averageBookingValue: { $avg: '$totalAmount' },
        totalBookings: { $sum: 1 },
        confirmedRevenue: {
          $sum: {
            $cond: [{ $eq: ['$status', 'confirmed'] }, '$totalAmount', 0]
          }
        }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalRevenue: 0,
    totalCommission: 0,
    totalStudioEarnings: 0,
    averageBookingValue: 0,
    totalBookings: 0,
    confirmedRevenue: 0
  };
};

module.exports = mongoose.model('Revenue', revenueSchema);
