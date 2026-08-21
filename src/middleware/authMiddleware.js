import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Sessions from "../models/sessionModel.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

      // Check session
    const session = await Sessions.findOne({
      sessionId: decoded.sessionId,
      user: decoded.userId,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired or revoked",
      });
    }

    // Update last active
    session.lastActive = new Date();
    await session.save();

    req.user = user;

    // Current session id
    req.sessionId = decoded.sessionId;

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default protect;
