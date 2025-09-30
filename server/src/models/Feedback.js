const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    // Basic feedback info
    type: {
      type: String,
      enum: ["general", "feature", "bug"],
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // User info
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null if anonymous
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    anonymous: {
      type: Boolean,
      default: false,
    },

    // General feedback specific
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    category: {
      type: String,
      enum: [
        "ui_ux",
        "performance",
        "booking",
        "payment",
        "search",
        "communication",
        "mobile",
        "other",
        "integration",
      ],
    },

    // Feature request specific
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    useCase: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    // Bug report specific
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    stepsToReproduce: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    expectedBehavior: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    actualBehavior: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    environment: {
      browser: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      device: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      userAgent: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },
    screenshot: {
      url: String,
      publicId: String,
      filename: String,
    },

    // Admin management
    status: {
      type: String,
      enum: ["pending", "in_review", "in_progress", "resolved", "rejected"],
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],

    // Response tracking
    response: {
      message: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      respondedAt: Date,
    },

    // Metadata
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ["web", "mobile", "api"],
      default: "web",
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: Date,
    votes: {
      upvotes: {
        type: Number,
        default: 0,
      },
      downvotes: {
        type: Number,
        default: 0,
      },
      voters: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          vote: {
            type: String,
            enum: ["up", "down"],
          },
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ category: 1, type: 1 });
feedbackSchema.index({ priority: 1, type: 1 });
feedbackSchema.index({ severity: 1, type: 1 });
feedbackSchema.index({ assignedTo: 1, status: 1 });

// Virtual for getting vote score
feedbackSchema.virtual("voteScore").get(function () {
  return this.votes.upvotes - this.votes.downvotes;
});

// Virtual for checking if feedback is from registered user
feedbackSchema.virtual("isFromRegisteredUser").get(function () {
  return !!this.user && !this.anonymous;
});

// Virtual for getting formatted category name
feedbackSchema.virtual("formattedCategory").get(function () {
  if (!this.category) return null;

  const categoryMap = {
    ui_ux: "UI/UX",
    performance: "Performance",
    booking: "Booking",
    payment: "Payment",
    search: "Search",
    communication: "Communication",
    mobile: "Mobile",
    integration: "Integration",
    other: "Other",
  };

  return categoryMap[this.category] || this.category;
});

// Pre-save middleware
feedbackSchema.pre("save", function (next) {
  // Auto-set resolved flag and timestamp when status changes to resolved
  if (
    this.isModified("status") &&
    this.status === "resolved" &&
    !this.resolved
  ) {
    this.resolved = true;
    this.resolvedAt = new Date();
  }

  // Clear resolved flag if status changes from resolved
  if (
    this.isModified("status") &&
    this.status !== "resolved" &&
    this.resolved
  ) {
    this.resolved = false;
    this.resolvedAt = null;
  }

  next();
});

// Static methods for analytics
feedbackSchema.statics.getAnalytics = function (startDate, endDate) {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          type: "$type",
          status: "$status",
        },
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
    {
      $group: {
        _id: "$_id.type",
        statusBreakdown: {
          $push: {
            status: "$_id.status",
            count: "$count",
          },
        },
        totalCount: { $sum: "$count" },
        avgRating: { $first: "$avgRating" },
      },
    },
  ]);
};

feedbackSchema.statics.getTopCategories = function (type, limit = 10) {
  const match = { category: { $exists: true, $ne: null } };
  if (type) match.type = type;

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
};

// Instance methods
feedbackSchema.methods.addVote = function (userId, voteType) {
  // Remove existing vote from this user
  this.votes.voters = this.votes.voters.filter(
    (voter) => !voter.user.equals(userId)
  );

  // Add new vote
  this.votes.voters.push({
    user: userId,
    vote: voteType,
  });

  // Recalculate vote counts
  const upvotes = this.votes.voters.filter((v) => v.vote === "up").length;
  const downvotes = this.votes.voters.filter((v) => v.vote === "down").length;

  this.votes.upvotes = upvotes;
  this.votes.downvotes = downvotes;

  return this.save();
};

feedbackSchema.methods.removeVote = function (userId) {
  this.votes.voters = this.votes.voters.filter(
    (voter) => !voter.user.equals(userId)
  );

  // Recalculate vote counts
  const upvotes = this.votes.voters.filter((v) => v.vote === "up").length;
  const downvotes = this.votes.voters.filter((v) => v.vote === "down").length;

  this.votes.upvotes = upvotes;
  this.votes.downvotes = downvotes;

  return this.save();
};

module.exports = mongoose.model("Feedback", feedbackSchema);
