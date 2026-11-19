import type { Request } from "express";
import net from "node:net";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.config.js";

function normalizeIpCandidate(raw: string): string | null {
  let candidate = raw.trim();
  if (!candidate) return null;

  if (candidate.startsWith("[") && candidate.includes("]")) {
    candidate = candidate.slice(1, candidate.indexOf("]"));
  } else if (candidate.split(":").length === 2 && candidate.includes(".")) {
    candidate = candidate.split(":")[0] || candidate;
  }

  const zoneIdx = candidate.indexOf("%");
  if (zoneIdx !== -1) {
    candidate = candidate.slice(0, zoneIdx);
  }

  if (candidate === "::1") {
    return "127.0.0.1";
  }
  if (candidate.toLowerCase().startsWith("::ffff:")) {
    const ipv4 = candidate.slice(7);
    if (net.isIP(ipv4) === 4) {
      return ipv4;
    }
  }

  return net.isIP(candidate) !== 0 ? candidate : null;
}

function readHeaderValue(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Extracts and normalizes the specific end-user IP address from proxy / BFF headers
 * (`x-client-ip`, `cf-connecting-ip`, `true-client-ip`, `x-real-ip`, `x-forwarded-for`)
 * before falling back to Express `req.ip` / socket address.
 */
export function extractClientIp(req: Request): string {
  const directHeaders = [
    readHeaderValue(req.headers["x-client-ip"]),
    readHeaderValue(req.headers["cf-connecting-ip"]),
    readHeaderValue(req.headers["true-client-ip"]),
    readHeaderValue(req.headers["x-real-ip"]),
  ];

  for (const headerVal of directHeaders) {
    if (!headerVal) continue;
    const normalized = normalizeIpCandidate(headerVal);
    if (normalized) return normalized;
  }

  const xff = readHeaderValue(req.headers["x-forwarded-for"]);
  if (xff) {
    for (const part of xff.split(",")) {
      const normalized = normalizeIpCandidate(part);
      if (normalized) return normalized;
    }
  }

  const fallback =
    (req.ip ? normalizeIpCandidate(req.ip) : null) ||
    (req.socket?.remoteAddress ? normalizeIpCandidate(req.socket.remoteAddress) : null);

  return fallback || "127.0.0.1";
}

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes (900,000 ms)
  limit: env.RATE_LIMIT_MAX, // 100 requests per 15 minutes per specific client IP
  keyGenerator: (req) => extractClientIp(req),
  validate: {
    xForwardedForHeader: false,
    trustProxy: false,
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => req.path === "/" || req.path === "/api/v1/health" || req.path === "/health",
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests from this IP, please try again later.",
  },
});
