import app from "./src/app.js";
import http from "http";
import connectDB from "./src/config/db.js";
import { Server } from "socket.io";
import { initSocket } from "./src/sockets/socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        credentials: true,
      },
    });

    // Initialize socket events
    initSocket(io);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
