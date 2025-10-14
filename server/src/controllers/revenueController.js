const Revenue = require('../models/Revenue');
const Booking = require('../models/Booking');
const Studio = require('../models/Studio');
const RevenueService = require('../services/revenueService');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

// ==================== STUDIO REVENUE ENDPOINTS ====================

/**
 * Get studio revenue dashboard
 */
const getStudioRevenue = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;
  const studioId = req.user.role === 'studio' ? req.user.studio : req.params.studioId;

  // Check if studio user has a studio associated
  if (req.user.role === 'studio' && !studioId) {
    // Return empty data instead of error for better UX
    return res.json({
      status: 'success',
      data: {
        revenues: [],
        statistics: {
          totalRevenue: 0,
          totalStudioEarnings: 0,
          totalBookings: 0,
          averageBookingValue: 0,
          platformCommissionRate: 0.10
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      }
    });
  }

  // Build filter
  const filter = { studio: studioId };
  
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Get revenues with pagination
  const revenues = await Revenue.find(filter)
    .populate('bookingId', 'start end service services equipment notes')
    .populate('client', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Revenue.countDocuments(filter);

  // Get statistics
  const stats = await RevenueService.getRevenueStatistics(filter);

  res.json({
    status: 'success',
    data: {
      revenues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: stats
    }
  });
});

/**
 * Get single revenue details
 */
const getRevenueDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const revenue = await Revenue.findById(id)
    .populate('bookingId')
    .populate('client', 'name email phone')
    .populate('studio', 'name email phone location');

  if (!revenue) {
    throw new ApiError('Revenue record not found', 404);
  }

  // Check permissions
  if (req.user.role === 'studio' && revenue.studio._id.toString() !== req.user.studio.toString()) {
    throw new ApiError('Not authorized to view this revenue', 403);
  }
  
  if (req.user.role === 'client' && revenue.client._id.toString() !== req.user._id.toString()) {
    throw new ApiError('Not authorized to view this revenue', 403);
  }

  res.json({
    status: 'success',
    data: { revenue }
  });
});

/**
 * Add adjustment to revenue (tips, discounts, etc.)
 */
const addAdjustment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { amount, reason, type } = req.body;

  if (!['tip', 'discount', 'fee', 'correction'].includes(type)) {
    throw new ApiError('Invalid adjustment type', 400);
  }

  const revenue = await RevenueService.addAdjustment(
    id,
    parseFloat(amount),
    reason,
    type,
    req.user._id
  );

  res.json({
    status: 'success',
    message: 'Adjustment added successfully',
    data: { revenue }
  });
});

/**
 * Request payout
 */
const requestPayout = catchAsync(async (req, res) => {
  const { amount, bankDetails } = req.body;
  const studioId = req.user.studio;

  // Check if studio user has a studio associated
  if (!studioId) {
    throw new ApiError('No studio associated with this user', 400);
  }

  if (!bankDetails || !bankDetails.accountNumber || !bankDetails.bankName) {
    throw new ApiError('Bank details are required', 400);
  }

  const payoutRequest = await RevenueService.requestPayout(
    studioId,
    parseFloat(amount),
    bankDetails,
    req.user._id
  );

  res.json({
    status: 'success',
    message: 'Payout requested successfully',
    data: payoutRequest
  });
});

/**
 * Get studio payout history
 */
const getPayoutHistory = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const studioId = req.user.studio;

  // Check if studio user has a studio associated
  if (!studioId) {
    return res.json({
      status: 'success',
      data: {
        payouts: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      }
    });
  }

  const revenues = await Revenue.find({
    studio: studioId,
    'payouts.0': { $exists: true }
  })
    .select('payouts totalAmount studioEarnings createdAt')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Flatten payouts
  const payouts = [];
  revenues.forEach(revenue => {
    revenue.payouts.forEach(payout => {
      payouts.push({
        ...payout.toObject(),
        revenueId: revenue._id,
        totalAmount: revenue.totalAmount
      });
    });
  });

  res.json({
    status: 'success',
    data: { payouts }
  });
});

// ==================== CLIENT REVENUE ENDPOINTS ====================

/**
 * Get client spending history
 */
const getClientSpending = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, startDate, endDate } = req.query;
  const clientId = req.user._id;

  // Build filter
  const filter = { client: clientId };
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Get spending records
  const revenues = await Revenue.find(filter)
    .populate('bookingId', 'start end service services equipment notes')
    .populate('studio', 'name location')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Revenue.countDocuments(filter);

  // Calculate spending statistics
  const stats = await Revenue.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$totalAmount' },
        averageSpending: { $avg: '$totalAmount' },
        totalBookings: { $sum: 1 }
      }
    }
  ]);

  res.json({
    status: 'success',
    data: {
      revenues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: stats[0] || {
        totalSpent: 0,
        averageSpending: 0,
        totalBookings: 0
      }
    }
  });
});

/**
 * Download spending report (CSV)
 */
