import { app } from "./app.js";
import { env } from "./config/env.config.js";
import { connectDB, disconnectDB } from "./config/db.config.js";
import { logger } from "./config/logger.config.js";
import { Server } from "http";

let server: Server;

const startServer = async (): Promise<void> => {
  try {
    // Initialize Database connection first
    await connectDB();

    // Start HTTP server
    server = app.listen(env.PORT, () => {
      logger.info(
        `🚀 Braindance Server started in [${env.NODE_ENV}] mode at http://localhost:${env.PORT}`
      );
    });
  } catch (error) {
    logger.fatal({ error }, "❌ Failed to start application server");
    process.exit(1);
  }
};

// Graceful shutdown handling
const shutdown = async (signal: string): Promise<void> => {
  logger.info(`⏳ Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      logger.info("🔒 HTTP server closed.");
    });
  }

  await disconnectDB();
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
