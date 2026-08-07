import Message from "../models/message.js";

export const formatConversation = async (conversation, userId) => {
  const friend = conversation.participants.find(
    (participant) => participant._id.toString() !== userId.toString(),
  );

  const unreadCount = await Message.countDocuments({
    conversation: conversation._id,
    sender: {
      $ne: userId,
    },
    readBy: {
      $ne: userId,
    },
  });

  return {
    conversationId: conversation._id,
    friend,
    lastMessage: conversation.lastMessage,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount,
    updatedAt: conversation.updatedAt,
  };
};
