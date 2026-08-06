import Notification from "../models/notification.js";

const getUnreadNotificationCountByType = async (req, res) => {
  try {
    const userId = req.user._id;
    const Type = req.params.type; // Get the type from the request parameters like "FRIEND_REQUEST| MESSAGE| MENTION "

    const count = await Notification.countDocuments({
      recipient: userId,
      type: Type,
      isRead: false,
    });

    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUnreadNotificationsByType = async (req, res) => {
  try {
    const userId = req.user._id;
    const Type = req.params.type; // Get the type from the request parameters like "FRIEND_REQUEST| MESSAGE| MENTION "

    const notifications = await Notification.find({
      recipient: userId,
      type: Type,
      isRead: false,
    });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const markedReadNotificationsById = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.notificationId;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const markedAllReadNotificationsByType = async (req, res) => {
  try {
    const userId = req.user._id;
    const Type = req.params.type; // Get the type from the request parameters like "FRIEND_REQUEST| MESSAGE| MENTION "

    const result = await Notification.findByIdAndUpdate(
      {
        recipient: userId,
        type: Type,
        isRead: false,
      },
      { isRead: true },
      { new: true },
    );
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "No unread notifications found" });
    }

    res
      .status(200)
      .json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteNotificationById = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.notificationId;

    if (!notificationId) {
      return res
        .status(400)
        .json({ success: false, message: "Notification ID is required" });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export {
  getUnreadNotificationsByType,
  getUnreadNotificationCountByType,
  markedReadNotificationsById,
  markedAllReadNotificationsByType,
  deleteNotificationById,
};
