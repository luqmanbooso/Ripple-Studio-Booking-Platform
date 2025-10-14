const Revenue = require('../models/Revenue');
const Booking = require('../models/Booking');
const Studio = require('../models/Studio');
const ApiError = require('../utils/ApiError');

class RevenueService {
  
  /**
   * Create revenue record from confirmed booking
   */
  static async createRevenueFromBooking(booking, paymentDetails = {}) {
    try {
      // Check if revenue already exists for this booking
      const existingRevenue = await Revenue.findOne({ bookingId: booking._id });
      if (existingRevenue) {
        throw new ApiError('Revenue record already exists for this booking', 400);
      }

      // Get platform commission rate (default 3%)
      const platformCommissionRate = process.env.PLATFORM_COMMISSION_RATE || 0.03;

      // Calculate breakdown from booking
      const breakdown = await this.calculateRevenueBreakdown(booking);
      
      // Calculate required financial fields manually (don't rely on pre-save middleware)
      const slotsTotal = breakdown.slots.amount || 0;
      const servicesTotal = breakdown.services.reduce((sum, service) => sum + service.amount, 0);
      const equipmentTotal = breakdown.equipment.reduce((sum, equipment) => sum + equipment.amount, 0);
      const addOnsTotal = breakdown.addOns.reduce((sum, addOn) => sum + addOn.amount, 0);
      const subtotal = slotsTotal + servicesTotal + equipmentTotal + addOnsTotal;
      const platformCommission = subtotal * platformCommissionRate;
      const studioEarnings = subtotal - platformCommission;
      
      // Create revenue record
      const revenue = new Revenue({
        bookingId: booking._id,
        studio: booking.studio,
        client: booking.client,
        breakdown,
        subtotal,
        platformCommissionRate: parseFloat(platformCommissionRate),
        platformCommission,
        studioEarnings,
        totalAmount: subtotal,
        invoices: [], // Initialize empty invoices array
        paymentDetails: {
          paymentId: paymentDetails.paymentId,
          paymentMethod: paymentDetails.paymentMethod || 'card',
          paymentDate: paymentDetails.paymentDate || new Date(),
          currency: booking.currency || 'LKR'
        },
        status: 'confirmed'
      });

      // Add audit log
      revenue.addAuditLog('revenue_created', null, {
        bookingId: booking._id,
        totalAmount: revenue.totalAmount
      });

      await revenue.save();
      return revenue;
    } catch (error) {
      throw new ApiError(`Failed to create revenue record: ${error.message}`, 500);
    }
  }

  /**
   * Calculate revenue breakdown from booking
   */
  static async calculateRevenueBreakdown(booking) {
    const breakdown = {
      slots: { amount: 0, hours: 0, rate: 0 },
      services: [],
      equipment: [],
      addOns: []
    };

    // Calculate slot revenue
    if (booking.start && booking.end) {
      const startTime = new Date(booking.start);
      const endTime = new Date(booking.end);
      const hours = (endTime - startTime) / (1000 * 60 * 60);
      
      breakdown.slots = {
        amount: booking.price || 0,
        hours: hours,
        rate: hours > 0 ? (booking.price || 0) / hours : 0
      };
    }

    // Add services
    if (booking.services && booking.services.length > 0) {
      breakdown.services = booking.services.map(service => ({
        name: service.name,
        amount: service.price || 0,
        category: service.category || 'general'
      }));
    } else if (booking.service) {
      // Legacy single service support
      breakdown.services = [{
        name: booking.service.name,
        amount: booking.service.price || 0,
        category: 'general'
      }];
    }

    // Add equipment
    if (booking.equipment && booking.equipment.length > 0) {
      breakdown.equipment = booking.equipment.map(item => ({
        name: item.name,
        amount: item.rentalPrice || 0,
        hours: breakdown.slots.hours,
        rate: item.rentalPrice || 0
      }));
    }

    return breakdown;
  }

  /**
   * Update revenue status based on booking status
   */
  static async updateRevenueStatus(bookingId, newStatus, userId = null) {
    try {
      const revenue = await Revenue.findOne({ bookingId });
      if (!revenue) {
        throw new ApiError('Revenue record not found', 404);
      }

      const statusMapping = {
        'confirmed': 'confirmed',
        'completed': 'confirmed',
        'cancelled': 'refunded',
        'disputed': 'disputed'
      };

      const revenueStatus = statusMapping[newStatus] || revenue.status;
      
      if (revenue.status !== revenueStatus) {
        revenue.status = revenueStatus;
        revenue.addAuditLog('status_updated', userId, {
          oldStatus: revenue.status,
          newStatus: revenueStatus,
          bookingStatus: newStatus
        });
        
        await revenue.save();
      }

      return revenue;
    } catch (error) {
      throw new ApiError(`Failed to update revenue status: ${error.message}`, 500);
    }
  }

  /**
   * Process refund
   */
  static async processRefund(revenueId, refundAmount, reason, processedBy) {
    try {
      const revenue = await Revenue.findById(revenueId);
      if (!revenue) {
        throw new ApiError('Revenue record not found', 404);
      }

      // Validate refund amount
      const totalRefunded = revenue.refunds.reduce((sum, refund) => sum + refund.amount, 0);
      if (totalRefunded + refundAmount > revenue.totalAmount) {
        throw new ApiError('Refund amount exceeds total revenue', 400);
      }

      // Add refund record
      revenue.refunds.push({
        amount: refundAmount,
        reason,
        processedBy,
        refundId: `REF-${Date.now()}`
      });

      // Update status if fully refunded
      if (totalRefunded + refundAmount >= revenue.totalAmount) {
        revenue.status = 'refunded';
      }

      revenue.addAuditLog('refund_processed', processedBy, {
        refundAmount,
        reason,
        totalRefunded: totalRefunded + refundAmount
      });

      await revenue.save();
      return revenue;
    } catch (error) {
      throw new ApiError(`Failed to process refund: ${error.message}`, 500);
    }
  }

