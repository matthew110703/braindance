import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { env } from "./config/env.config.js";
import { httpLogger } from "./config/logger.config.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorHandlerMiddleware } from "./middleware/error.middleware.js";
import { deviceMiddleware } from "./middleware/device.middleware.js";
import { protect } from "./middleware/protect.middleware.js";
import globalRouter from "./routes/index.js";

const app: Express = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Logging and performance
app.use(httpLogger);
app.use(compression());
app.use(rateLimiter);

// Device identity extraction
app.use(deviceMiddleware);

// Body parsing middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Root API status endpoint (Public)
app.get("/", (_req, res) => {
  res.json({
    name: "Braindance API",
    version: "1.0.0",
    environment: env.NODE_ENV,
    status: "active",
  });
});

// App-level API key authentication for all subsequent routes
app.use(protect);

// Mount global organized routes
app.use(globalRouter);

// Error and 404 handlers
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export { app };
