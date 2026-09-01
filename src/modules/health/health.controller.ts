import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { env } from "../../config/env.config.js";
import { tmdbAdapter } from "../../adapters/tmdb.adapter.js";

export const getHealthStatus = asyncHandler(
  async (_req: Request, res: Response) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    let tmdbStatus: {
      status: "connected" | "error";
      authenticated: boolean;
      error?: string;
    };

    try {
      const tmdbAuth = await tmdbAdapter.verifyAuthentication();
      tmdbStatus = {
        status: tmdbAuth.success ? "connected" : "error",
        authenticated: tmdbAuth.success,
      };
    } catch (error) {
      tmdbStatus = {
        status: "error",
        authenticated: false,
        error: error instanceof Error ? error.message : "TMDB connection failed",
      };
    }

    const isDbHealthy = dbState === 1;
    const isTmdbHealthy = tmdbStatus.status === "connected";
    const overallStatus = isDbHealthy && isTmdbHealthy ? "healthy" : "degraded";

    const healthData = {
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      status: overallStatus,
      database: {
        status: dbStatusMap[dbState] || "unknown",
        name: mongoose.connection.name || null,
      },
      tmdb: tmdbStatus,
    };

    res
      .status(200)
      .json(new ApiResponse(200, healthData, "System operational"));
  }
);
