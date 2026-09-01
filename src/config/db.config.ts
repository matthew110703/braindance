import mongoose from "mongoose";
import { env } from "./env.config.js";
import { logger } from "./logger.config.js";

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
