import express from "express";
import {
  registerUser,
  loginUser,
  checkUsername,
  resetPassword,
  forgetPassword,
} from "../controllers/userController.js";

const router = express.Router();

// Check username availability
router.get("/check-username", checkUsername);

// Register new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// forget password
router.post("/forget-password", forgetPassword);

// reset password
router.post("/reset-password/:token", resetPassword);

export default router;
