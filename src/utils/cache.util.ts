import { env } from "../config/env.config.js";

/**
 * General cache validity helper based on time-to-live (TTL).
 *
 * @param lastFetchedAt - Timestamp when the resource was last retrieved from external source
 * @param ttlMs - Maximum lifetime in milliseconds (defaults to CACHE_TTL_HOURS from env)
 * @returns true if the cached resource is still fresh and valid; false if missing or expired
 */
export function isCacheValid(
  lastFetchedAt: Date | string | null | undefined,
  ttlMs: number = env.CACHE_TTL_HOURS * 60 * 60 * 1000
): boolean {
  if (!lastFetchedAt) {
    return false;
  }

  const fetchTime = new Date(lastFetchedAt).getTime();
  if (Number.isNaN(fetchTime)) {
    return false;
  }

  return Date.now() - fetchTime < ttlMs;
}
