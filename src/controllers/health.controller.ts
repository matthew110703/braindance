import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

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
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      status: "OK",
      database: dbStatusMap[dbState] || "unknown",
    };

    res.status(200).json(new ApiResponse(200, healthData, "System is healthy"));
  }
);
