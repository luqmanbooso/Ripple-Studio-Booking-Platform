const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  studio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Studio',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Media title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'audio'],
    required: true
  },
  url: {
    type: String,
    required: [true, 'Media URL is required']
  },
  publicId: {
    type: String, // For Cloudinary or similar services
    required: false
  },
  fileSize: {
    type: Number, // in bytes
    min: 0
  },
  duration: {
    type: Number, // in seconds for video/audio
    min: 0
  },
  format: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    width: Number,
    height: Number,
    bitrate: Number,
    sampleRate: Number,
    channels: Number
  }
}, {
  timestamps: true
});

// Indexes
mediaSchema.index({ studio: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ isPublic: 1 });
mediaSchema.index({ isFeatured: 1 });
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ tags: 1 });

// Text search index
mediaSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Media', mediaSchema);
