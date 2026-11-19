import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { env } from "../../config/env.config.js";
import { tmdbAdapter } from "../../adapters/tmdb.adapter.js";

interface CachedTmdbProbe {
  status: "connected" | "error";
  authenticated: boolean;
  checkedAt: number;
}

const TMDB_PROBE_TTL_MS = 60_000;
let cachedTmdbProbe: CachedTmdbProbe | null = null;

async function checkTmdbHealth(): Promise<{
  status: "connected" | "error";
  authenticated: boolean;
}> {
  const now = Date.now();
  if (cachedTmdbProbe && now - cachedTmdbProbe.checkedAt < TMDB_PROBE_TTL_MS) {
    return {
      status: cachedTmdbProbe.status,
      authenticated: cachedTmdbProbe.authenticated,
    };
  }

  try {
    const tmdbAuth = await tmdbAdapter.verifyAuthentication();
    const result = {
      status: (tmdbAuth.success ? "connected" : "error") as "connected" | "error",
      authenticated: Boolean(tmdbAuth.success),
    };
    cachedTmdbProbe = { ...result, checkedAt: now };
    return result;
  } catch {
    const result = {
      status: "error" as const,
      authenticated: false,
    };
    cachedTmdbProbe = { ...result, checkedAt: now };
    return result;
  }
}

export const getHealthStatus = asyncHandler(
  async (_req: Request, res: Response) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const tmdbStatus = await checkTmdbHealth();

    const isDbHealthy = dbState === 1;
    const isTmdbHealthy = tmdbStatus.status === "connected";
    const overallStatus = isDbHealthy && isTmdbHealthy ? "healthy" : "degraded";
    const httpStatus = overallStatus === "healthy" ? 200 : 503;

    const healthData = {
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      status: overallStatus,
      database: {
        status: dbStatusMap[dbState] || "unknown",
      },
      tmdb: tmdbStatus,
    };

    res.setHeader("Cache-Control", "no-store");
    res
      .status(httpStatus)
      .json(
        new ApiResponse(
          httpStatus,
          healthData,
          overallStatus === "healthy" ? "System operational" : "System degraded"
        )
      );
  }
);
