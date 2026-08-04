import express from "express";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";

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

// app.use(
//   "/api/notifications",
//   notificationRoutes
// );

export default app;