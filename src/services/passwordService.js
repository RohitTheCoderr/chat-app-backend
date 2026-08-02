import bcrypt from "bcrypt";

const SALT = Number(process.env.SALT_ROUNDS)

 const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    return hashedPassword;
  } catch (error) {
    console.error("Password hashing failed:", error);

    throw new Error("Failed to hash password");
  }
};

 const comparePassword = async (
  password,
  hashedPassword
) => {
  return await bcrypt.compare(
    password,
    hashedPassword
  );
};

export {hashPassword, comparePassword}