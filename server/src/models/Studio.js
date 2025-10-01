const mongoose = require('mongoose');

const studioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Studio name is required'],
    trim: true,
    maxlength: [100, 'Studio name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  location: {
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  equipment: [{
    type: String,
    trim: true
  }],
  services: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    durationMins: {
      type: Number,
      required: true,
      min: 30
    },
    description: String,
    category: {
      type: String,
      enum: ['recording', 'mixing', 'mastering', 'production', 'video', 'consultation'],
      default: 'recording'
    },
    isBookable: {
      type: Boolean,
      default: true
    },
    advanceBookingHours: {
      type: Number,
      min: 0,
      default: null
    },
    maxBookingsPerDay: {
      type: Number,
      min: 1,
      default: null
    },
    preparationTime: {
      type: Number,
      min: 0,
      default: 15
    },
    requiredEquipment: [String],
    cancellationPolicy: String
  }],
  gallery: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    caption: String
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
  isApproved: {
    type: Boolean,
    default: false
  },
  statusReason: {
    type: String,
    trim: true
  },
  studioType: {
    type: String,
    enum: ['Recording', 'Mixing', 'Mastering', 'Rehearsal', 'Live'],
    default: 'Recording'
  },
  features: {
    featured: { type: Boolean, default: false },
    promoted: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    premiumListing: { type: Boolean, default: false }
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
  capacity: {
    type: Number,
    min: 1
  },
  genres: [{
    type: String,
    trim: true
  }],
  socialMedia: {
    instagram: String,
    twitter: String,
    facebook: String,
    youtube: String
  },
  onboarded: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

// Indexes
studioSchema.index({ user: 1 });
studioSchema.index({ 'location.country': 1, 'location.city': 1 });
studioSchema.index({ 'location.lat': 1, 'location.lng': 1 });
studioSchema.index({ ratingAvg: -1 });
studioSchema.index({ isActive: 1 });
studioSchema.index({ verificationStatus: 1 });

// Geospatial index for location-based searches
studioSchema.index({ 
  'location.lat': '2dsphere',
  'location.lng': '2dsphere' 
});

// Text search index
studioSchema.index({
  name: 'text',
  description: 'text',
  equipment: 'text',
  'services.name': 'text'
});

// Virtual for average rating display
studioSchema.virtual('ratingDisplay').get(function() {
  return this.ratingCount > 0 ? this.ratingAvg : null;
});

// Update rating when new review is added
studioSchema.methods.updateRating = async function(newRating) {
  const totalRating = (this.ratingAvg * this.ratingCount) + newRating;
  this.ratingCount += 1;
  this.ratingAvg = totalRating / this.ratingCount;
  await this.save();
};

// Check availability for a time slot
studioSchema.methods.isAvailable = function(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return this.availability.some(slot => {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);
    
    // Check if requested time falls within available slot
    return start >= slotStart && end <= slotEnd;
  });
};

// Get service by name
studioSchema.methods.getService = function(serviceName) {
  return this.services.find(service => service.name === serviceName);
};

module.exports = mongoose.model('Studio', studioSchema);
