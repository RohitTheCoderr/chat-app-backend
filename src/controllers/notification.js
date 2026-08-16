import { NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import FriendRequest from "../models/friendRequest.js";
import Notification from "../models/notification.js";

const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      recipient: userId,
    })
      .populate("sender", "username name avatar.url status")
      .sort({ createdAt: -1 });

    // const formattedNotifications = notifications.map((noti) => ({
    //   sender: {
    //     name: noti.sender?.name,
    //     username: noti.sender?.username,
    //     avatar: noti.sender?.avatar,
    //     status: noti.sender?.status,
    //   },
    //   notificationId: noti._id,
    //   receivingDate: noti.createdAt,
    //   message: noti.message,
    //   isRead: noti.isRead,
    //   referenceId: noti.referenceId,
    //   senderId: noti.sender?._id,
    //   messageType: noti.type,
    // }));

    const formattedNotifications = await Promise.all(
      notifications.map(async (noti) => {
        let friendRequestStatus = null;

        if (
          noti.type === NOTIFICATION_TYPES.FRIEND_REQUEST &&
          noti.referenceId
        ) {
          const friendRequest = await FriendRequest.findById(
            noti.referenceId,
          ).select("status");

          friendRequestStatus = friendRequest?.status ?? "NOT_FOUND";
        }

        return {
          sender: {
            name: noti.sender?.name,
            username: noti.sender?.username,
            avatar: noti.sender?.avatar,
            status: noti.sender?.status,
          },

          notificationId: noti._id,
          receivingDate: noti.createdAt,
          message: noti.message,
          isRead: noti.isRead,
          referenceId: noti.referenceId,
          senderId: noti.sender?._id,
          messageType: noti.type,

          friendRequestStatus,
        };
      }),
    );
    return res.status(200).json({
      success: true,
      data: formattedNotifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const getUnreadNotificationCountByType = async (req, res) => {
  try {
    const userId = req.user._id;
    // const Type = req.params.type; // Get the type from the request parameters like "FRIEND_REQUEST| MESSAGE| MENTION "

    const count = await Notification.countDocuments({
      recipient: userId,
      // type: Type,
      isRead: false,
    });

    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
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
    }).populate("sender", "username name avatar.url status lastSeen");

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
      return res.status(404).json({
        success: false,
        message: "Notification not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
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
  getAllNotifications,
  getUnreadNotificationsByType,
  getUnreadNotificationCountByType,
  markedReadNotificationsById,
  markedAllReadNotificationsByType,
  deleteNotificationById,
};
