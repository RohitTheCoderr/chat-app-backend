import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getCurrentUser,
  updateProfile,
  getAllExistingUsers,
  deleteAvatar,
  getFriendProfileById,
} from "../controllers/userController.js";
import { uploadAvatar as uploadAvatarMiddleware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.post("/update-profile", protect, uploadAvatarMiddleware, updateProfile);
router.delete("/delete-avatar", protect, deleteAvatar);
router.get("/existing-users", protect, getAllExistingUsers);
router.get("/friend/:userId", protect, getFriendProfileById);

export default router;
