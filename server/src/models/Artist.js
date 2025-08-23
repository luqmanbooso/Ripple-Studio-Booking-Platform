const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  genres: [{
    type: String,
    trim: true
  }],
  instruments: [{
    type: String,
    trim: true
  }],
  bio: {
    type: String,
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative'],
    required: [true, 'Hourly rate is required']
  },
  media: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'audio', 'video'],
      required: true
    },
    publicId: String,
    title: String,
    description: String
  }],
  availability: [{
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    timezone: {
      type: String,
      default: 'UTC'
    }
  }],
  ratingAvg: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  completedBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  socialLinks: {
    website: String,
    spotify: String,
    soundcloud: String,
    youtube: String,
    instagram: String,
    twitter: String
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
artistSchema.index({ user: 1 });
artistSchema.index({ genres: 1 });
artistSchema.index({ instruments: 1 });
artistSchema.index({ hourlyRate: 1 });
artistSchema.index({ ratingAvg: -1 });
artistSchema.index({ isActive: 1 });
artistSchema.index({ verificationStatus: 1 });

// Text search index
artistSchema.index({
  bio: 'text',
  genres: 'text',
  instruments: 'text'
});

// Virtual for average rating display
artistSchema.virtual('ratingDisplay').get(function() {
  return this.ratingCount > 0 ? this.ratingAvg : null;
});

// Update rating when new review is added
artistSchema.methods.updateRating = async function(newRating) {
  const totalRating = (this.ratingAvg * this.ratingCount) + newRating;
  this.ratingCount += 1;
  this.ratingAvg = totalRating / this.ratingCount;
  await this.save();
};

// Check availability for a time slot
artistSchema.methods.isAvailable = function(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return this.availability.some(slot => {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);
    
    // Check if requested time falls within available slot
    return start >= slotStart && end <= slotEnd;
  });
};

module.exports = mongoose.model('Artist', artistSchema);
