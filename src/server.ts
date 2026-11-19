import { app } from "./app.js";
import { env } from "./config/env.config.js";
import { connectDB, disconnectDB } from "./config/db.config.js";
import { logger } from "./config/logger.config.js";
import { streamingService } from "./modules/streaming/streaming.service.js";
import { Server } from "http";

let server: Server | undefined;
let isShuttingDown = false;

const startServer = async (): Promise<void> => {
  try {
    // Initialize Database connection first
    await connectDB();

    // Seed default streaming servers (VidRift, etc.)
    await streamingService.seedDefaultServers();

    // Start HTTP server
    server = app.listen(env.PORT, () => {
      logger.info(
        `🚀 Braindance Server started in [${env.NODE_ENV}] mode at http://localhost:${env.PORT}`
      );
      if (env.NODE_ENV === "production" && env.CORS_ORIGIN.trim() === "*") {
        logger.warn("⚠️ CORS_ORIGIN is set to '*' in production; restrict to trusted frontend origins.");
      }
    });
    server.keepAliveTimeout = 65_000;
    server.headersTimeout = 66_000;
  } catch (error) {
    logger.fatal({ error }, "❌ Failed to start application server");
    process.exit(1);
  }
};

// Graceful shutdown handling
const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`⏳ Received ${signal}. Starting graceful shutdown...`);

  const forceExitTimer = setTimeout(() => {
    logger.error("⏱️ Graceful shutdown timed out, forcing exit.");
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  if (server) {
    await new Promise<void>((resolve) => {
      server!.close(() => {
        logger.info("🔒 HTTP server closed.");
        resolve();
      });
    });
  }

  await disconnectDB();
  clearTimeout(forceExitTimer);
  logger.info("👋 Process terminated successfully.");
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Global unhandled promise rejection and exception catchers
process.on("unhandledRejection", (reason: unknown) => {
  logger.fatal({ reason }, "💥 Unhandled Rejection detected");
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  logger.fatal({ error }, "💥 Uncaught Exception thrown");
  process.exit(1);
});

startServer();
