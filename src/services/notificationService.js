import Notification from "../models/notification.js";

export const createNotification = async ({
  recipientId,
  type,
  message,
  sender,
  referenceId,
}) => {
  if (!recipientId || !type || !message || !sender) {
    console.log(
      recipientId,
      type,
      message,
      sender,
      "Missing required fields for creating notification",
    );
    throw new Error("Missing required fields for creating notification");
  }

  return await Notification.create({
    recipient: recipientId,
    type,
    message,
    sender,
    referenceId,
    isRead: false,
  });
};
