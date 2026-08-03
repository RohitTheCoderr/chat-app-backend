import express from "express";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

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


// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chat App API is running",
  });
});


// =========================
// EXPORT APP
// =========================

export default app;