import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { env } from "../config/env.config.js";
import { ApiError } from "../utils/apiError.js";

/**
 * App-level authentication middleware that validates incoming requests with X-API-Key.
 * Rejects invalid or missing keys with a generic 401 Unauthorized without leakage.
 */
export const protect = (req: Request, _res: Response, next: NextFunction): void => {
  const clientApiKey = req.headers["x-api-key"] as string | undefined;

  if (!clientApiKey || typeof clientApiKey !== "string") {
    return next(new ApiError(401, "Unauthorized"));
  }

  const expectedKey = env.API_KEY;

  // Hash both keys to fixed-length SHA-256 digests so timingSafeEqual does not leak key length
  const clientHash = crypto.createHash("sha256").update(clientApiKey).digest();
  const expectedHash = crypto.createHash("sha256").update(expectedKey).digest();

  if (!crypto.timingSafeEqual(clientHash, expectedHash)) {
    return next(new ApiError(401, "Unauthorized"));
  }

  next();
};
