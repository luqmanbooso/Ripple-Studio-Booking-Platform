const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required']
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist'
  },
  studio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Studio'
  },
  service: {
    name: {
      type: String,
      required: [true, 'Service name is required']
    },
    price: {
      type: Number,
      required: [true, 'Service price is required'],
      min: 0
    },
    durationMins: {
      type: Number,
      required: [true, 'Service duration is required'],
      min: 30
    },
    description: String
  },
  start: {
    type: Date,
    required: [true, 'Start time is required']
  },
  end: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'payment_pending', 'confirmed', 'completed', 'cancelled', 'refunded'],
    default: 'payment_pending'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  stripeSessionId: String,
  paymentIntentId: String,
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  clientNotes: {
    type: String,
    maxlength: [1000, 'Client notes cannot exceed 1000 characters']
  },
  providerNotes: {
    type: String,
    maxlength: [1000, 'Provider notes cannot exceed 1000 characters']
  },
  cancellationReason: String,
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundedAt: Date,
  completedAt: Date,
  meetingLink: String,
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ client: 1 });
bookingSchema.index({ artist: 1 });
bookingSchema.index({ studio: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ start: 1, end: 1 });
bookingSchema.index({ createdAt: -1 });

// Compound indexes for conflict checking
bookingSchema.index({ artist: 1, start: 1, end: 1, status: 1 });
bookingSchema.index({ studio: 1, start: 1, end: 1, status: 1 });

// Validation: end time must be after start time
bookingSchema.pre('validate', function(next) {
  if (this.end <= this.start) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Validation: must have either artist or studio
bookingSchema.pre('validate', function(next) {
  if (!this.artist && !this.studio) {
    next(new Error('Booking must have either an artist or studio'));
  }
  if (this.artist && this.studio) {
    next(new Error('Booking cannot have both artist and studio'));
  }
  next();
});

// Virtual for duration in minutes
bookingSchema.virtual('durationMins').get(function() {
  return Math.round((this.end - this.start) / (1000 * 60));
});

// Virtual for provider (artist or studio)
bookingSchema.virtual('provider').get(function() {
  return this.artist || this.studio;
});

// Virtual for provider type
bookingSchema.virtual('providerType').get(function() {
  return this.artist ? 'artist' : 'studio';
});

// Check if booking can be cancelled
bookingSchema.methods.canCancel = function() {
  const now = new Date();
  const hoursUntilStart = (this.start - now) / (1000 * 60 * 60);
  
  // Can cancel if more than 24 hours before start time and not completed
  return hoursUntilStart > 24 && !['completed', 'cancelled', 'refunded'].includes(this.status);
};

// Check if booking can be completed
bookingSchema.methods.canComplete = function() {
  const now = new Date();
  return this.status === 'confirmed' && now >= this.start;
};

// Get refund amount based on cancellation time
bookingSchema.methods.getRefundAmount = function() {
  const now = new Date();
  const hoursUntilStart = (this.start - now) / (1000 * 60 * 60);
  
  if (hoursUntilStart > 168) { // More than 7 days
    return this.price; // Full refund
  } else if (hoursUntilStart > 24) { // More than 24 hours
    return this.price * 0.5; // 50% refund
  } else {
    return 0; // No refund
  }
};

module.exports = mongoose.model('Booking', bookingSchema);
