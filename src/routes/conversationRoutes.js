import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  deleteConversation,
  getAllConversationsForUser,
  getSingleConversation,
} from "../controllers/conversationController.js";
const router = express.Router();

// get all conversations for the authenticated user
router.get("/", protect, getAllConversationsForUser);

// get a specific conversation by ID
router.get("/:conversationId", protect, getSingleConversation);

// update a specific conversation by ID
router.put("/:conversationId", protect, (req, res) => {
  res.send(`Update conversation with ID: ${req.params.conversationId}`);
});

// delete a specific conversation by ID
router.delete("/:conversationId", protect, deleteConversation);

export default router;
