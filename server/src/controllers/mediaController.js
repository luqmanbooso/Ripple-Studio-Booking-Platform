const Media = require('../models/Media');
const Studio = require('../models/Studio');
const { validationResult } = require('express-validator');

// Get all media for a studio
exports.getStudioMedia = async (req, res) => {
  try {
    const { studioId } = req.params;
    const { type, isPublic, isFeatured, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = { studio: studioId };
    if (type) filter.type = type;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    const skip = (page - 1) * limit;

    const media = await Media.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments(filter);

    res.json({
      success: true,
      data: media,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get studio media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media',
      error: error.message
    });
  }
};

// Get single media item
exports.getMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id)
      .populate('studio', 'name')
      .populate('uploadedBy', 'name email');

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media',
      error: error.message
    });
  }
};

// Create new media
exports.createMedia = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const mediaData = {
      ...req.body,
      uploadedBy: req.user.id
    };

    // Verify studio ownership
    const studio = await Studio.findById(mediaData.studio);
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    if (studio.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add media to this studio'
      });
    }

    const media = new Media(mediaData);
    await media.save();

    await media.populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Media created successfully',
      data: media
    });
  } catch (error) {
    console.error('Create media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create media',
      error: error.message
    });
  }
};

// Update media
exports.updateMedia = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const media = await Media.findById(id).populate('studio');

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check authorization
    if (media.studio.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this media'
      });
    }

    Object.assign(media, req.body);
    await media.save();

    await media.populate('uploadedBy', 'name email');

    res.json({
      success: true,
      message: 'Media updated successfully',
      data: media
    });
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update media',
      error: error.message
    });
  }
};

// Delete media
exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id).populate('studio');

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check authorization
    if (media.studio.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this media'
      });
    }

    await Media.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media',
      error: error.message
    });
  }
};

// Search media
exports.searchMedia = async (req, res) => {
  try {
    const { q, type, studioId, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const filter = {
      $text: { $search: q },
      isPublic: true
    };

    if (type) filter.type = type;
    if (studioId) filter.studio = studioId;

    const skip = (page - 1) * limit;

    const media = await Media.find(filter)
      .populate('studio', 'name')
      .populate('uploadedBy', 'name')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments(filter);

    res.json({
      success: true,
      data: media,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search media',
      error: error.message
    });
  }
};

// Toggle featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id).populate('studio');

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check authorization
    if (media.studio.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this media'
      });
    }

    media.isFeatured = !media.isFeatured;
    await media.save();

    res.json({
      success: true,
      message: `Media ${media.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: media
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
      error: error.message
    });
  }
};
