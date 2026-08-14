import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "FRIEND_REQUEST",
        "FRIEND_REQUEST_ACCEPTED",
        "FRIEND_REQUEST_DELETED",
        "FRIEND_REQUEST_DECLINED",
        "NEW_MESSAGE",
        "MESSAGE_REACTION",
        "MENTION",
      ],
      required: true,
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
