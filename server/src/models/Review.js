const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review author is required']
  },
  targetType: {
    type: String,
    enum: ['studio'],
    required: [true, 'Target type is required']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required'],
    refPath: 'targetType'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  moderatorNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  response: {
    content: {
      type: String,
      maxlength: [500, 'Response cannot exceed 500 characters']
    },
    respondedAt: Date
  },
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reported: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ author: 1 });
reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ booking: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound index for unique review per booking
reviewSchema.index({ author: 1, booking: 1 }, { unique: true });

// Virtual for helpful count
reviewSchema.virtual('helpfulCount').get(function() {
  return this.helpful.length;
});

// Virtual for reported count
reviewSchema.virtual('reportedCount').get(function() {
  return this.reported.length;
});

// Check if user found review helpful
reviewSchema.methods.isHelpfulByUser = function(userId) {
  return this.helpful.some(help => help.user.toString() === userId.toString());
};

// Toggle helpful status
reviewSchema.methods.toggleHelpful = function(userId) {
  const existingIndex = this.helpful.findIndex(help => 
    help.user.toString() === userId.toString()
  );
  
  if (existingIndex >= 0) {
    this.helpful.splice(existingIndex, 1);
  } else {
    this.helpful.push({ user: userId });
  }
  
  return this.save();
};

// Add report
reviewSchema.methods.addReport = function(userId, reason) {
  // Check if user already reported
  const alreadyReported = this.reported.some(report => 
    report.user.toString() === userId.toString()
  );
  
  if (!alreadyReported) {
    this.reported.push({ user: userId, reason });
    return this.save();
  }
  
  return Promise.resolve(this);
};

module.exports = mongoose.model('Review', reviewSchema);
