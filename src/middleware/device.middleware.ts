import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { extractClientIp } from "./rateLimiter.middleware.js";

declare global {
  namespace Express {
    interface Request {
      deviceId?: string;
    }
  }
}

const VALID_DEVICE_ID_REGEX = /^[a-zA-Z0-9_-]{4,128}$/;

export const deviceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const rawDeviceId = req.headers["x-device-id"] || req.headers["x-device-token"];
  const candidate = Array.isArray(rawDeviceId) ? rawDeviceId[0] : rawDeviceId;
  const trimmed = typeof candidate === "string" ? candidate.trim() : "";

  let deviceId: string;

  if (trimmed && VALID_DEVICE_ID_REGEX.test(trimmed)) {
    deviceId = trimmed;
  } else {
    // Fallback: deterministic anonymous device token derived from normalized client IP
    const clientIp = extractClientIp(req);
    const ipHash = crypto
      .createHash("sha256")
      .update(`dev_${clientIp}`)
      .digest("hex")
      .slice(0, 24);
    deviceId = `anon_${ipHash}`;
  }

  req.deviceId = deviceId;
  res.setHeader("X-Device-Id", deviceId);
  next();
};
