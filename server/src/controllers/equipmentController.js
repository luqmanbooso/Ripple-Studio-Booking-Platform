const Equipment = require('../models/Equipment');
const Studio = require('../models/Studio');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const NotificationService = require('../services/notificationService');

// Get all equipment for a studio
exports.getStudioEquipment = async (req, res) => {
  try {
    const { studioId } = req.params;
    const { category, condition, isAvailable, page = 1, limit = 20 } = req.query;

    // Validate studioId
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID'
      });
    }

    // Build filter
    const filter = { studio: studioId };
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const skip = (page - 1) * limit;

    const equipment = await Equipment.find(filter)
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Equipment.countDocuments(filter);

    // Get category statistics
    const categoryStats = await Equipment.aggregate([
      { $match: { studio: studioId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: equipment,
      statistics: {
        categoryBreakdown: categoryStats,
        totalItems: total,
        availableItems: await Equipment.countDocuments({ studio: studioId, isAvailable: true })
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get studio equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Get single equipment item
exports.getEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id)
      .populate('studio', 'name')
      .populate('addedBy', 'name email');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Calculate depreciation if applicable
    const depreciation = equipment.calculateDepreciation();

    res.json({
      success: true,
      data: {
        ...equipment.toObject(),
        depreciation
      }
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Create new equipment
exports.createEquipment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const equipmentData = {
      ...req.body,
      addedBy: req.user.id
    };

    // Verify studio ownership
    const studio = await Studio.findById(equipmentData.studio);
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    if (studio.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add equipment to this studio'
      });
    }

    const equipment = new Equipment(equipmentData);
    await equipment.save();

    await equipment.populate('addedBy', 'name email');

    // Create notification for admins
    await NotificationService.notifyEquipmentAdded(studio, equipmentData.name, req.user);

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create equipment',
      error: error.message
    });
  }
};

// Update equipment
exports.updateEquipment = async (req, res) => {
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
    const equipment = await Equipment.findById(id).populate('studio');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Check authorization
    if (equipment.studio.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this equipment'
      });
    }

    Object.assign(equipment, req.body);
    await equipment.save();

    await equipment.populate('addedBy', 'name email');

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update equipment',
      error: error.message
    });
  }
};

// Delete equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id).populate('studio');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Check authorization
    if (equipment.studio.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this equipment'
      });
    }

    const equipmentName = equipment.name; // Store for notification
    await Equipment.findByIdAndDelete(id);

    // Create notification for admins
    await NotificationService.notifyEquipmentRemoved(equipment.studio, equipmentName, req.user);

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete equipment',
      error: error.message
    });
  }
};

// Add maintenance record
exports.addMaintenance = async (req, res) => {
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
    const equipment = await Equipment.findById(id).populate('studio');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Check authorization
    if (equipment.studio.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add maintenance records'
      });
    }

    await equipment.addMaintenance(req.body);

    res.json({
      success: true,
      message: 'Maintenance record added successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Add maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add maintenance record',
      error: error.message
    });
  }
};

// Search equipment
exports.searchEquipment = async (req, res) => {
  try {
    const { q, category, studioId, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const filter = {
      $text: { $search: q }
    };

    if (category) filter.category = category;
    if (studioId) filter.studio = studioId;

    const skip = (page - 1) * limit;

    const equipment = await Equipment.find(filter)
      .populate('studio', 'name')
      .populate('addedBy', 'name')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Equipment.countDocuments(filter);

    res.json({
      success: true,
      data: equipment,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search equipment',
      error: error.message
    });
  }
};

// Get equipment categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Equipment.distinct('category');
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get equipment statistics
exports.getEquipmentStats = async (req, res) => {
  try {
    const { studioId } = req.params;

    const stats = await Equipment.aggregate([
      { $match: { studio: studioId } },
      {
        $group: {
          _id: null,
          totalEquipment: { $sum: 1 },
          totalValue: { $sum: '$currentValue' },
          availableCount: {
            $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
          },
          categoryBreakdown: {
            $push: {
              category: '$category',
              condition: '$condition',
              value: '$currentValue'
            }
          }
        }
      }
    ]);

    const categoryStats = await Equipment.aggregate([
      { $match: { studio: studioId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$currentValue' },
          avgValue: { $avg: '$currentValue' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const conditionStats = await Equipment.aggregate([
      { $match: { studio: studioId } },
      {
        $group: {
          _id: '$condition',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalEquipment: 0,
          totalValue: 0,
          availableCount: 0
        },
        categoryBreakdown: categoryStats,
        conditionBreakdown: conditionStats
      }
    });
  } catch (error) {
    console.error('Get equipment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment statistics',
      error: error.message
    });
  }
};
