import bcrypt from "bcrypt";

const SALT = Number(process.env.SALT_ROUNDS) || 12;

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error("Password hashing failed:", error);
    throw new Error("Failed to hash password");
  }
};

const verifyPassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Password verification failed:", error);
    throw new Error("Failed to verify password");
  }
};

export { hashPassword, verifyPassword };