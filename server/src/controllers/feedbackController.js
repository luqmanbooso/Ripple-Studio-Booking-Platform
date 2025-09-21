const Feedback = require("../models/Feedback");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const cloudinary = require("../config/cloudinary");

// @desc    Submit general feedback
// @route   POST /api/feedback/general
// @access  Public
const submitGeneralFeedback = catchAsync(async (req, res) => {
  const {
    rating,
    category,
    title,
    description,
    email,
    anonymous = false,
  } = req.body;

  // Validation
  if (!rating || !category || !description) {
    throw new ApiError(400, "Rating, category, and description are required");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Get user info
  const userId = req.user?.id || null;
  const userEmail = email || req.user?.email || null;

  // Create feedback
  const feedback = await Feedback.create({
    type: "general",
    rating,
    category,
    title: title?.trim() || null,
    description: description.trim(),
    user: anonymous ? null : userId,
    email: userEmail,
    anonymous,
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    source: "web",
  });

  await feedback.populate("user", "name email avatar");

  logger.info("General feedback submitted", {
    feedbackId: feedback._id,
    userId,
    category,
    rating,
    anonymous,
  });

  res.status(201).json({
    success: true,
    message: "Thank you for your feedback!",
    data: {
      feedback: {
        id: feedback._id,
        type: feedback.type,
        rating: feedback.rating,
        category: feedback.formattedCategory,
        title: feedback.title,
        description: feedback.description,
        status: feedback.status,
        createdAt: feedback.createdAt,
      },
    },
  });
});

// @desc    Submit feature request
// @route   POST /api/feedback/feature
// @access  Public
const submitFeatureRequest = catchAsync(async (req, res) => {
  const {
    title,
    description,
    category,
    priority = "medium",
    useCase,
    email,
  } = req.body;

  // Validation
  if (!title || !description || !category) {
    throw new ApiError(400, "Title, description, and category are required");
  }

  // Get user info
  const userId = req.user?.id || null;
  const userEmail = email || req.user?.email || null;

  // Create feature request
  const feedback = await Feedback.create({
    type: "feature",
    title: title.trim(),
    description: description.trim(),
    category,
    priority,
    useCase: useCase?.trim() || null,
    user: userId,
    email: userEmail,
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    source: "web",
  });

  await feedback.populate("user", "name email avatar");

  logger.info("Feature request submitted", {
    feedbackId: feedback._id,
    userId,
    title: feedback.title,
    category,
    priority,
  });

  res.status(201).json({
    success: true,
    message: "Feature request submitted successfully!",
    data: {
      feedback: {
        id: feedback._id,
        type: feedback.type,
        title: feedback.title,
        description: feedback.description,
        category: feedback.formattedCategory,
        priority: feedback.priority,
        status: feedback.status,
        createdAt: feedback.createdAt,
      },
    },
  });
});

// @desc    Submit bug report
// @route   POST /api/feedback/bug
// @access  Public
const submitBugReport = catchAsync(async (req, res) => {
  const {
    title,
    description,
    severity = "medium",
    stepsToReproduce,
    expectedBehavior,
    actualBehavior,
    browser,
    device,
    email,
  } = req.body;

  // Validation
  if (!title || !description || !stepsToReproduce) {
    throw new ApiError(
      400,
      "Title, description, and steps to reproduce are required"
    );
  }

  // Get user info
  const userId = req.user?.id || null;
  const userEmail = email || req.user?.email || null;

  // Handle screenshot upload if present
  let screenshot = null;
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "feedback/screenshots",
        resource_type: "image",
        transformation: [
          { width: 1200, height: 800, crop: "limit", quality: "auto" },
        ],
      });

      screenshot = {
        url: result.secure_url,
        publicId: result.public_id,
        filename: req.file.originalname,
      };
    } catch (error) {
      logger.error("Screenshot upload failed", error);
      // Continue without screenshot
    }
  }

  // Create bug report
  const feedback = await Feedback.create({
    type: "bug",
    title: title.trim(),
    description: description.trim(),
    severity,
    stepsToReproduce: stepsToReproduce.trim(),
    expectedBehavior: expectedBehavior?.trim() || null,
    actualBehavior: actualBehavior?.trim() || null,
    environment: {
      browser: browser?.trim() || null,
      device: device?.trim() || null,
      userAgent: req.get("User-Agent"),
    },
    screenshot,
    user: userId,
    email: userEmail,
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    source: "web",
  });

  await feedback.populate("user", "name email avatar");

  logger.info("Bug report submitted", {
    feedbackId: feedback._id,
    userId,
    title: feedback.title,
    severity,
    hasScreenshot: !!screenshot,
  });

  res.status(201).json({
    success: true,
    message: "Bug report submitted successfully!",
    data: {
      feedback: {
        id: feedback._id,
        type: feedback.type,
        title: feedback.title,
        description: feedback.description,
        severity: feedback.severity,
        status: feedback.status,
        createdAt: feedback.createdAt,
        hasScreenshot: !!screenshot,
      },
    },
  });
});

// @desc    Get user's feedback submissions
// @route   GET /api/feedback/my-feedback
// @access  Private
const getMyFeedback = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, type, status } = req.query;

  const query = { user: req.user.id };
  if (type) query.type = type;
  if (status) query.status = status;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: {
      path: "response.respondedBy",
      select: "name email avatar",
    },
  };

  const feedback = await Feedback.paginate(query, options);

  res.json({
    success: true,
    data: feedback,
  });
});

