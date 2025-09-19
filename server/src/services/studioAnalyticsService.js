const Studio = require('../models/Studio');
const Booking = require('../models/Booking');
const User = require('../models/User');

class StudioAnalyticsService {
  /**
   * Generate comprehensive studio performance metrics
   */
  static async generateStudioMetrics(studioId, period = '30d') {
    const studio = await Studio.findById(studioId);
    if (!studio) {
      throw new Error('Studio not found');
    }

    const dateFilter = this.getDateFilter(period);
    
    // Basic metrics
    const totalBookings = await Booking.countDocuments({
      studio: studioId,
      createdAt: dateFilter
    });

    const completedBookings = await Booking.countDocuments({
      studio: studioId,
      status: 'completed',
      createdAt: dateFilter
    });

    const totalRevenue = await Booking.aggregate([
      {
        $match: {
          studio: studio._id,
          status: 'completed',
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Performance metrics
    const averageRating = studio.ratingAvg || 0;
    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
    
    // Booking trends
    const bookingTrends = await this.getBookingTrends(studioId, period);
    
    // Revenue trends
    const revenueTrends = await this.getRevenueTrends(studioId, period);
    
    // Peak hours analysis
    const peakHours = await this.getPeakHours(studioId, period);
    
    // Customer insights
    const customerInsights = await this.getCustomerInsights(studioId, period);

    return {
      overview: {
        totalBookings,
        completedBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageRating,
        completionRate: Math.round(completionRate * 100) / 100
      },
      trends: {
        bookings: bookingTrends,
        revenue: revenueTrends
      },
      insights: {
        peakHours,
        customers: customerInsights
      },
      period
    };
  }

  /**
   * Get platform-wide studio analytics
   */
  static async getPlatformStudioAnalytics(period = '30d') {
    const dateFilter = this.getDateFilter(period);

    // Studio growth
    const newStudios = await Studio.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Studio performance distribution
    const performanceDistribution = await Studio.aggregate([
      {
        $bucket: {
          groupBy: '$ratingAvg',
          boundaries: [0, 2, 3, 4, 4.5, 5],
          default: 'unrated',
          output: {
            count: { $sum: 1 },
            avgRevenue: { $avg: '$totalRevenue' }
          }
        }
      }
    ]);

    // Geographic distribution
    const geographicDistribution = await Studio.aggregate([
      {
        $group: {
          _id: {
            country: '$location.country',
            city: '$location.city'
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$ratingAvg' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Studio type analytics
    const studioTypeAnalytics = await Studio.aggregate([
      {
        $group: {
          _id: '$studioType',
          count: { $sum: 1 },
          avgRating: { $avg: '$ratingAvg' },
          avgPricePerHour: { $avg: '$services.price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      growth: newStudios,
      performance: performanceDistribution,
      geographic: geographicDistribution,
      studioTypes: studioTypeAnalytics,
      period
    };
  }

  /**
   * Generate studio comparison metrics
   */
  static async compareStudios(studioIds, period = '30d') {
    const dateFilter = this.getDateFilter(period);
    
    const comparisons = await Promise.all(
      studioIds.map(async (studioId) => {
        const studio = await Studio.findById(studioId).lean();
        
        const bookings = await Booking.countDocuments({
          studio: studioId,
          createdAt: dateFilter
        });

        const revenue = await Booking.aggregate([
          {
            $match: {
              studio: studio._id,
              status: 'completed',
              createdAt: dateFilter
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' }
            }
          }
        ]);

        return {
          studio: {
            id: studio._id,
            name: studio.name,
            rating: studio.ratingAvg,
            location: studio.location
          },
          metrics: {
            bookings,
            revenue: revenue[0]?.total || 0,
            utilizationRate: await this.calculateUtilizationRate(studioId, period)
          }
        };
      })
    );

    return {
      comparisons,
      period
    };
  }

  /**
   * Helper methods
   */
  static getDateFilter(period) {
    const now = new Date();
    let dateFilter = {};

    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case '1y':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
      default:
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }

    return dateFilter;
  }

  static async getBookingTrends(studioId, period) {
    const dateFilter = this.getDateFilter(period);
    
    return await Booking.aggregate([
      {
        $match: {
          studio: studioId,
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          bookings: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
  }

  static async getRevenueTrends(studioId, period) {
    const dateFilter = this.getDateFilter(period);
    
    return await Booking.aggregate([
      {
        $match: {
          studio: studioId,
          status: 'completed',
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
  }

  static async getPeakHours(studioId, period) {
    const dateFilter = this.getDateFilter(period);
    
    return await Booking.aggregate([
      {
        $match: {
          studio: studioId,
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: { $hour: '$startTime' },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { bookings: -1 } }
    ]);
  }

  static async getCustomerInsights(studioId, period) {
    const dateFilter = this.getDateFilter(period);
    
    const topCustomers = await Booking.aggregate([
      {
        $match: {
          studio: studioId,
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$user',
          bookings: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    const repeatCustomers = await Booking.aggregate([
      {
        $match: {
          studio: studioId,
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$user',
          bookings: { $sum: 1 }
        }
      },
      {
        $match: { bookings: { $gt: 1 } }
      },
      { $count: 'repeatCustomers' }
    ]);

    return {
      topCustomers,
      repeatCustomerCount: repeatCustomers[0]?.repeatCustomers || 0
    };
  }

  static async calculateUtilizationRate(studioId, period) {
    const dateFilter = this.getDateFilter(period);
    
    // This is a simplified calculation
    // In a real scenario, you'd need to consider studio availability hours
    const totalBookedHours = await Booking.aggregate([
      {
        $match: {
          studio: studioId,
          status: 'completed',
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalHours: {
            $sum: {
              $divide: [
                { $subtract: ['$endTime', '$startTime'] },
                1000 * 60 * 60 // Convert milliseconds to hours
              ]
            }
          }
        }
      }
    ]);

    // Assuming 8 hours per day availability
    const periodDays = this.getPeriodDays(period);
    const availableHours = periodDays * 8;
    const bookedHours = totalBookedHours[0]?.totalHours || 0;
    
    return availableHours > 0 ? (bookedHours / availableHours) * 100 : 0;
  }

  static getPeriodDays(period) {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }
}

module.exports = StudioAnalyticsService;