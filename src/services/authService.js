import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId: userId,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
};

export default generateToken;