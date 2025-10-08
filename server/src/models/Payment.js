const mongoose = require('mongoose');

/**
 * Payment Model - Comprehensive tracking for all payments
 * This model serves as an immutable record of payment transactions
 * It duplicates booking details at the time of payment for audit purposes
 */
const paymentSchema = new mongoose.Schema(
  {
    // Reference to booking
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    
    // Payment identifiers
    payhereOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    payherePaymentId: {
      type: String,
      index: true
    },
    
    // Payment status tracking
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded', 'Chargeback'],
      default: 'Pending',
      index: true
    },
    
    // Amount details
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    
    // Refund tracking
    refundAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    refundReason: String,
    refundedAt: Date,
    refundInitiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Payment method details
    paymentMethod: {
      type: String,
      enum: ['card', 'bank', 'wallet', 'other'],
      default: 'card'
    },
    cardType: String, // visa, mastercard, amex, etc.
    cardLast4: String,
    
    // Duplicated booking snapshot for immutability
    bookingSnapshot: {
      // Client information
      client: {
        id: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String,
        phone: String
      },
      
      // Studio information
      studio: {
        id: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String
      },
      
      // Service details
      service: {
        name: String,
        price: Number,
        durationMins: Number,
        description: String
      },
      
      // Multiple services support
      services: [{
        name: String,
        price: Number,
        description: String,
        category: String
      }],
      
      // Equipment rentals
      equipment: [{
        equipmentId: mongoose.Schema.Types.ObjectId,
        name: String,
        rentalPrice: Number,
        rentalDuration: String
      }],
      
      // Booking time
      start: Date,
      end: Date,
      
      // Notes
      notes: String,
      clientNotes: String
    },
    
    // PayHere specific data
    payhereData: {
      merchant_id: String,
      method: String,
      status_message: String,
      card_holder_name: String,
      card_no: String, // Masked
      custom_1: String,
      custom_2: String
    },
    
    // Transaction timestamps
    initiatedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    failedAt: Date,
    
    // Webhook tracking
    webhookReceived: {
      type: Boolean,
      default: false
    },
    webhookReceivedAt: Date,
    webhookPayload: mongoose.Schema.Types.Mixed,
    
    // Status change history for audit trail
    statusHistory: [{
      status: String,
      changedAt: {
        type: Date,
        default: Date.now
      },
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      notes: String
    }],
    
    // Error tracking
    errorMessage: String,
    errorCode: String,
    
    // Metadata
    metadata: mongoose.Schema.Types.Mixed
  },
  {
    timestamps: true
  }
);

// Indexes for performance
paymentSchema.index({ booking: 1, status: 1 });
paymentSchema.index({ 'bookingSnapshot.client.id': 1 });
paymentSchema.index({ 'bookingSnapshot.studio.id': 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Virtual for net amount after refund
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - (this.refundAmount || 0);
});

// Method to add status change to history
paymentSchema.methods.addStatusChange = function(status, changedBy, reason, notes) {
  this.statusHistory.push({
    status,
    changedAt: new Date(),
    changedBy,
    reason,
    notes
  });
  this.status = status;
};

// Method to mark as completed
paymentSchema.methods.markCompleted = function(paymentId, payhereData) {
  this.status = 'Completed';
  this.payherePaymentId = paymentId;
  this.completedAt = new Date();
  this.webhookReceived = true;
  this.webhookReceivedAt = new Date();
  
  if (payhereData) {
    this.payhereData = {
      ...this.payhereData,
      ...payhereData
    };
    this.paymentMethod = payhereData.method || this.paymentMethod;
    this.cardType = payhereData.card_type;
    if (payhereData.card_no) {
      this.cardLast4 = payhereData.card_no.slice(-4);
    }
  }
  
  this.addStatusChange('Completed', null, 'Payment completed via PayHere');
};

// Method to mark as failed
paymentSchema.methods.markFailed = function(errorMessage, errorCode) {
  this.status = 'Failed';
  this.failedAt = new Date();
  this.errorMessage = errorMessage;
  this.errorCode = errorCode;
  this.addStatusChange('Failed', null, errorMessage);
};

// Method to process refund
paymentSchema.methods.processRefund = function(refundAmount, reason, initiatedBy) {
  this.status = 'Refunded';
  this.refundAmount = refundAmount || this.amount;
  this.refundReason = reason;
  this.refundedAt = new Date();
  this.refundInitiatedBy = initiatedBy;
  this.addStatusChange('Refunded', initiatedBy, reason, `Refund amount: ${this.currency} ${refundAmount}`);
};

// Static method to create payment from booking
paymentSchema.statics.createFromBooking = async function(booking, payhereOrderId) {
  // Populate booking if not already populated
  if (!booking.client.name) {
    await booking.populate([
      { path: 'client', select: 'name email phone' },
      { path: 'studio', select: 'name email' }
    ]);
  }
  
  const paymentData = {
    booking: booking._id,
    payhereOrderId,
    amount: booking.price,
    currency: booking.currency || 'LKR',
    status: 'Pending',
    bookingSnapshot: {
      client: {
        id: booking.client._id,
        name: booking.client.name,
        email: booking.client.email,
        phone: booking.client.phone
      },
      studio: {
        id: booking.studio._id,
        name: booking.studio.name,
        email: booking.studio.email || booking.studio.user?.email
      },
      service: booking.service ? {
        name: booking.service.name,
        price: booking.service.price,
        durationMins: booking.service.durationMins,
        description: booking.service.description
      } : null,
      services: booking.services || [],
      equipment: booking.equipment || [],
      start: booking.start,
      end: booking.end,
      notes: booking.notes,
      clientNotes: booking.clientNotes
    },
    initiatedAt: new Date()
  };
  
  return await this.create(paymentData);
};

module.exports = mongoose.model('Payment', paymentSchema);
