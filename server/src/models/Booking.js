const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      sparse: true, // Allow null during creation
    },
    orderId: {
      type: String,
      unique: true,
      sparse: true, // Allow null during creation
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client is required"],
    },
    studio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studio",
      required: [true, "Studio is required"],
    },
    service: {
      name: {
        type: String,
        required: [true, "Service name is required"],
      },
      price: {
        type: Number,
        required: [true, "Service price is required"],
        min: 0,
      },
      durationMins: {
        type: Number,
        required: [true, "Service duration is required"],
        min: 30,
      },
      description: String,
    },
    // PRD: Multiple services support
    services: [
      {
        name: String,
        price: Number,
        description: String,
        category: String,
      },
    ],
    // PRD: Equipment rental support
    equipment: [
      {
        equipmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Equipment",
        },
        name: String,
        rentalPrice: Number,
        rentalDuration: String, // 'session', 'day', 'week', 'month'
        status: {
          type: String,
          enum: ["Reserved", "In-Use", "Returned"],
          default: "Reserved",
        },
      },
    ],
    start: {
      type: Date,
      required: [true, "Start time is required"],
    },
    end: {
      type: Date,
      required: [true, "End time is required"],
    },
    status: {
      type: String,
      enum: [
        "reservation_pending", // New: temporary reservation before payment
        "pending",
        "payment_pending",
        "confirmed",
        "cancel_pending", // PRD: For disputed cancellations (hidden from clients)
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "reservation_pending",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    currency: {
      type: String,
      default: "LKR", // Sri Lankan Rupee for PayHere
    },
    // PayHere payment fields
    payhereOrderId: String,
    payherePaymentId: String,
    paymentMethod: String, // card, bank, etc.
    paymentCardType: String, // visa, mastercard, etc.
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    clientNotes: {
      type: String,
      maxlength: [1000, "Client notes cannot exceed 1000 characters"],
    },
    providerNotes: {
      type: String,
      maxlength: [1000, "Provider notes cannot exceed 1000 characters"],
    },
    cancellationReason: String,
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundedAt: Date,
    completedAt: Date,
    meetingLink: String,
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ bookingId: 1 }, { unique: true, sparse: true });
bookingSchema.index({ orderId: 1 }, { unique: true, sparse: true });
bookingSchema.index({ client: 1 });
bookingSchema.index({ studio: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ start: 1, end: 1 });
bookingSchema.index({ createdAt: -1 });

// Compound indexes for conflict checking
bookingSchema.index({ studio: 1, start: 1, end: 1, status: 1 });

// Auto-generate booking ID and order ID before saving
bookingSchema.pre("save", async function (next) {
  if (!this.bookingId || !this.orderId) {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const datePrefix = `${year}${month}${day}`;

      // Generate booking ID if not exists
      if (!this.bookingId) {
        // Find the last booking ID for today
        const lastBooking = await mongoose
          .model("Booking")
          .findOne({
            bookingId: new RegExp(`^BK-${datePrefix}-`),
          })
          .sort({ bookingId: -1 })
          .select("bookingId");

        let bookingSequence = 1;
        if (lastBooking && lastBooking.bookingId) {
          // Extract the sequence number from the last booking ID
          const lastSequence = parseInt(lastBooking.bookingId.split("-")[2]);
          bookingSequence = lastSequence + 1;
        }

        // Generate new booking ID: BK-YYYYMMDD-XXXX
        this.bookingId = `BK-${datePrefix}-${String(bookingSequence).padStart(4, "0")}`;
      }

      // Generate order ID if not exists
      if (!this.orderId) {
        // Find the last order ID for today
        const lastOrder = await mongoose
          .model("Booking")
          .findOne({
            orderId: new RegExp(`^ORD-${datePrefix}-`),
          })
          .sort({ orderId: -1 })
          .select("orderId");

        let orderSequence = 1;
        if (lastOrder && lastOrder.orderId) {
          // Extract the sequence number from the last order ID
          const lastSequence = parseInt(lastOrder.orderId.split("-")[2]);
          orderSequence = lastSequence + 1;
        }

        // Generate new order ID: ORD-YYYYMMDD-XXXX
        this.orderId = `ORD-${datePrefix}-${String(orderSequence).padStart(4, "0")}`;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Validation: end time must be after start time
bookingSchema.pre("validate", function (next) {
  if (this.end <= this.start) {
    next(new Error("End time must be after start time"));
  }
  next();
});

// Validation: must have studio
bookingSchema.pre("validate", function (next) {
  if (!this.studio) {
    next(new Error("Booking must have a studio"));
  }
  next();
});

// Virtual for duration in minutes
bookingSchema.virtual("durationMins").get(function () {
  return Math.round((this.end - this.start) / (1000 * 60));
});

// Virtual for provider (studio)
bookingSchema.virtual("provider").get(function () {
  return this.studio;
});

// Virtual for provider type
bookingSchema.virtual("providerType").get(function () {
  return "studio";
});

// Check if booking can be cancelled
bookingSchema.methods.canCancel = function (userRole = 'client') {
  // For testing purposes, allow cancellation anytime before the booking is completed/cancelled
  // In production, you might want stricter time-based rules
  return !["completed", "cancelled", "refunded"].includes(this.status);
  
  // Original stricter logic (commented out for testing):
  /*
  // Admin and studio users can cancel anytime (for emergency situations)
  if (userRole === 'admin' || userRole === 'studio') {
    return !["completed", "cancelled", "refunded"].includes(this.status);
  }

  // Clients have a 2-hour cancellation policy
  const now = new Date();
  const hoursUntilStart = (this.start - now) / (1000 * 60 * 60);

  // Can cancel if more than 2 hours before start time and not completed
  return (
    hoursUntilStart > 2 &&
    !["completed", "cancelled", "refunded"].includes(this.status)
  );
  */
};

// Check if booking can be completed
bookingSchema.methods.canComplete = function () {
  const now = new Date();

  // Allow completion if booking is confirmed
  // For better UX, allow studios to mark sessions as completed even if they haven't started yet
  // This is useful for walk-ins or early completions
  return this.status === "confirmed";

  // Original strict logic (uncomment if you want time-based restrictions):
  // return this.status === "confirmed" && now >= this.start;
};

// Get refund amount based on cancellation time
bookingSchema.methods.getRefundAmount = function () {
  const now = new Date();
  const hoursUntilStart = (this.start - now) / (1000 * 60 * 60);

  if (hoursUntilStart > 168) {
    // More than 7 days
    return this.price; // Full refund
  } else if (hoursUntilStart > 24) {
    // More than 24 hours
    return this.price * 0.5; // 50% refund
  } else {
    return 0; // No refund
  }
};

module.exports = mongoose.model("Booking", bookingSchema);
