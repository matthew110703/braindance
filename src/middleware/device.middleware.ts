import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

declare global {
  namespace Express {
    interface Request {
      deviceId?: string;
    }
  }
}

export const deviceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const headerDeviceId = (
    req.headers["x-device-id"] ||
    req.headers["x-device-token"] ||
    req.query.device_id ||
    req.query.deviceToken
  ) as string | undefined;

  let deviceId: string;

  if (headerDeviceId && typeof headerDeviceId === "string" && headerDeviceId.trim().length > 0) {
    deviceId = headerDeviceId.trim();
  } else {
    // Fallback: Generate a persistent device token based on client IP / User-Agent or random UUID
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "127.0.0.1";
    
    // Create a deterministic hash fallback for the same IP if no device header is passed
    const ipHash = crypto.createHash("sha256").update(`dev_${clientIp}`).digest("hex").slice(0, 24);
    deviceId = `anon_${ipHash}`;
  }

  req.deviceId = deviceId;
  res.setHeader("X-Device-Id", deviceId);
  next();
};
