import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import mongoose from "mongoose";
import { Server } from "http";

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

let server: Server;

const connectDB = async () => {
  if (!MONGODB_URI) {
    console.warn("⚠️  MONGODB_URI is not defined in environment variables. Starting server without MongoDB.");
    return;
  }

  try {
    const connectionInstance = await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB connected! Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
};

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  });
};

// Graceful shutdown
const shutdown = async () => {
  console.log("\n⏳ Gracefully shutting down...");
  if (server) {
    server.close(() => {
      console.log("🔒 HTTP server closed.");
    });
  }
  await mongoose.connection.close(false);
  console.log("🔒 MongoDB connection closed.");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();
