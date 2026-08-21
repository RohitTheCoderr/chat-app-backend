import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    device: {
      type: String,
      required: true,
    },

    browser: {
      type: String,
      required: true,
    },

    os: {
      type: String,
      required: true,
    },

    ipAddress: {
      type: String,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


const Sessions = mongoose.model("Session", sessionSchema);

export default Sessions;