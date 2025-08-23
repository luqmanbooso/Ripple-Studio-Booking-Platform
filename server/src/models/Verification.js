const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ['artist', 'studio'],
    required: [true, 'Target type is required']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required'],
    refPath: 'targetType'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  docs: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    type: {
      type: String,
      enum: ['id', 'business_license', 'portfolio', 'certificate', 'other'],
      required: true
    },
    description: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  expiresAt: Date,
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
verificationSchema.index({ targetType: 1, targetId: 1 });
verificationSchema.index({ user: 1 });
verificationSchema.index({ status: 1 });
verificationSchema.index({ submittedAt: -1 });

// Only one verification per target
verificationSchema.index({ targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Verification', verificationSchema);
