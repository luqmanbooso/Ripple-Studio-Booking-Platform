const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const Studio = require('../models/Studio');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notificationService');

// Create a new ticket
const createTicket = catchAsync(async (req, res) => {
  const { bookingId, type, title, description, priority, evidence } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  // Validate booking exists and user has access
  const booking = await Booking.findById(bookingId).populate('studio client');
  if (!booking) {
    throw new ApiError('Booking not found', 404);
  }

  // Check if user can create ticket for this booking
  const canCreateTicket = 
    (userRole === 'client' && booking.client._id.toString() === userId.toString()) ||
    (userRole === 'studio' && booking.studio.user.toString() === userId.toString()) ||
    userRole === 'admin';

  if (!canCreateTicket) {
    throw new ApiError('Access denied', 403);
  }

  const ticket = await Ticket.create({
    type,
    title,
    description,
    priority: priority || 'medium',
    booking: bookingId,
    studio: booking.studio._id,
    client: booking.client._id,
    createdBy: userId,
    createdByRole: userRole,
    evidence: evidence || []
  });

  await ticket.populate('booking studio client createdBy');

  // Send notifications
  if (userRole === 'client') {
    // Notify studio and admin
    await notificationService.notifyStudio(booking.studio._id, {
      type: 'ticket_created',
      title: 'New Ticket Created',
      message: `Client has created a ticket for booking #${booking._id}`,
      data: { ticketId: ticket.ticketId, bookingId }
    });
  } else if (userRole === 'studio') {
    // Notify client and admin
    await notificationService.notifyUser(booking.client._id, {
      type: 'ticket_created',
      title: 'Ticket Created by Studio',
      message: `Studio has created a ticket for your booking #${booking._id}`,
      data: { ticketId: ticket.ticketId, bookingId }
    });
  }

  // Always notify admin
  await notificationService.createAdminNotification({
    type: 'ticket_created',
    title: 'New Support Ticket',
    message: `New ${type} ticket created for booking #${booking._id}`,
    data: { ticketId: ticket.ticketId, priority: ticket.priority },
    priority: ticket.priority === 'urgent' ? 'high' : 'medium'
  });

  res.status(201).json({
    status: 'success',
    data: { ticket }
  });
});

