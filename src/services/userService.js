import bcrypt from "bcrypt";
import User from "../models/user.js";
import {hashPassword} from "../services/passwordService.js"


const createUser = async (userData) => {
  const {
    name,
    username,
    email,
    password,
  } = userData;

  const normalizedUsername = username
    .trim()
    .toLowerCase();

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const existingUser = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { username: normalizedUsername },
    ],
  });

  if (existingUser) {
    throw new Error(
      "User with this email or username already exists"
    );
  }

  const hashedPassword =
    await hashPassword(password);

  const user = await User.create({
    name,
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    role: "USER",
  });

  const userObject = user.toObject();

  delete userObject.password;

  return userObject;
};


export {
  createUser,
};