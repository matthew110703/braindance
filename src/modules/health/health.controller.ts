import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { env } from "../../config/env.config.js";

export const getHealthStatus = asyncHandler(
  async (_req: Request, res: Response) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const healthData = {
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      status: "healthy",
      database: {
        status: dbStatusMap[dbState] || "unknown",
        name: mongoose.connection.name || null,
      },
    };

    res
      .status(200)
      .json(new ApiResponse(200, healthData, "System operational"));
  }
);