// Get tickets (filtered by user role)
const getTickets = catchAsync(async (req, res) => {
  const { status, priority, type, page = 1, limit = 20 } = req.query;
  const userId = req.user._id;
  const userRole = req.user.role;

  let filter = {};

  // Role-based filtering
  if (userRole === 'client') {
    filter.client = userId;
  } else if (userRole === 'studio') {
    // Get studio ID
    const studio = await Studio.findOne({ user: userId });
    if (studio) {
      filter.studio = studio._id;
    } else {
      return res.json({ status: 'success', data: { tickets: [], total: 0 } });
    }
  }
  // Admin can see all tickets (no additional filter)

  // Apply query filters
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (type) filter.type = type;

  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('booking studio client createdBy assignedTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Ticket.countDocuments(filter)
  ]);

  res.json({
    status: 'success',
    data: {
      tickets,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Get single ticket
const getTicket = catchAsync(async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const ticket = await Ticket.findOne({ ticketId })
    .populate('booking studio client createdBy assignedTo messages.sender');

  if (!ticket) {
    throw new ApiError('Ticket not found', 404);
  }

  // Check access permissions
  const hasAccess = 
    userRole === 'admin' ||
    (userRole === 'client' && ticket.client._id.toString() === userId.toString()) ||
    (userRole === 'studio' && ticket.studio.user.toString() === userId.toString());

  if (!hasAccess) {
    throw new ApiError('Access denied', 403);
  }

  res.json({
    status: 'success',
    data: { ticket }
  });
});

// Add message to ticket
const addMessage = catchAsync(async (req, res) => {
  const { ticketId } = req.params;
  const { message, isInternal = false } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  const ticket = await Ticket.findOne({ ticketId })
    .populate('booking studio client');

  if (!ticket) {
    throw new ApiError('Ticket not found', 404);
  }

  // Check access permissions
  const hasAccess = 
    userRole === 'admin' ||
    (userRole === 'client' && ticket.client._id.toString() === userId.toString()) ||
    (userRole === 'studio' && ticket.studio.user.toString() === userId.toString());

  if (!hasAccess) {
    throw new ApiError('Access denied', 403);
  }

  // Only admin can add internal messages
  const isInternalMessage = isInternal && userRole === 'admin';

  await ticket.addMessage(userId, userRole, message, isInternalMessage);

  // Notify other parties (except sender)
  if (!isInternalMessage) {
    if (userRole !== 'client') {
      await notificationService.notifyUser(ticket.client._id, {
        type: 'ticket_message',
        title: 'New Message on Your Ticket',
        message: `New message on ticket #${ticket.ticketId}`,
        data: { ticketId: ticket.ticketId }
      });
    }

    if (userRole !== 'studio') {
      await notificationService.notifyStudio(ticket.studio._id, {
        type: 'ticket_message',
        title: 'New Message on Ticket',
        message: `New message on ticket #${ticket.ticketId}`,
        data: { ticketId: ticket.ticketId }
      });
    }

    if (userRole !== 'admin') {
      await notificationService.createAdminNotification({
        type: 'ticket_message',
        title: 'New Ticket Message',
        message: `New message on ticket #${ticket.ticketId}`,
        data: { ticketId: ticket.ticketId }
      });
    }
  }

  await ticket.populate('messages.sender');

  res.json({
    status: 'success',
    data: { ticket }
  });
});

// Update ticket status (admin only)
const updateTicketStatus = catchAsync(async (req, res) => {
  const { ticketId } = req.params;
  const { status, resolution, resolutionType, refundAmount } = req.body;

  if (req.user.role !== 'admin') {
    throw new ApiError('Access denied', 403);
  }

  const ticket = await Ticket.findOne({ ticketId })
    .populate('booking studio client');

  if (!ticket) {
    throw new ApiError('Ticket not found', 404);
  }

  await ticket.updateStatus(status, {
    resolution,
    resolutionType,
    refundAmount
  });

  // Notify all parties
  const statusMessage = status === 'resolved' ? 'resolved' : 
                       status === 'closed' ? 'closed' : 
                       status === 'in_progress' ? 'being processed' : status;

  await Promise.all([
    notificationService.notifyUser(ticket.client._id, {
      type: 'ticket_status_updated',
      title: 'Ticket Status Updated',
      message: `Your ticket #${ticket.ticketId} is now ${statusMessage}`,
      data: { ticketId: ticket.ticketId, status }
    }),
    notificationService.notifyStudio(ticket.studio._id, {
      type: 'ticket_status_updated',
      title: 'Ticket Status Updated',
      message: `Ticket #${ticket.ticketId} is now ${statusMessage}`,
      data: { ticketId: ticket.ticketId, status }
    })
  ]);

  res.json({
    status: 'success',
    data: { ticket }
  });
});

// Assign ticket to admin
const assignTicket = catchAsync(async (req, res) => {
  const { ticketId } = req.params;
  const { adminId } = req.body;

  if (req.user.role !== 'admin') {
    throw new ApiError('Access denied', 403);
  }

  const ticket = await Ticket.findOne({ ticketId });
  if (!ticket) {
    throw new ApiError('Ticket not found', 404);
  }

  // Verify adminId is actually an admin
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new ApiError('Invalid admin ID', 400);
  }

  await ticket.assignTo(adminId);

  res.json({
    status: 'success',
    data: { ticket }
  });
});

// Get ticket statistics (admin only)
const getTicketStats = catchAsync(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError('Access denied', 403);
  }

  const [statusStats, priorityStats, typeStats, overdueTickets] = await Promise.all([
    Ticket.getTicketStats(),
    Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    Ticket.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    Ticket.getOverdueTickets()
  ]);

  const totalTickets = await Ticket.countDocuments();
  const openTickets = await Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } });
  const avgResolutionTime = await Ticket.aggregate([
    { $match: { status: { $in: ['resolved', 'closed'] }, resolvedAt: { $exists: true } } },
    {
      $project: {
        resolutionTime: {
          $divide: [
            { $subtract: ['$resolvedAt', '$createdAt'] },
            1000 * 60 * 60 // Convert to hours
          ]
        }
      }
    },
    { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } }
  ]);

  res.json({
    status: 'success',
    data: {
      totalTickets,
      openTickets,
      overdueCount: overdueTickets.length,
      avgResolutionHours: avgResolutionTime[0]?.avgTime || 0,
      statusBreakdown: statusStats,
      priorityBreakdown: priorityStats,
      typeBreakdown: typeStats,
      overdueTickets: overdueTickets.slice(0, 10) // Limit to 10 for dashboard
    }
  });
});

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  addMessage,
  updateTicketStatus,
  assignTicket,
  getTicketStats
};
