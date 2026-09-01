/**
 * Default list of keys to exclude across the application responses.
 * You can add any additional fields here that you want omitted everywhere.
 */
export const DEFAULT_EXCLUDED_KEYS: string[] = [
  "production_companies",
  "production_countries",
];

/**
 * General recursive utility to strip specified keys from objects, arrays, or API payloads.
 *
 * @param data - Target data object or array to sanitize
 * @param keysToExclude - List of keys to remove (defaults to DEFAULT_EXCLUDED_KEYS)
 * @returns Cleaned clone of data with specified keys removed
 */
export function sanitizeResponse<T>(
  data: T,
  keysToExclude: string[] = DEFAULT_EXCLUDED_KEYS
): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeResponse(item, keysToExclude)) as unknown as T;
  }

  if (typeof data === "object" && data !== null) {
    const copy: Record<string, unknown> = { ...(data as Record<string, unknown>) };

    for (const key of keysToExclude) {
      delete copy[key];
    }

    for (const key of Object.keys(copy)) {
      if (typeof copy[key] === "object" && copy[key] !== null) {
        copy[key] = sanitizeResponse(copy[key], keysToExclude);
      }
    }

    return copy as unknown as T;
  }

  return data;
}

// Convenient alias for general usage
export const omitKeys = sanitizeResponse;
