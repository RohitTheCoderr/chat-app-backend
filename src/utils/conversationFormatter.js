export const formatConversation = (conversation, userId) => {
  const friend = conversation.participants.find(
    (participant) => participant._id.toString() !== userId.toString(),
  );

  return {
    conversationId: conversation._id,
    friend,
    lastMessage: conversation.lastMessage,
    lastMessageAt: conversation.lastMessageAt,
    updatedAt: conversation.updatedAt,
  };
};
