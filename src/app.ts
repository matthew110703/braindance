import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { env } from "./config/env.config.js";
import { httpLogger } from "./config/logger.config.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorHandlerMiddleware } from "./middleware/error.middleware.js";
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

// Body parsing middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Root welcome route
app.get("/", (_req, res) => {
  res.json({
    name: "Braindance API",
    version: "1.0.0",
    environment: env.NODE_ENV,
    status: "active",
  });
});

// Mount global organized routes
app.use(globalRouter);

// Error and 404 handlers
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export { app };
