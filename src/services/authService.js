import jwt from "jsonwebtoken";

const generateToken = (userId, sessionId) => {
  return jwt.sign(
    {
      userId: userId,
      sessionId
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    },
  );
};

export default generateToken;
