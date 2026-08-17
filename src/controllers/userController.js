import User from "../models/user.js";
import {
  createUser,
  findUserByEmailOrUsername,
  verifyPassword,
} from "../services/userService.js";
import generateToken from "../services/authService.js";
import { cloudinary } from "../services/cloudinaryService.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import crypto from "crypto";
import { hashPassword } from "../services/passwordService.js";

const registerUser = async (req, res) => {
  try {
    const user = await createUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!password || !identifier) {
      return res.status(400).json({
        success: false,
        message: "Email or username and password are required",
        data: null,
      });
    }

    const user = await findUserByEmailOrUsername({ identifier }, true);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        data: null,
      });
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        data: null,
      });
    }

    const token = generateToken(user._id);

    const userObject = {
      userId: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: {
        url: user.avatar?.url,
      },
      status: user.status,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { userData: userObject, token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Username or email is required",
        data: null,
      });
    }

    const user = await findUserByEmailOrUsername({ identifier }, true);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // Generate raw token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving to DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Send raw token in email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
      data: null,
    });
  } catch (error) {
    console.error("Forget Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process password reset request",
      data: null,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
        data: null,
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
        data: null,
      });
    }

    // Hash token received from URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token and expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
        data: null,
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;

    // Invalidate reset token after successful reset
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: null,
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while resetting password",
      data: null,
    });
  }
};

const getCurrentUser = async (req, res) => {
  const {
    _id,
    username,
    name,
    email,
    bio,
    phone,
    avatar,
    friends,
    blockedUsers,
    status,
    isVerified,
    isActive,
    lastSeen,
  } = req.user;

  const FriendsCount = friends ? friends.length : 0;
  const BlockedUsersCount = blockedUsers ? blockedUsers.length : 0;
  // const avatarUrl = avatar?.url || null;

  return res.status(200).json({
    success: true,
    data: {
      userId: _id,
      username,
      name,
      email,
      bio,
      phone,
      avatar,
      status,
      isVerified,
      isActive,
      FriendsCount,
      BlockedUsersCount,
      lastSeen,
    },
  });
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, phone, username } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const oldAvatarPublicId = user.avatar?.publicId;

    // Update profile fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;

    // Update username only if changed
    if (username !== undefined && username !== user.username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken",
          data: null,
        });
      }

      user.username = username;
    }

    // Update avatar
    if (req.file) {
      user.avatar = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    await user.save();

    // Delete old avatar only after DB update succeeds
    if (req.file && oldAvatarPublicId) {
      await cloudinary.uploader.destroy(oldAvatarPublicId);
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: user.name,
        username: user.username,
        bio: user.bio,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
      data: null,
    });
  }
};

const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const publicId = user.avatar?.publicId;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "No avatar to delete",
        data: null,
      });
    }

    // Delete avatar from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok") {
      return res.status(500).json({
        success: false,
        message: "Failed to delete avatar from Cloudinary",
        data: null,
      });
    }

    // Remove avatar reference from user document
    user.avatar = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Avatar deleted successfully",
      data: null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete avatar" });
  }
};

const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Username is required",
        data: null,
      });
    }

    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters",
        data: null,
      });
    }

    const user = await User.findOne({
      username: normalizedUsername,
    }).select("_id");

    const available = !user;

    return res.status(200).json({
      success: true,
      message: available
        ? "Username is available"
        : "Username is already taken",
      data: {
        available,
      },
    });
  } catch (error) {
    console.error("Check username error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check username",
      data: null,
    });
  }
};

const getAllExistingUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username name avatar.url");

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve existing users",
      data: null,
    });
  }
};

export {
  registerUser,
  loginUser,
  forgetPassword,
  resetPassword,
  getCurrentUser,
  getAllExistingUsers,
  updateProfile,
  checkUsername,
  deleteAvatar,
};
