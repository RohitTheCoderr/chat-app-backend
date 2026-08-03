import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getCurrentUser, createProfile, updateProfile, getAllExistingUsers } from "../controllers/userController.js";
import { uploadAvatar as uploadAvatarMiddleware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.post("/create-profile", protect, uploadAvatarMiddleware, createProfile);
router.put("/update-profile", protect, uploadAvatarMiddleware, updateProfile);
router.get("/existing-users", protect, getAllExistingUsers);
router.get("/search-users", protect,  )

export default router;