const downloadSpendingReport = catchAsync(async (req, res) => {
  const { startDate, endDate, format = 'csv' } = req.query;
  const clientId = req.user._id;

  const filter = { client: clientId };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const revenues = await Revenue.find(filter)
    .populate('bookingId', 'start end service services equipment')
    .populate('studio', 'name')
    .sort({ createdAt: -1 });

  if (format === 'csv') {
    // Generate CSV
    const csvHeader = 'Date,Studio,Service,Amount,Status\n';
    const csvRows = revenues.map(revenue => {
      const date = revenue.createdAt.toISOString().split('T')[0];
      const studio = revenue.studio.name;
      const service = revenue.bookingId.service?.name || 'Session';
      const amount = revenue.totalAmount;
      const status = revenue.status;
      
      return `${date},${studio},${service},${amount},${status}`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=spending-report.csv');
    res.send(csvHeader + csvRows);
  } else {
    res.json({
      status: 'success',
      data: { revenues }
    });
  }
});

// ==================== ADMIN REVENUE ENDPOINTS ====================

/**
 * Get platform revenue overview (Admin only)
 */
const getPlatformRevenue = catchAsync(async (req, res) => {
  const { startDate, endDate, studioId } = req.query;

  // Build filter
  const filter = {};
  if (studioId) filter.studio = studioId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      // Set start of day for startDate
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      filter.createdAt.$gte = start;
    }
    if (endDate) {
      // Set end of day for endDate to include all records created on that date
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  // Get comprehensive statistics
  const stats = await RevenueService.getRevenueStatistics(filter);

  // Get recent revenues
  const recentRevenues = await Revenue.find(filter)
    .populate('studio', 'name')
    .populate('client', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    status: 'success',
    data: {
      statistics: stats,
      recentRevenues
    }
  });
});

/**
 * Get all payout requests (Admin only)
 */
const getAllPayoutRequests = catchAsync(async (req, res) => {
  const { status = 'requested', page = 1, limit = 20 } = req.query;

  const revenues = await Revenue.find({
    'payouts.status': status
  })
    .populate('studio', 'name email')
    .sort({ 'payouts.requestedAt': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Flatten and filter payouts
  const payoutRequests = [];
  revenues.forEach(revenue => {
    revenue.payouts
      .filter(payout => payout.status === status)
      .forEach(payout => {
        payoutRequests.push({
          ...payout.toObject(),
          revenueId: revenue._id,
          studio: revenue.studio,
          totalAmount: revenue.totalAmount,
          netEarnings: revenue.netEarnings
        });
      });
  });

  res.json({
    status: 'success',
    data: { payoutRequests }
  });
});

/**
 * Process payout request (Admin only)
 */
const processPayoutRequest = catchAsync(async (req, res) => {
  const { revenueId, payoutIndex } = req.params;
  const { status, payoutId, notes } = req.body;

  if (!['approved', 'processing', 'completed', 'failed'].includes(status)) {
    throw new ApiError('Invalid payout status', 400);
  }

  const revenue = await RevenueService.processPayout(
    revenueId,
    parseInt(payoutIndex),
    status,
    req.user._id,
    payoutId
  );

  // Add notes if provided
  if (notes) {
    revenue.payouts[payoutIndex].notes = notes;
    await revenue.save();
  }

  res.json({
    status: 'success',
    message: 'Payout processed successfully',
    data: { revenue }
  });
});

/**
 * Update platform commission rate (Admin only)
 */
const updateCommissionRate = catchAsync(async (req, res) => {
  const { rate } = req.body;

  if (rate < 0 || rate > 1) {
    throw new ApiError('Commission rate must be between 0 and 1', 400);
  }

  // Update environment variable (this will be used for new revenue calculations)
  process.env.PLATFORM_COMMISSION_RATE = rate.toString();

  // You could also store this in a database settings table for persistence
  // For now, we'll use environment variable approach
  
  logger.info(`Platform commission rate updated to ${(rate * 100).toFixed(1)}% by admin`);

  res.json({
    status: 'success',
    message: `Commission rate updated to ${(rate * 100).toFixed(1)}%`,
    data: { 
      newRate: rate,
      newRatePercentage: (rate * 100).toFixed(1)
    }
  });
});

// ==================== SHARED ENDPOINTS ====================

/**
 * Generate invoice for revenue
 */
const generateInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const revenue = await Revenue.findById(id)
    .populate('bookingId')
    .populate('client', 'name email phone')
    .populate('studio', 'name email phone location');

  if (!revenue) {
    throw new ApiError('Revenue record not found', 404);
  }

  // Check permissions
  if (req.user.role === 'studio' && revenue.studio._id.toString() !== req.user.studio.toString()) {
    throw new ApiError('Not authorized to generate invoice', 403);
  }

  // Generate invoice number if not exists
  if (revenue.invoices.length === 0) {
    const invoiceNumber = revenue.generateInvoiceNumber();
    revenue.invoices.push({
      invoiceNumber,
      status: 'draft'
    });
    await revenue.save();
  }

  const invoice = revenue.invoices[revenue.invoices.length - 1];

  res.json({
    status: 'success',
    data: {
      invoice,
      revenue,
      breakdown: revenue.getBreakdownPercentages()
    }
  });
});

module.exports = {
  // Studio endpoints
  getStudioRevenue,
  getRevenueDetails,
  addAdjustment,
  requestPayout,
  getPayoutHistory,
  
  // Client endpoints
  getClientSpending,
  downloadSpendingReport,
  
  // Admin endpoints
  getPlatformRevenue,
  getAllPayoutRequests,
  processPayoutRequest,
  updateCommissionRate,
  
  // Shared endpoints
  generateInvoice
};
