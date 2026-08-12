import { FRIEND_REQUEST_STATUS } from "../constants/friendRequestStatus.js";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import Conversations from "../models/conversation.js";
import FriendRequest from "../models/friendRequest.js";
import User from "../models/user.js";
import { sendFriendRequestEmail } from "../services/emailService.js";
import { createNotification } from "../services/notificationService.js";

const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user._id;

    // Check if the user is trying to send a friend request to themselves
    if (senderId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a friend request to yourself",
      });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        {
          sender: senderId,
          receiver: userId,
        },
        {
          sender: userId,
          receiver: senderId,
        },
      ],
      status: FRIEND_REQUEST_STATUS.PENDING,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message:
          "This user has already sent you a friend request. Please accept or reject it.",
      });
    }

    const existingFriendship = await User.findOne({
      _id: senderId,
      friends: userId,
    });

    if (existingFriendship) {
      return res.status(400).json({
        success: false,
        message: "You are already friends with this user",
      });
    }

    const newFriendRequest = new FriendRequest({
      sender: senderId,
      receiver: userId,
    });

    const receiverUser = await User.findById({ _id: userId });

    if (!receiverUser) {
      return res
        .status(404)
        .json({ success: false, message: "Receiver user not found" });
    }

    // notification on gmail
    await sendFriendRequestEmail(
      receiverUser.email,
      receiverUser.name,
      req.user.name,
    );

    // notification in app
    await createNotification({
      recipientId: userId,
      type: NOTIFICATION_TYPES.FRIEND_REQUEST,
      message: `${req.user.name} sent you a friend request`,
      sender: req.user._id,
      referenceId: newFriendRequest._id,
    });

    await newFriendRequest.save();

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
      data: newFriendRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send friend request",
      error: error.message,
    });
  }
};

const getFriendRequests = async (req, res) => {
  try {
    const userId = req?.user?._id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const friendRequests = await FriendRequest.find({
      receiver: userId,
      status: FRIEND_REQUEST_STATUS.PENDING,
    }).populate("sender", "name username avatar.url status lastSeen");

    const formattedFriendRes = friendRequests.map((friend) => ({
      userId: friend._id,
      name: friend.name,
      username: friend.username,
      avatar: friend.avatar,
      avatar: friend.status,
      avatar: friend.lastSeen,
    }));
    res.status(200).json({ success: true, data: formattedFriendRes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get friend requests",
      error: error.message,
    });
  }
};

const getSendedFriendRequests = async (req, res) => {
  try {
    const userId = req?.user?._id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const sendFriendRequests = await FriendRequest.find({
      sender: userId,
      status: FRIEND_REQUEST_STATUS.PENDING,
    }).populate("receiver", "name username avatar.url status lastSeen");

    const formattedSendFriendRes = sendFriendRequests.map((friend) => ({
      userId: friend._id,
      name: friend.name,
      username: friend.username,
      avatar: friend.avatar,
      avatar: friend.status,
      avatar: friend.lastSeen,
    }));

    res.status(200).json({ success: true, data: formattedSendFriendRes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get friend requests",
      error: error.message,
    });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const receiverId = req.user._id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const friendRequest = await FriendRequest.findOne({
      sender: userId,
      receiver: receiverId,
      status: FRIEND_REQUEST_STATUS.PENDING,
    });

    if (!friendRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Friend request not found" });
    }

    friendRequest.status = FRIEND_REQUEST_STATUS.ACCEPTED;
    await friendRequest.save();

    // Add each other as friends
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: receiverId },
    });
    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { friends: userId },
    });

    const existingConversation = await Conversations.findOne({
      participants: { $all: [userId, receiverId] },
    });

    if (!existingConversation) {
      await Conversations.create({
        participants: [userId, receiverId],
      });
    }

    // notification in app Send notification
    await createNotification({
      recipientId: userId,
      type: NOTIFICATION_TYPES.FRIEND_REQUEST_ACCEPTED,
      message: `${req.user.name} accepted your friend request`,
      sender: req.user._id,
      referenceId: friendRequest._id,
    });

    res
      .status(200)
      .json({ success: true, message: "Friend request accepted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to accept friend request",
      error: error.message,
    });
  }
};

const declineFriendRequest = async (req, res) => {
  try {
    const { userId } = req?.params;
    const receiverId = req?.user?._id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const friendRequest = await FriendRequest.findOne({
      sender: userId,
      receiver: receiverId,
      status: FRIEND_REQUEST_STATUS.PENDING,
    });

    if (!friendRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Friend request not found" });
    }

    friendRequest.status = FRIEND_REQUEST_STATUS.DECLINED;
    await friendRequest.save();

    // notification in app
    await createNotification({
      recipientId: userId,
      type: NOTIFICATION_TYPES.FRIEND_REQUEST_DECLINED,
      message: `${req.user.name} declined your friend request`,
      sender: req.user._id,
      referenceId: friendRequest._id,
    });

    res
      .status(200)
      .json({ success: true, message: "Friend request declined successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to decline friend request",
      error: error.message,
    });
  }
};

const cancelFriendRequest = async (req, res) => {
  try {
    const { userId } = req?.params;
    const senderId = req?.user?._id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const friendRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: userId,
      status: FRIEND_REQUEST_STATUS.PENDING,
    });

    if (!friendRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Friend request not found" });
    }

    await FriendRequest.findByIdAndDelete(friendRequest._id);

    // notification in app
    await createNotification({
      recipientId: userId,
      type: NOTIFICATION_TYPES.FRIEND_REQUEST_DELETED,
      message: `${req.user.name} cancelled their friend request`,
      sender: req.user._id,
      referenceId: friendRequest._id,
    });

    res.status(200).json({
      success: true,
      message: "Friend request cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel friend request",
      error: error.message,
    });
  }
};

const getNonFriendList = async (req, res) => {
  try {
    const userId = req.user._id;
    const friendIds = req.user.friends || [];

    console.log("friends", friendIds);

    const users = await User.find(
      {
        _id: {
          $nin: [userId, ...friendIds],
        },
      },
      "username name avatar.url status lastSeen",
    );

    const formattedUsers = users.map((user) => ({
      userId: user._id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      status: user.status,
      lastSeen: user.lastSeen,
    }));

    return res.status(200).json({
      success: true,
      data: formattedUsers,
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve existing users",
      data: null,
    });
  }
};

const getFriendList = async (req, res) => {
  try {
    const userId = req.user._id;
    const friendIds = req.user.friends || [];

    const users = await User.find(
      {
        _id: {
          $in: friendIds,
        },
      },
      "username name avatar.url status lastSeen",
    );

    const formattedUsers = users.map((user) => ({
      userId: user._id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      status: user.status,
      lastSeen: user.lastSeen,
    }));

    return res.status(200).json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve existing users",
      data: null,
    });
  }
};

export {
  sendFriendRequest,
  getFriendRequests,
  getSendedFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  getNonFriendList,
  getFriendList,
};
