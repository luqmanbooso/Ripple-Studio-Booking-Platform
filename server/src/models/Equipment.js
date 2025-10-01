const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  studio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Studio',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true,
    maxlength: [100, 'Equipment name cannot exceed 100 characters']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters']
  },
  category: {
    type: String,
    enum: [
      'Microphones',
      'Audio Interfaces', 
      'Monitors',
      'Headphones',
      'Instruments',
      'Amplifiers',
      'Effects',
      'Recording',
      'Mixing',
      'Mastering',
      'Lighting',
      'Cameras',
      'Other'
    ],
    required: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    trim: true
  },
  specifications: {
    type: Map,
    of: String
  },
  condition: {
    type: String,
    enum: ['New', 'Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number,
    min: 0
  },
  currentValue: {
    type: Number,
    min: 0
  },
  serialNumber: {
    type: String,
    trim: true
  },
  warrantyExpiry: {
    type: Date
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Maintenance description cannot exceed 500 characters']
    },
    cost: {
      type: Number,
      min: 0
    },
    performedBy: {
      type: String,
      trim: true
    }
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    caption: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  isInsured: {
    type: Boolean,
    default: false
  },
  insuranceDetails: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverage: Number
  },
  isRentable: {
    type: Boolean,
    default: false
  },
  rentalPricePerDay: {
    type: Number,
    min: 0,
    default: 0
  },
  rentalPricePerWeek: {
    type: Number,
    min: 0,
    default: 0
  },
  rentalPricePerMonth: {
    type: Number,
    min: 0,
    default: 0
  },
  image: {
    type: String
  },
  manufacturer: {
    type: String,
    trim: true
  },
  lastMaintenance: {
    type: Date
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
equipmentSchema.index({ studio: 1 });
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ isAvailable: 1 });
equipmentSchema.index({ condition: 1 });
equipmentSchema.index({ addedBy: 1 });
equipmentSchema.index({ tags: 1 });

// Text search index
equipmentSchema.index({
  name: 'text',
  brand: 'text',
  model: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for equipment age
equipmentSchema.virtual('age').get(function() {
  if (!this.purchaseDate) return null;
  const now = new Date();
  const purchase = new Date(this.purchaseDate);
  return Math.floor((now - purchase) / (1000 * 60 * 60 * 24 * 365.25)); // in years
});

// Method to add maintenance record
equipmentSchema.methods.addMaintenance = function(maintenanceData) {
  this.maintenanceHistory.push(maintenanceData);
  return this.save();
};

// Method to calculate depreciation
equipmentSchema.methods.calculateDepreciation = function() {
  if (!this.purchasePrice || !this.purchaseDate) return null;
  
  const age = this.age;
  if (age === null) return null;
  
  // Simple straight-line depreciation over 10 years
  const depreciationRate = 0.1; // 10% per year
  const depreciation = this.purchasePrice * depreciationRate * age;
  const currentValue = Math.max(0, this.purchasePrice - depreciation);
  
  return {
    originalValue: this.purchasePrice,
    currentValue: currentValue,
    totalDepreciation: depreciation,
    depreciationRate: depreciationRate
  };
};

module.exports = mongoose.model('Equipment', equipmentSchema);
