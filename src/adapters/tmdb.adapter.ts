import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { env } from "../config/env.config.js";
import { logger } from "../config/logger.config.js";
import { ApiError } from "../utils/apiError.js";

export interface TMDBErrorResponse {
  status_code?: number;
  status_message?: string;
  success?: boolean;
}

const RETRY_DELAYS_MS = [300, 800];

const isTransientStatus = (statusCode: number): boolean =>
  statusCode === 408 ||
  statusCode === 429 ||
  statusCode === 502 ||
  statusCode === 503 ||
  statusCode === 504;

const redactParams = (params: unknown): unknown => {
  if (!params || typeof params !== "object") return params;
  const copy = { ...(params as Record<string, unknown>) };
  if ("session_id" in copy) {
    copy.session_id = "[REDACTED]";
  }
  return copy;
};

export class TMDBAdapter {
  public readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.TMDB_BASE_URL,
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${env.TMDB_ACCESS_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request logging interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(
          {
            method: config.method?.toUpperCase(),
            url: `${config.baseURL || ""}${config.url || ""}`,
            params: redactParams(config.params),
          },
          "🎬 TMDB API Request dispatched"
        );
        return config;
      },
      (error: unknown) => {
        logger.error({ error }, "❌ TMDB API Request preparation failed");
        return Promise.reject(error);
      }
    );

    // Response interceptor and error normalization
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError<TMDBErrorResponse>) => {
        const rawStatus = error.response?.status;
        const isTimeout = error.code === "ECONNABORTED";
        // Do not surface upstream TMDB 401/403 as client authentication failure
        const status =
          rawStatus === 401 || rawStatus === 403
            ? 502
            : isTimeout
            ? 504
            : rawStatus || 502;
        const tmdbMessage =
          error.response?.data?.status_message ||
          error.message ||
          "Failed to communicate with TMDB API";

        logger.error(
          {
            status,
            rawStatus,
            url: error.config?.url,
            tmdbStatusCode: error.response?.data?.status_code,
            message: tmdbMessage,
          },
          `❌ TMDB API Error: ${tmdbMessage}`
        );

        const mappedError = new ApiError(
          status,
          `TMDB Error: ${tmdbMessage}`,
          error.response?.data ? [String(error.response.data.status_code || status)] : []
        );

        return Promise.reject(mappedError);
      }
    );
  }

  /**
   * Perform a GET request to the TMDB API with bounded retries on transient upstream failures
   */
  public async get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        const response = await this.client.get<T>(url, {
          ...config,
          params: {
            ...params,
            ...config?.params,
          },
        });
        return response.data;
      } catch (error) {
        lastError = error;
        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        if (attempt < RETRY_DELAYS_MS.length && isTransientStatus(statusCode)) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  /**
   * Perform a POST request to the TMDB API and return typed data
   */
  public async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Perform a DELETE request to the TMDB API and return typed data
   */
  public async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Verify TMDB API token authentication status
   */
  public async verifyAuthentication(): Promise<{ success: boolean; status_code?: number; status_message?: string }> {
    return this.get<{ success: boolean; status_code?: number; status_message?: string }>("/authentication");
  }
}

export const tmdbAdapter = new TMDBAdapter();
export const tmdbClient = tmdbAdapter.client;
