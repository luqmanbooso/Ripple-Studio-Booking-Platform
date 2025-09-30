const express = require("express");
const router = express.Router();

const {
  submitGeneralFeedback,
  submitFeatureRequest,
  submitBugReport,
  getMyFeedback,
  voteFeedback,
  removeVote,
  getPublicFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  respondToFeedback,
  getFeedbackAnalytics,
} = require("../controllers/feedbackController");

const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { validateFeedback } = require("../middleware/validate");

// Public routes
router.post("/general", validateFeedback("general"), submitGeneralFeedback);
router.post("/feature", validateFeedback("feature"), submitFeatureRequest);
router.post(
  "/bug",
  upload.single("screenshot"),
  validateFeedback("bug"),
  submitBugReport
);

// Get public feature requests (with voting)
router.get("/public", getPublicFeedback);

// Protected routes
router.use(protect);

// User routes
router.get("/my-feedback", getMyFeedback);
router.post("/:id/vote", voteFeedback);
router.delete("/:id/vote", removeVote);

// Admin routes
router.use(authorize("admin"));
router.get("/admin/all", getAllFeedback);
router.get("/admin/analytics", getFeedbackAnalytics);
router.put("/admin/:id/status", updateFeedbackStatus);
router.post("/admin/:id/respond", respondToFeedback);

module.exports = router;
