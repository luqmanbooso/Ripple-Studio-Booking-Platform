const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object'],
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    default: 'general'
  }
}, {
  timestamps: true
});

// Static method to get a setting value
settingsSchema.statics.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to set a setting value
settingsSchema.statics.setValue = async function(key, value, type = 'string', description = '', category = 'general') {
  const setting = await this.findOneAndUpdate(
    { key },
    { 
      value, 
      type, 
      description, 
      category,
      updatedAt: new Date()
    },
    { 
      upsert: true, 
      new: true, 
      runValidators: true 
    }
  );
  return setting;
};

// Static method to get platform commission rate
settingsSchema.statics.getCommissionRate = async function() {
  const rate = await this.getValue('platform_commission_rate', 0.03);
  return parseFloat(rate);
};

// Static method to set platform commission rate
settingsSchema.statics.setCommissionRate = async function(rate) {
  return await this.setValue(
    'platform_commission_rate', 
    rate, 
    'number', 
    'Platform commission rate as decimal (e.g., 0.03 for 3%)',
    'revenue'
  );
};

module.exports = mongoose.model('Settings', settingsSchema);