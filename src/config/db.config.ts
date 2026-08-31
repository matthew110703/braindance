import mongoose from "mongoose";
import dns from "node:dns";
import { env } from "./env.config.js";
import { logger } from "./logger.config.js";

// Ensure Node.js resolves SRV records properly for MongoDB Atlas
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if not permitted
}

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(env.DATABASE_URL);
    logger.info(
      {
        host: conn.connection.host,
        name: conn.connection.name,
      },
      `🌿 MongoDB connected successfully to database: ${conn.connection.name}`
    );
    return conn;
  } catch (error) {
    logger.error({ error }, "❌ MongoDB connection failed");
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close(false);
    logger.info("🔒 MongoDB connection closed gracefully");
  } catch (error) {
    logger.error({ error }, "❌ Error closing MongoDB connection");
  }
};
