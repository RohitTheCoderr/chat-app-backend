import Conversations from "../models/conversation.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import { socketAuth } from "./socketAuth.js";

const onlineUsers = new Map();

export const initSocket = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    onlineUsers.set(socket.userId, socket.id);

    // ONLINE STATUS
    User.findByIdAndUpdate(socket.userId, {
      status: "online",
    }).catch((error) => {
      console.error("Online status error:", error);
    });

    socket.on("test_event", (data) => {
      console.log("🔥 TEST EVENT:", data);
    });

    //   // JOIN CONVERSATION ROOM
    socket.on("join_conversation", async (conversationId) => {
      console.log("🔥 JOIN EVENT RECEIVED:", conversationId);

      try {
        const conversation = await Conversations.findById(conversationId);

        console.log("🔥 CONVERSATION:", conversation);

        if (!conversation) {
          console.log("❌ Conversation not found");

          return socket.emit("error", "Conversation not found");
        }

        const isMember = conversation.participants.some(
          (userId) => userId.toString() === socket.userId.toString(),
        );

        console.log("🔥 SOCKET USER:", socket.userId);
        console.log("🔥 PARTICIPANTS:", conversation.participants);
        console.log("🔥 IS MEMBER:", isMember);

        if (!isMember) {
          console.log("❌ User is not part of conversation");

          return socket.emit("error", "You are not part of this conversation");
        }

        const roomId = `conversation_${conversationId}`;

        await socket.join(roomId);

        console.log("✅ JOINED ROOM:", roomId);

        socket.emit("conversation_joined", {
          conversationId,
          roomId,
        });
      } catch (error) {
        console.error("❌ JOIN CONVERSATION ERROR:", error);
      }
    });

    //   // SEND MESSAGE EVENT

    socket.on("send_message", async (data) => {
      try {
        const { conversationId, text } = data;

        const conversation = await Conversations.findOne({
          _id: conversationId,
          participants: socket.userId,
        });

        if (!conversation) {
          return socket.emit("error", "Conversation not found");
        }

        // 1. Save message in MongoDB

        const message = await Message.create({
          conversation: conversationId,

          sender: socket.userId,

          text: text,
        });

        const populatedMessage = await Message.findById(message._id).populate(
          "sender",
          "name username avatar.url status lastSeen",
        );

        const roomId = `conversation_${conversationId}`;

        const room = io.sockets.adapter.rooms.get(roomId);

        console.log("🔥 SEND MESSAGE");
        console.log("🔥 ROOM:", roomId);
        console.log("🔥 ROOM SIZE:", room?.size);
        console.log("🔥 ROOM SOCKETS:", room ? [...room] : []);

        io.to(roomId).emit("receive_message", populatedMessage);

        // io.to(`conversation_${conversationId}`).emit(
        //   "receive_message",
        //   populatedMessage,
        // );
      } catch (error) {
        console.log("Message error:", error);
      }
    });

    //   // MARK AS READ MESSAGE

    socket.on("mark_as_read", async (conversationId) => {
      try {
        console.log("🔥 MARK AS READ EVENT");
        console.log("conversationId:", conversationId);
        console.log("socket.userId:", socket.userId);
        const conversation = await Conversations.findOne({
          _id: conversationId,
          participants: socket.userId,
        });

        console.log("🔥 CONVERSATION:", conversation);

        if (!conversation) {
          return socket.emit("error", "Conversation not found");
        }

        const messages = await Message.find({
          conversation: conversationId,
          sender: { $ne: socket.userId },
          readBy: { $ne: socket.userId },
        });

        console.log("🔥 UNREAD MESSAGES:", messages);

        const result = await Message.updateMany(
          {
            conversation: conversationId,
            sender: {
              $ne: socket.userId,
            },
            readBy: {
              $ne: socket.userId,
            },
          },
          {
            $addToSet: {
              readBy: socket.userId,
            },
          },
        );

        console.log("🔥 UPDATE RESULT:", result);

        io.to(`conversation_${conversationId}`).emit("messages_read", {
          conversationId,
          userId: socket.userId,
        });
      } catch (error) {
        console.log("Mark as read error:", error);
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      onlineUsers.delete(socket.userId);

      await User.findByIdAndUpdate(socket.userId, {
        status: "offline",
        lastSeen: new Date(),
      });

      console.log("User offline:", socket.userId);
    });
  });
};