// @desc    Vote on feedback (for feature requests)
// @route   POST /api/feedback/:id/vote
// @access  Private
const voteFeedback = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { voteType } = req.body; // 'up' or 'down'

  if (!["up", "down"].includes(voteType)) {
    throw new ApiError(400, 'Vote type must be "up" or "down"');
  }

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  // Only allow voting on feature requests
  if (feedback.type !== "feature") {
    throw new ApiError(400, "Voting is only allowed on feature requests");
  }

  await feedback.addVote(req.user.id, voteType);

  res.json({
    success: true,
    message: "Vote recorded successfully",
    data: {
      voteScore: feedback.voteScore,
      upvotes: feedback.votes.upvotes,
      downvotes: feedback.votes.downvotes,
    },
  });
});

// @desc    Remove vote from feedback
// @route   DELETE /api/feedback/:id/vote
// @access  Private
const removeVote = catchAsync(async (req, res) => {
  const { id } = req.params;

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  await feedback.removeVote(req.user.id);

  res.json({
    success: true,
    message: "Vote removed successfully",
    data: {
      voteScore: feedback.voteScore,
      upvotes: feedback.votes.upvotes,
      downvotes: feedback.votes.downvotes,
    },
  });
});

// @desc    Get public feedback (feature requests with votes)
// @route   GET /api/feedback/public
// @access  Public
const getPublicFeedback = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    sort = "votes", // 'votes', 'recent', 'popular'
  } = req.query;

  const query = {
    type: "feature",
    status: { $in: ["pending", "in_review", "in_progress"] },
  };

  if (category) query.category = category;

  let sortOptions = {};
  switch (sort) {
    case "votes":
      sortOptions = { "votes.upvotes": -1, createdAt: -1 };
      break;
    case "recent":
      sortOptions = { createdAt: -1 };
      break;
    case "popular":
      sortOptions = { "votes.upvotes": -1, "votes.downvotes": 1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortOptions,
    populate: {
      path: "user",
      select: "name avatar",
    },
    select: "-email -ipAddress -userAgent -adminNotes",
  };

  const feedback = await Feedback.paginate(query, options);

  res.json({
    success: true,
    data: feedback,
  });
});

// Admin-only routes

// @desc    Get all feedback for admin
// @route   GET /api/feedback/admin/all
// @access  Private (Admin)
const getAllFeedback = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    status,
    category,
    priority,
    severity,
    assignedTo,
    search,
  } = req.query;

  const query = {};

  if (type) query.type = type;
  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (severity) query.severity = severity;
  if (assignedTo) query.assignedTo = assignedTo;

  // Text search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "user", select: "name email avatar role" },
      { path: "assignedTo", select: "name email avatar" },
      { path: "response.respondedBy", select: "name email avatar" },
    ],
  };

  const feedback = await Feedback.paginate(query, options);

  res.json({
    success: true,
    data: feedback,
  });
});

// @desc    Update feedback status
// @route   PUT /api/feedback/admin/:id/status
// @access  Private (Admin)
const updateFeedbackStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo, adminNotes, tags } = req.body;

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  // Update fields
  if (status) feedback.status = status;
  if (assignedTo) feedback.assignedTo = assignedTo;
  if (adminNotes) feedback.adminNotes = adminNotes;
  if (tags) feedback.tags = tags;

  await feedback.save();
  await feedback.populate([
    { path: "user", select: "name email avatar" },
    { path: "assignedTo", select: "name email avatar" },
  ]);

  logger.info("Feedback status updated", {
    feedbackId: feedback._id,
    newStatus: status,
    updatedBy: req.user.id,
  });

  res.json({
    success: true,
    message: "Feedback updated successfully",
    data: { feedback },
  });
});

// @desc    Respond to feedback
// @route   POST /api/feedback/admin/:id/respond
// @access  Private (Admin)
const respondToFeedback = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    throw new ApiError(400, "Response message is required");
  }

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  feedback.response = {
    message: message.trim(),
    respondedBy: req.user.id,
    respondedAt: new Date(),
  };

  await feedback.save();
  await feedback.populate([
    { path: "user", select: "name email avatar" },
    { path: "response.respondedBy", select: "name email avatar" },
  ]);

  logger.info("Feedback response added", {
    feedbackId: feedback._id,
    respondedBy: req.user.id,
  });

  res.json({
    success: true,
    message: "Response added successfully",
    data: { feedback },
  });
});

// @desc    Get feedback analytics
// @route   GET /api/feedback/admin/analytics
// @access  Private (Admin)
const getFeedbackAnalytics = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const [analytics, topCategories] = await Promise.all([
    Feedback.getAnalytics(startDate, endDate),
    Feedback.getTopCategories(),
  ]);

  const totalCount = await Feedback.countDocuments();
  const pendingCount = await Feedback.countDocuments({ status: "pending" });
  const resolvedCount = await Feedback.countDocuments({ status: "resolved" });

  res.json({
    success: true,
    data: {
      summary: {
        total: totalCount,
        pending: pendingCount,
        resolved: resolvedCount,
        resolutionRate:
          totalCount > 0 ? ((resolvedCount / totalCount) * 100).toFixed(1) : 0,
      },
      analytics,
      topCategories,
    },
  });
});

module.exports = {
  submitGeneralFeedback,
  submitFeatureRequest,
  submitBugReport,
  getMyFeedback,
  voteFeedback,
  removeVote,
  getPublicFeedback,

  // Admin routes
  getAllFeedback,
  updateFeedbackStatus,
  respondToFeedback,
  getFeedbackAnalytics,
};
