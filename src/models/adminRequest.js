const mongoose = require("mongoose");

const adminRequestSchema = new mongoose.Schema(
  {
    // User who requested to become an Admin
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Current status of the request
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    // Reason for requesting Admin access
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Super Admin who approved/rejected the request
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // When request was approved/rejected
    reviewedAt: {
      type: Date,
      default: null,
    },

    // Reason if request was rejected
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AdminRequest", adminRequestSchema);
