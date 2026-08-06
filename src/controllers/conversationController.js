import Conversations from "../models/conversation.js";
import { formatConversation } from "../utils/conversationFormatter.js";

const getAllConversationsForUser = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const size = Math.max(Number(req.query.size) || 1, 1);
    const skip = (page - 1) * size;
    const userId = req?.user?._id;

    const [conversations, total] = await Promise.all([
      Conversations.find({ participants: userId })
        .populate("participants", "name username avatar.url status")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(size),

      Conversations.countDocuments({ participants: userId }),
    ]);

    const formattedConversations = conversations.map((conversation) =>
      formatConversation(conversation, userId),
    );

    res.status(200).json({
      success: true,
      message: "Conversations fetched successfully based on your filter",
      data: formattedConversations,
      pagination: {
        page,
        size,
        totalItems: total,
        totalPages: Math.ceil(total / size),
        hasNextPage: page * size < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

const getSingleConversation = async (req, res) => {
  try {
    const userId = req?.user?._id;
    const conversationId = req?.params?.conversationId;

    if (!conversationId) {
      return res
        .status(400)
        .json({ success: false, message: "conversation Id is required" });
    }

    const conversation = await Conversations.findOne({
      participants: userId,
      _id: conversationId,
    }).populate("participants", "name username avatar.url status");

    const formattedConversation = formatConversation(conversation, userId);

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }
    res.status(200).json({
      success: true,
      message: "Conversation fetched successfully ",
      data: formattedConversation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

// for future use
const deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.conversationId;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation id",
      });
    }

    const result = await Conversations.findOneAndDelete({
      _id: conversationId,
      participants: userId,
    });

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "conversation is deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

export {
  getAllConversationsForUser,
  getSingleConversation,
  deleteConversation,
};
