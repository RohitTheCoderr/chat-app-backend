import Conversations from "../models/conversation.js";
import Message from "../models/message.js";

const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId, text } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation Id is required",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    // Check conversation and user's access
    const conversation = await Conversations.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      text: text.trim(),
      messageType: "TEXT",
      readBy: [userId],
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;

    await conversation.save();

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.size) || 1, 1);
    const skip = (page - 1) * limit;

    const conversationId = req.params.conversationId;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation Id is required",
      });
    }

    // Check conversation and user's access
    const conversation = await Conversations.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "name username avatar.url status lastSeen")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.conversationId;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation Id is required",
      });
    }

    // Check user belongs to conversation
    const conversation = await Conversations.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Update unread messages
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: {
          $ne: userId,
        },
        readBy: {
          $ne: userId,
        },
      },
      {
        $addToSet: {
          readBy: userId,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversationIds = await Conversations.distinct("_id", {
      participants: userId,
    });

    const unreadCount = await Message.countDocuments({
      conversation: {
        $in: conversationIds,
      },
      sender: {
        $ne: userId,
      },
      readBy: {
        $ne: userId,
      },
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export { sendMessage, getMessages, markMessagesAsRead, getUnreadMessageCount };
