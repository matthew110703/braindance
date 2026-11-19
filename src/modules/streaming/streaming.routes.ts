import { Router, Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { streamingController } from "./streaming.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { ApiError } from "../../utils/apiError.js";
import {
  createServerSchema,
  updateServerSchema,
  serverIdParamSchema,
  resolveEmbedUrlSchema,
} from "./streaming.schema.js";

const requireAdminIfConfigured = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const configuredAdminKey = process.env.ADMIN_API_KEY?.trim();
  if (!configuredAdminKey) {
    return next();
  }

  const provided = req.headers["x-admin-key"];
  const candidate = Array.isArray(provided) ? provided[0] : provided;
  if (!candidate || typeof candidate !== "string") {
    return next(new ApiError(403, "Forbidden: admin key required"));
  }

  const a = crypto.createHash("sha256").update(candidate).digest();
  const b = crypto.createHash("sha256").update(configuredAdminKey).digest();
  if (!crypto.timingSafeEqual(a, b)) {
    return next(new ApiError(403, "Forbidden: invalid admin key"));
  }

  next();
};

const router = Router();

// Stream resolver endpoint
router.get(
  "/resolve",
  validate(resolveEmbedUrlSchema),
  streamingController.resolveEmbedUrl
);

// Server CRUD endpoints
router.get("/servers", streamingController.getAllServers);

router.post(
  "/servers",
  requireAdminIfConfigured,
  validate(createServerSchema),
  streamingController.createServer
);

router.get(
  "/servers/:id",
  validate(serverIdParamSchema),
  streamingController.getServerById
);

router.put(
  "/servers/:id",
  requireAdminIfConfigured,
  validate(updateServerSchema),
  streamingController.updateServer
);

router.delete(
  "/servers/:id",
  requireAdminIfConfigured,
  validate(serverIdParamSchema),
  streamingController.deleteServer
);

export default router;