  /**
   * Add adjustment (tip, discount, fee, etc.)
   */
  static async addAdjustment(revenueId, amount, reason, type, appliedBy) {
    try {
      const revenue = await Revenue.findById(revenueId);
      if (!revenue) {
        throw new ApiError('Revenue record not found', 404);
      }

      revenue.adjustments.push({
        amount,
        reason,
        type,
        appliedBy
      });

      revenue.addAuditLog('adjustment_added', appliedBy, {
        adjustmentType: type,
        amount,
        reason
      });

      await revenue.save();
      return revenue;
    } catch (error) {
      throw new ApiError(`Failed to add adjustment: ${error.message}`, 500);
    }
  }

  /**
   * Request payout
   */
  static async requestPayout(studioId, amount, bankDetails, requestedBy) {
    try {
      // Find all confirmed revenues for studio that haven't been paid out
      const revenues = await Revenue.find({
        studio: studioId,
        status: 'confirmed'
      });

      let totalAvailable = 0;
      const revenueIds = [];

      for (const revenue of revenues) {
        const availableAmount = revenue.pendingPayoutAmount;
        if (availableAmount > 0) {
          totalAvailable += availableAmount;
          revenueIds.push(revenue._id);
        }
      }

      if (amount > totalAvailable) {
        throw new ApiError(`Insufficient funds. Available: ${totalAvailable}`, 400);
      }

      // Create payout requests across revenues
      let remainingAmount = amount;
      const payoutRequests = [];

      for (const revenueId of revenueIds) {
        if (remainingAmount <= 0) break;

        const revenue = await Revenue.findById(revenueId);
        const availableAmount = revenue.pendingPayoutAmount;
        const payoutAmount = Math.min(remainingAmount, availableAmount);

        if (payoutAmount > 0) {
          const payoutRequest = {
            amount: payoutAmount,
            bankDetails,
            status: 'requested'
          };

          revenue.payouts.push(payoutRequest);
          revenue.addAuditLog('payout_requested', requestedBy, {
            payoutAmount,
            bankDetails: { ...bankDetails, accountNumber: '****' + bankDetails.accountNumber.slice(-4) }
          });

          await revenue.save();
          payoutRequests.push({ revenueId, amount: payoutAmount });
          remainingAmount -= payoutAmount;
        }
      }

      return {
        totalAmount: amount,
        payoutRequests,
        status: 'requested'
      };
    } catch (error) {
      throw new ApiError(`Failed to request payout: ${error.message}`, 500);
    }
  }

  /**
   * Process payout (Admin function)
   */
  static async processPayout(revenueId, payoutIndex, status, processedBy, payoutId = null) {
    try {
      const revenue = await Revenue.findById(revenueId);
      if (!revenue) {
        throw new ApiError('Revenue record not found', 404);
      }

      if (!revenue.payouts[payoutIndex]) {
        throw new ApiError('Payout request not found', 404);
      }

      const payout = revenue.payouts[payoutIndex];
      payout.status = status;
      payout.processedBy = processedBy;
      payout.processedAt = new Date();
      
      if (payoutId) {
        payout.payoutId = payoutId;
      }

      if (status === 'completed') {
        revenue.status = 'paid_out';
      }

      revenue.addAuditLog('payout_processed', processedBy, {
        payoutAmount: payout.amount,
        newStatus: status,
        payoutId
      });

      await revenue.save();
      return revenue;
    } catch (error) {
      throw new ApiError(`Failed to process payout: ${error.message}`, 500);
    }
  }

  /**
   * Generate revenue statistics
   */
  static async getRevenueStatistics(filters = {}) {
    try {
      // Base statistics
      const stats = await Revenue.getRevenueStats(filters);

      // Additional breakdowns
      const [
        monthlyTrends,
        topStudios,
        revenueByStatus
      ] = await Promise.all([
        this.getMonthlyTrends(filters),
        this.getTopStudios(filters),
        this.getRevenueByStatus(filters)
      ]);

      return {
        ...stats,
        monthlyTrends,
        topStudios,
        revenueByStatus
      };
    } catch (error) {
      throw new ApiError(`Failed to generate statistics: ${error.message}`, 500);
    }
  }

  /**
   * Get monthly revenue trends
   */
  static async getMonthlyTrends(filters = {}) {
    const pipeline = [
      { $match: filters },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          totalCommission: { $sum: '$platformCommission' },
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ];

    return await Revenue.aggregate(pipeline);
  }

  /**
   * Get top studios by revenue
   */
  static async getTopStudios(filters = {}, limit = 10) {
    const pipeline = [
      { $match: filters },
      {
        $group: {
          _id: '$studio',
          totalRevenue: { $sum: '$studioEarnings' },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'studios',
          localField: '_id',
          foreignField: '_id',
          as: 'studioInfo'
        }
      }
    ];

    return await Revenue.aggregate(pipeline);
  }

  /**
   * Get revenue breakdown by status
   */
  static async getRevenueByStatus(filters = {}) {
    const pipeline = [
      { $match: filters },
      {
        $group: {
          _id: '$status',
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ];

    return await Revenue.aggregate(pipeline);
  }
}

module.exports = RevenueService;
