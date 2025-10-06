const express = require('express');
const { z } = require('zod');
const ticketController = require('../controllers/ticketController');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

const createTicketSchema = {
  body: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
    type: z.enum(['cancellation', 'refund', 'dispute', 'no_show', 'quality_issue', 'technical_issue', 'other']),
    title: z.string().min(5).max(200),
    description: z.string().min(10).max(2000),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    evidence: z.array(z.object({
      type: z.enum(['image', 'document', 'audio', 'video']),
      url: z.string().url(),
      filename: z.string()
    })).optional()
  })
};

const addMessageSchema = {
  body: z.object({
    message: z.string().min(1).max(1000),
    isInternal: z.boolean().optional()
  })
};

const updateStatusSchema = {
  body: z.object({
    status: z.enum(['open', 'in_progress', 'resolved', 'closed', 'escalated']),
    resolution: z.string().max(1000).optional(),
    resolutionType: z.enum(['full_refund', 'partial_refund', 'reschedule', 'credit', 'no_action', 'other']).optional(),
    refundAmount: z.number().min(0).optional()
  })
};

const assignTicketSchema = {
  body: z.object({
    adminId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid admin ID')
  })
};

// All routes require authentication
router.use(authenticate);

// Create ticket (clients and studios can create tickets)
router.post('/', 
  allowRoles('client', 'studio', 'admin'), 
  validate(createTicketSchema), 
  ticketController.createTicket
);

// Get tickets (filtered by role)
router.get('/', ticketController.getTickets);

// Get ticket statistics (admin only)
router.get('/stats', 
  allowRoles('admin'), 
  ticketController.getTicketStats
);

// Get single ticket
router.get('/:ticketId', ticketController.getTicket);

// Add message to ticket
router.post('/:ticketId/messages', 
  validate(addMessageSchema), 
  ticketController.addMessage
);

// Update ticket status (admin only)
router.patch('/:ticketId/status', 
  allowRoles('admin'), 
  validate(updateStatusSchema), 
  ticketController.updateTicketStatus
);

// Assign ticket (admin only)
router.patch('/:ticketId/assign', 
  allowRoles('admin'), 
  validate(assignTicketSchema), 
  ticketController.assignTicket
);

module.exports = router;
