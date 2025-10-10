const express = require('express');
const { z } = require('zod');
const revenueController = require('../controllers/revenueController');
const { validate, objectId } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

// ==================== VALIDATION SCHEMAS ====================

const adjustmentSchema = {
  body: z.object({
    amount: z.number().min(-10000).max(10000),
    reason: z.string().min(1).max(500),
    type: z.enum(['tip', 'discount', 'fee', 'correction'])
  })
};

const payoutRequestSchema = {
  body: z.object({
    amount: z.number().min(1).max(100000),
    bankDetails: z.object({
      accountNumber: z.string().min(5).max(30),
      bankName: z.string().min(2).max(100),
      accountHolder: z.string().min(2).max(100),
      routingNumber: z.string().optional(),
      swiftCode: z.string().optional()
    })
  })
};

const payoutProcessSchema = {
  body: z.object({
    status: z.enum(['approved', 'processing', 'completed', 'failed']),
    payoutId: z.string().optional(),
    notes: z.string().max(1000).optional()
  })
};

const commissionRateSchema = {
  body: z.object({
    rate: z.number().min(0).max(1)
  })
};

const querySchema = {
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    status: z.enum(['pending', 'confirmed', 'disputed', 'refunded', 'paid_out']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    studioId: objectId.optional()
  })
};

const payoutQuerySchema = {
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    status: z.enum(['requested', 'approved', 'processing', 'completed', 'failed']).optional()
  })
};

const platformQuerySchema = {
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    studioId: objectId.optional()
  })
};

// ==================== STUDIO ROUTES ====================

// Get studio revenue dashboard
router.get('/studio', 
  authenticate, 
  allowRoles('studio'), 
  validate(querySchema),
  revenueController.getStudioRevenue
);

// Get studio payout history
router.get('/studio/payouts', 
  authenticate, 
  allowRoles('studio'),
  validate(querySchema),
  revenueController.getPayoutHistory
);

// Request payout
router.post('/studio/payout', 
  authenticate, 
  allowRoles('studio'),
  validate(payoutRequestSchema),
  revenueController.requestPayout
);

// ==================== CLIENT ROUTES ====================

// Get client spending history
router.get('/client', 
  authenticate, 
  allowRoles('client'),
  validate(querySchema),
  revenueController.getClientSpending
);

// Download spending report
router.get('/client/export', 
  authenticate, 
  allowRoles('client'),
  revenueController.downloadSpendingReport
);

// ==================== ADMIN ROUTES ====================

// Get platform revenue overview
router.get('/admin/platform', 
  authenticate, 
  allowRoles('admin'),
  validate(platformQuerySchema),
  revenueController.getPlatformRevenue
);

// Get all payout requests
router.get('/admin/payouts', 
  authenticate, 
  allowRoles('admin'),
  validate(payoutQuerySchema),
  revenueController.getAllPayoutRequests
);

// Process payout request
router.patch('/admin/payouts/:revenueId/:payoutIndex', 
  authenticate, 
  allowRoles('admin'),
  validate(payoutProcessSchema),
  revenueController.processPayoutRequest
);

// Update commission rate
router.patch('/admin/commission-rate', 
  authenticate, 
  allowRoles('admin'),
  validate(commissionRateSchema),
  revenueController.updateCommissionRate
);

// Get any studio's revenue (admin only)
router.get('/admin/studio/:studioId', 
  authenticate, 
  allowRoles('admin'),
  validate(querySchema),
  revenueController.getStudioRevenue
);

// ==================== SHARED ROUTES ====================

// Get revenue details (role-based access)
router.get('/:id', 
  authenticate,
  revenueController.getRevenueDetails
);

// Add adjustment to revenue (studio owners only)
router.post('/:id/adjustments', 
  authenticate, 
  allowRoles('studio', 'admin'),
  validate(adjustmentSchema),
  revenueController.addAdjustment
);

// Generate invoice
router.post('/:id/invoice', 
  authenticate,
  allowRoles('studio', 'admin'),
  revenueController.generateInvoice
);

module.exports = router;
