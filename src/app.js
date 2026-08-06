import express from "express";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

const app = express();

// =========================

// GLOBAL MIDDLEWARE
// =========================

app.use(express.json());

// =========================
// ROUTES
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);

// app.use(
//   "/api/admin-requests",
//   adminRequestRoutes
// );

// app.use(
//   "/api/conversations",
//   conversationRoutes
// );

// app.use(
//   "/api",
//   messageRoutes
// );

export default app;
