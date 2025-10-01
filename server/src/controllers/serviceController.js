const Studio = require('../models/Studio');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const NotificationService = require('../services/notificationService');

// Get all services for a studio
exports.getStudioServices = async (req, res) => {
  try {
    const { studioId } = req.params;

    // Validate studioId
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID'
      });
    }

    const studio = await Studio.findById(studioId).select('services name');
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    res.json({
      success: true,
      data: studio.services,
      studioName: studio.name
    });
  } catch (error) {
    console.error('Get studio services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
};

// Add service to studio
exports.addService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { studioId } = req.params;
    const { name, price, durationMins, description } = req.body;

    // Validate studioId
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID'
      });
    }

    const studio = await Studio.findById(studioId);
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    // Check authorization
    if (studio.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add services to this studio'
      });
    }

    // Check if service already exists
    const existingService = studio.services.find(service => 
      service.name.toLowerCase() === name.toLowerCase()
    );
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Service with this name already exists'
      });
    }

    // Add service
    const newService = {
      name,
      price: parseFloat(price),
      durationMins: parseInt(durationMins),
      description: description || ''
    };

    studio.services.push(newService);
    await studio.save();

    // Get the newly added service
    const addedService = studio.services[studio.services.length - 1];

    // Create notification for admins
    await NotificationService.notifyServiceAdded(studio, addedService, req.user);

    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      data: addedService
    });
  } catch (error) {
    console.error('Add service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add service',
      error: error.message
    });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { studioId, serviceId } = req.params;
    const { name, price, durationMins, description } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(studioId) || !mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio or service ID'
      });
    }

    const studio = await Studio.findById(studioId);
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    // Check authorization
    if (studio.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update services for this studio'
      });
    }

    // Find service
    const service = studio.services.id(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if another service with the same name exists (excluding current)
    const existingService = studio.services.find(s => 
      s._id.toString() !== serviceId && 
      s.name.toLowerCase() === name.toLowerCase()
    );
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Another service with this name already exists'
      });
    }

    // Update service
    service.name = name;
    service.price = parseFloat(price);
    service.durationMins = parseInt(durationMins);
    service.description = description || '';

    await studio.save();

    // Create notification for admins
    await NotificationService.notifyServiceUpdated(studio, service, req.user);

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const { studioId, serviceId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(studioId) || !mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio or service ID'
      });
    }

    const studio = await Studio.findById(studioId);
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    // Check authorization
    if (studio.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete services from this studio'
      });
    }

    // Find and remove service
    const service = studio.services.id(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const serviceName = service.name; // Store name for notification
    studio.services.pull(serviceId);
    await studio.save();

    // Create notification for admins
    await NotificationService.notifyServiceDeleted(studio, serviceName, req.user);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
};

// Get service statistics
exports.getServiceStats = async (req, res) => {
  try {
    const { studioId } = req.params;

    // Validate studioId
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID'
      });
    }

    const studio = await Studio.findById(studioId).select('services');
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    const services = studio.services;
    const stats = {
      totalServices: services.length,
      averagePrice: services.length > 0 ? 
        services.reduce((sum, service) => sum + service.price, 0) / services.length : 0,
      averageDuration: services.length > 0 ? 
        services.reduce((sum, service) => sum + service.durationMins, 0) / services.length : 0,
      priceRange: {
        min: services.length > 0 ? Math.min(...services.map(s => s.price)) : 0,
        max: services.length > 0 ? Math.max(...services.map(s => s.price)) : 0
      },
      durationRange: {
        min: services.length > 0 ? Math.min(...services.map(s => s.durationMins)) : 0,
        max: services.length > 0 ? Math.max(...services.map(s => s.durationMins)) : 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get service stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service statistics',
      error: error.message
    });
  }
};
