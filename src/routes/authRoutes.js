import express from "express";

import 
 { registerUser, checkUsername}
 from "../controllers/userController.js";


const router = express.Router();

// Check username availability
router.get(
  "/check-username",
  checkUsername
);

// Register new user
router.post("/register", registerUser);

// // Login user
// router.post("/login", login);

// // Logout user
// router.post("/logout", authMiddleware, logout);

// // Get current logged-in user
// router.get("/me", authMiddleware, getMe);

export default router;