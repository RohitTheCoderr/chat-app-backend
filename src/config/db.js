import mongoose from "mongoose";

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn("MongoDB URI not found. Set MONGO_URI in your .env file.");
    return;
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

      console.log(`MongoDB connected: ${mongoose.connection.host}`);
    console.log(`Database name: ${mongoose.connection.name}`);

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
  connectDB();
});

export default connectDB;
