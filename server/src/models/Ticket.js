const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['cancellation', 'refund', 'dispute', 'no_show', 'quality_issue', 'technical_issue', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'escalated'],
    default: 'open'
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Related entities
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  studio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Studio',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Who created the ticket
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByRole: {
    type: String,
    enum: ['client', 'studio', 'admin'],
    required: true
  },
  
  // Admin assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Evidence and attachments
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'document', 'audio', 'video']
    },
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Communication thread
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderRole: {
      type: String,
      enum: ['client', 'studio', 'admin'],
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false // Internal admin notes
    }
  }],
  
  // Resolution details
  resolution: {
    type: String,
    maxlength: 1000
  },
  resolutionType: {
    type: String,
    enum: ['full_refund', 'partial_refund', 'reschedule', 'credit', 'no_action', 'other']
  },
  refundAmount: {
    type: Number,
    min: 0
  },
  
  // Timestamps
  resolvedAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Auto-escalation
  escalationDate: Date,
  escalationReason: String,
  
  // Metadata
  tags: [String],
  internalNotes: String
}, {
  timestamps: true
});

// Generate unique ticket ID
ticketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TKT-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  this.lastUpdated = new Date();
  next();
});

// Auto-escalation logic
ticketSchema.pre('save', function(next) {
  if (this.status === 'open' && this.priority === 'high' && !this.escalationDate) {
    // Escalate high priority tickets after 4 hours
    this.escalationDate = new Date(Date.now() + 4 * 60 * 60 * 1000);
  } else if (this.status === 'open' && this.priority === 'urgent' && !this.escalationDate) {
    // Escalate urgent tickets after 1 hour
    this.escalationDate = new Date(Date.now() + 1 * 60 * 60 * 1000);
  }
  next();
});

// Indexes for performance
ticketSchema.index({ ticketId: 1 });
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ booking: 1 });
ticketSchema.index({ studio: 1 });
ticketSchema.index({ client: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });

// Methods
ticketSchema.methods.addMessage = function(senderId, senderRole, message, isInternal = false) {
  this.messages.push({
    sender: senderId,
    senderRole,
    message,
    isInternal
  });
  this.lastUpdated = new Date();
  return this.save();
};

ticketSchema.methods.updateStatus = function(newStatus, resolutionDetails = {}) {
  this.status = newStatus;
  if (newStatus === 'resolved' || newStatus === 'closed') {
    this.resolvedAt = new Date();
    if (resolutionDetails.resolution) this.resolution = resolutionDetails.resolution;
    if (resolutionDetails.resolutionType) this.resolutionType = resolutionDetails.resolutionType;
    if (resolutionDetails.refundAmount) this.refundAmount = resolutionDetails.refundAmount;
  }
  this.lastUpdated = new Date();
  return this.save();
};

ticketSchema.methods.assignTo = function(adminId) {
  this.assignedTo = adminId;
  this.status = 'in_progress';
  this.lastUpdated = new Date();
  return this.save();
};

// Static methods
ticketSchema.statics.getTicketStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

ticketSchema.statics.getOverdueTickets = function() {
  return this.find({
    status: { $in: ['open', 'in_progress'] },
    escalationDate: { $lt: new Date() }
  }).populate('booking studio client assignedTo');
};

module.exports = mongoose.model('Ticket', ticketSchema);
