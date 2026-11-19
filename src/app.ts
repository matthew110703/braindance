import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createRequire } from "node:module";
import { env } from "./config/env.config.js";
import { httpLogger } from "./config/logger.config.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorHandlerMiddleware } from "./middleware/error.middleware.js";
import { deviceMiddleware } from "./middleware/device.middleware.js";
import { protect } from "./middleware/protect.middleware.js";
import healthRoutes from "./modules/health/health.routes.js";
import globalRouter from "./routes/index.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version?: string };

const app: Express = express();
app.disable("x-powered-by");

// Trust upstream reverse proxy (Render, Nginx, Vercel, etc.) for accurate client IP & rate limiting
app.set("trust proxy", 1);

// Parse CORS origin configuration (credentials: true cannot use literal "*")
// Always strip trailing slashes because browser Origin headers never include a trailing slash.
const parseCorsOrigin = (rawOrigin: string): boolean | string[] => {
  const trimmed = rawOrigin.trim();
  if (!trimmed || trimmed === "*") {
    return true;
  }
  return trimmed
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
};

// Normalize accidental double leading slashes (e.g. "//api/v1/watchlist" when BRAINDANCE_API_URL has a trailing slash)
app.use((req, _res, next) => {
  if (req.url.startsWith("//")) {
    req.url = req.url.replace(/^\/+/, "/");
  }
  next();
});

// Security middlewares
app.use(helmet());
app.use((_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
});
app.use(
  cors({
    origin: parseCorsOrigin(env.CORS_ORIGIN),
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-API-Key",
      "X-Device-Id",
      "X-Device-Token",
      "X-Admin-Key",
      "X-Client-Ip",
      "X-Forwarded-For",
    ],
    exposedHeaders: ["X-Device-Id"],
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

// Public root status & health endpoints
app.get("/", (_req, res) => {
  res.json({
    name: "Braindance API",
    version: pkg.version || "1.0.0",
    environment: env.NODE_ENV,
    status: "active",
  });
});

app.use("/api/v1/health", healthRoutes);

// App-level API key authentication for all subsequent routes
app.use(protect);

// Mount global organized routes
app.use(globalRouter);

// Error and 404 handlers
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export { app };
