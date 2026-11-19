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
  keysToExclude: string[] = DEFAULT_EXCLUDED_KEYS,
  seen: WeakSet<object> = new WeakSet()
): T {
  if (data === null || data === undefined || data instanceof Date) {
    return data;
  }

  if (typeof data !== "object") {
    return data;
  }

  if (seen.has(data as object)) {
    return undefined as unknown as T;
  }
  seen.add(data as object);

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeResponse(item, keysToExclude, seen)) as unknown as T;
  }

  const copy: Record<string, unknown> = { ...(data as Record<string, unknown>) };

  for (const key of keysToExclude) {
    delete copy[key];
  }

  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === "object" && copy[key] !== null) {
      copy[key] = sanitizeResponse(copy[key], keysToExclude, seen);
    }
  }

  return copy as unknown as T;
}

// Convenient alias for general usage
export const omitKeys = sanitizeResponse;
