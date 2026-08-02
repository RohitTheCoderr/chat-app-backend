import {createUser} from "../services/userService.js"

const registerUser = async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, message:"User register successfully", data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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

    const normalizedUsername =
      username.trim().toLowerCase();

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



export {
  registerUser,
  checkUsername,
};
