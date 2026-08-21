import Sessions from "../models/sessionModel.js";

const getMySessions = async (req, res) => {
  try {
    
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null,
      });
    }

    const sessions = await Sessions.find({
      user: userId,
    }).sort({ lastActive: -1 });

    return res.status(200).json({
      success: true,
      message: "Sessions fetched successfully",
      data: sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?._id;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
        data: null,
      });
    }

    const session = await Sessions.findOne({
      sessionId,
      user: userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
        data: null,
      });
    }

    // Don't allow current session to be revoked
    if (sessionId === req.sessionId) {
      return res.status(400).json({
        success: false,
        message: "You cannot revoke your current session",
        data: null,
      });
    }

    await Sessions.deleteOne({
      sessionId,
      user: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Session revoked successfully",
      data: null,
    });
  } catch (error) {
    console.error("Revoke session error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};


export { getMySessions, revokeSession };