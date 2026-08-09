import User from "../models/user.js";
import { hashPassword, verifyPassword } from "./passwordService.js";

const createUser = async (userData) => {
  const { name, username, email, password } = userData;

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (existingUser) {
    throw new Error("User with this email or username already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    role: "USER",
  });

  // const userObject = user.toObject();
  const userObject = {
    userId: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
  };
  // delete userObject.password;

  return userObject;
};

const findUserByEmailOrUsername = async (
  { email, username },
  includePassword = false,
) => {
  const normalizedEmail = email?.trim().toLowerCase() || "";
  const normalizedUsername = username?.trim().toLowerCase() || "";

  const query = User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (includePassword) {
    query.select("+password");
  }

  return query;
};

export { createUser, findUserByEmailOrUsername, verifyPassword };
