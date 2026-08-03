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
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!password || (!email && !username)) {
      return res.status(400).json({
        success: false,
        message: "Email or username and password are required",
      });
    }

    const user = await findUserByEmailOrUsername(
      { email, username },
      true
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await verifyPassword(
      password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);
    const userObject = user.toObject();
    delete userObject.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userObject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { username, email } = req.body;

    if(!username && !email) {
      return res.status(400).json({
        success: false,
        message: "Username or email is required",
      });
    }

    const user =await findUserByEmailOrUsername({ username, email }, true);

    if(!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

     // Generate raw token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Hash token before saving to DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

      // Send raw token in email
    await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });

  } catch (error) {
    console.error("Forget Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message ||"Failed to process password reset request",
    });
    
  }}

 const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // Hash token received from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

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
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(
      newPassword
    );

    user.password = hashedPassword;

    // Invalidate reset token after successful reset
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Something went wrong while resetting password",
    });
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

const createProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      phone,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update profile information
    if (name) {
      user.name = name;
    }

    if (bio) {
      user.bio = bio;
    }

    if (phone) {
      user.phone = phone;
    }

    // Update avatar if uploaded
    if (req.file) {

      // Delete old avatar from Cloudinary
      if (user.avatar?.publicId) {
         await cloudinary.uploader.destroy(
          user.avatar.publicId
        );
      }

      // Save new avatar details
      user.avatar = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    await user.save();

    const userObject = user.toObject();
    delete userObject.password;

    return res.status(200).json({
      success: true,
      message: "Profile created successfully",
      data: userObject,
    });
  } catch (error) {
    console.error("Create Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Store old avatar publicId before updating
    const oldAvatarPublicId = user.avatar?.publicId;

    // Update only allowed fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;

    // Update avatar if uploaded
    if (req.file) {
      user.avatar = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    await user.save();

    // Delete old avatar after successful DB update
    if (req.file && oldAvatarPublicId) {
      const result = await cloudinary.uploader.destroy(
        oldAvatarPublicId
      );

      console.log("Old avatar delete result:", result);
    }

    const userObject = user.toObject();
    delete userObject.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userObject,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();

    const user = await User.findOne({
      username: normalizedUsername,
    });

    return res.status(200).json({
      success: true,
      available: !user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check username",
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
    });
  }
}


export {
  registerUser,
  loginUser,
  forgetPassword,
  resetPassword,
  getCurrentUser,
  getAllExistingUsers,
  createProfile,
  updateProfile,
  checkUsername,
};
