import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import apiRouter from "./routes/index.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { errorHandlerMiddleware } from "./middlewares/error.middleware.js";

const app: Express = express();

// Security and utility middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(compression());

// Body parsing middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Routes
app.use("/api/v1", apiRouter);

// Root route
app.get("/", (_req, res) => {
  res.json({
    name: "Braindance API",
    version: "1.0.0",
    status: "active",
  });
});

// 404 and Error handling middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export { app };
