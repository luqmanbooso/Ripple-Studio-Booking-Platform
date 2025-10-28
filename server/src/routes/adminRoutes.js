const express = require("express");
const { z } = require("zod");
const adminController = require("../controllers/adminController");
const walletController = require("../controllers/walletController");
const { authenticate } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const { validate, pagination } = require("../middleware/validate");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(allowRoles("admin"));

// Analytics
router.get("/analytics", adminController.getAnalytics);
router.get("/revenue", adminController.getRevenueAnalytics);

// User Management
router.get("/users", adminController.getUsers);
router.get("/users/stats", adminController.getUserStats);
router.patch("/users/:id/role", adminController.updateUserRole);
router.patch("/users/:id/verify", adminController.verifyUser);
router.patch("/users/:id/unverify", adminController.unverifyUser);
router.patch("/users/:id/block", adminController.blockUser);
router.patch("/users/:id/unblock", adminController.unblockUser);
router.patch("/users/:id/status", adminController.toggleUserStatus);
router.delete("/users/:id", adminController.deleteUser);
router.post("/users/bulk-actions", adminController.bulkUserActions);

// Booking Management
router.get("/bookings", adminController.getBookings);

// Review Management
router.get("/reviews", adminController.getReviews);
router.patch("/reviews/:id/approve", adminController.approveReview);

// Studio Management
const studioSchema = {
  body: z.object({
    name: z.string().min(1, "Studio name is required"),
    description: z.string().optional(),
    location: z.object({
      city: z.string().min(1, "City is required"),
      address: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }),
    equipment: z.array(z.string()).optional(),
    amenities: z.array(z.string()).optional(),
    services: z
      .array(
        z.object({
          name: z.string(),
          price: z.number().min(0),
          durationMins: z.number().min(30),
          description: z.string().optional(),
        })
      )
      .optional(),
    hourlyRate: z.number().min(0).optional(),
    capacity: z.number().min(1).optional(),
    ownerEmail: z.string().email("Valid email is required"),
  }),
};

const updateStudioSchema = {
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    location: z
      .object({
        city: z.string().min(1),
        address: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
      })
      .optional(),
    equipment: z.array(z.string()).optional(),
    amenities: z.array(z.string()).optional(),
    services: z
      .array(
        z.object({
          name: z.string(),
          price: z.number().min(0),
          durationMins: z.number().min(30),
          description: z.string().optional(),
        })
      )
      .optional(),
    hourlyRate: z.number().min(0).optional(),
    capacity: z.number().min(1).optional(),
  }),
};

router.get("/studios", adminController.getStudios);
router.get("/studios/pending", adminController.getPendingStudios);
router.post("/studios", validate(studioSchema), adminController.createStudio);
router.patch(
  "/studios/:id",
  validate(updateStudioSchema),
  adminController.updateStudio
);
router.patch("/studios/:id/approve", adminController.approveStudio);
router.patch("/studios/:id/reject", adminController.rejectStudio);
router.delete("/studios/:id", adminController.deleteStudio);

// Wallet/Payout Management
router.get("/wallet/withdrawals", walletController.getWithdrawalRequests);
router.post(
  "/wallet/withdrawals/:transactionId/process",
  walletController.processWithdrawal
);

module.exports = router;
