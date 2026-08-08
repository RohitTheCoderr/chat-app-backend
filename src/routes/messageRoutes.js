import express from "express";
import {
  getUnreadMessageCount,
  markMessagesAsRead,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
// router.get("/conversation/:conversationId/messages", protect, receiveMessages);
router.get("/:conversationId", protect, getMessages);
router.patch("/:conversationId/read", protect, markMessagesAsRead);
router.get("/unread-count", protect, getUnreadMessageCount);

export default router;
