import mongoose from "mongoose";
import { env } from "./env.config.js";
import { logger } from "./logger.config.js";

let listenersRegistered = false;

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    if (!listenersRegistered) {
      listenersRegistered = true;
      mongoose.connection.on("error", (error) => {
        logger.error({ error }, "❌ MongoDB runtime connection error");
      });
      mongoose.connection.on("disconnected", () => {
        logger.warn("⚠️ MongoDB disconnected");
      });
    }

    const conn = await mongoose.connect(env.DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      maxPoolSize: 20,
    });
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
