import pino from "pino";
import { pinoHttp } from "pino-http";
import { env } from "./env.config.js";

export const logger = pino({
  level: env.LOG_LEVEL || (env.NODE_ENV === "development" ? "debug" : "info"),
  ...(env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  autoLogging: {
    ignore: (req) => {
      // Don't clutter logs with health check polling
      return req.url === "/api/v1/health" || req.url === "/health";
    },
  },
});
