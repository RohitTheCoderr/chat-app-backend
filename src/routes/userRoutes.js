import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getCurrentUser,
  createProfile,
  updateProfile,
  getAllExistingUsers,
  deleteAvatar,
  getNonFriendUsers,
} from "../controllers/userController.js";
import { uploadAvatar as uploadAvatarMiddleware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.post("/create-profile", protect, uploadAvatarMiddleware, createProfile);
router.put("/update-profile", protect, uploadAvatarMiddleware, updateProfile);
router.delete("/delete-avatar", protect, deleteAvatar);
router.get("/existing-users", protect, getAllExistingUsers);
router.get("/non-friend-users", protect, getNonFriendUsers);
router.get("/search-users", protect);

export default router;
