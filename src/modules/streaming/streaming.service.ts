import {
  StreamingServerModel,
  IStreamingServerDoc,
} from "../../models/streamingServer.model.js";
import { AvailableServerPayload, ResolveMediaOptions } from "./streaming.types.js";
import { CreateServerBody, UpdateServerBody } from "./streaming.schema.js";
import { logger } from "../../config/logger.config.js";
import { ApiError } from "../../utils/apiError.js";

const SERVER_CACHE_TTL_MS = 60_000;

const DEFAULT_FALLBACK_SERVER: Pick<
  IStreamingServerDoc,
  | "id"
  | "name"
  | "baseUrl"
  | "moviePattern"
  | "tvPattern"
  | "anilistPattern"
  | "defaultParams"
  | "quality"
  | "priority"
> = {
  id: "native",
  name: "Netwatch Direct HLS",
  baseUrl: "https://embed.vidrift.net",
  moviePattern: "https://embed.vidrift.net/embed/movie/{tmdb_id}",
  tvPattern: "https://embed.vidrift.net/embed/tv/{tmdb_id}/{season}/{episode}",
  anilistPattern: "https://embed.vidrift.net/embed/anilist/{anilist_id}/{episode}",
  defaultParams: {
    brand: "Netwatch",
    brandColor: "#b0c6ff",
    font: "Inter",
    exit: 1,
    showTitle: 1,
    uiScale: 1.0,
    controlBg: "solid",
    mobileSheets: true,
  },
  quality: "Adaptive HLS • Ad-Free",
  priority: 1,
};

export class StreamingService {
  private activeServersCache: {
    servers: IStreamingServerDoc[];
    cachedAt: number;
  } | null = null;

  private invalidateCache(): void {
    this.activeServersCache = null;
  }

  /**
   * Seed default streaming servers on startup without overwriting admin customizations.
   * Performs a one-time cleanup if the legacy `native` seed still points to test-streams.mux.dev.
   */
  async seedDefaultServers(): Promise<void> {
    try {
      const defaultServers = [
        {
          id: "native",
          name: "Netwatch Direct HLS",
          baseUrl: "https://embed.vidrift.net",
          moviePattern: "https://embed.vidrift.net/embed/movie/{tmdb_id}",
          tvPattern: "https://embed.vidrift.net/embed/tv/{tmdb_id}/{season}/{episode}",
          anilistPattern: "https://embed.vidrift.net/embed/anilist/{anilist_id}/{episode}",
          defaultParams: {
            brand: "Netwatch",
            brandColor: "#b0c6ff",
            font: "Inter",
            exit: 1,
            showTitle: 1,
            uiScale: 1.0,
            controlBg: "solid",
            mobileSheets: true,
          },
          isActive: true,
          priority: 1,
          quality: "Adaptive HLS • Ad-Free",
        },
        {
          id: "vidrift",
          name: "VidRift Prime",
          baseUrl: "https://embed.vidrift.net",
          moviePattern: "https://embed.vidrift.net/embed/movie/{tmdb_id}",
          tvPattern: "https://embed.vidrift.net/embed/tv/{tmdb_id}/{season}/{episode}",
          anilistPattern: "https://embed.vidrift.net/embed/anilist/{anilist_id}/{episode}",
          defaultParams: {
            brand: "Netwatch",
            brandColor: "#b0c6ff",
            font: "Inter",
            exit: 1,
            showTitle: 1,
            uiScale: 1.0,
            controlBg: "solid",
            mobileSheets: true,
          },
          isActive: true,
          priority: 2,
          quality: "Adaptive HLS",
        },
      ];

      // One-time migration if legacy Mux test stream doc exists for `native`
      const legacyNative = await StreamingServerModel.findOne({
        id: "native",
        baseUrl: "https://test-streams.mux.dev",
      });
      if (legacyNative) {
        const nativeSeed = defaultServers[0];
        await StreamingServerModel.updateOne(
          { id: "native", baseUrl: "https://test-streams.mux.dev" },
          { $set: nativeSeed }
        );
        // Ensure VidRift moves to priority 2 when upgrading legacy priority order
        await StreamingServerModel.updateOne(
          { id: "vidrift", priority: 1 },
          { $set: { priority: 2 } }
        );
      }

      // Deactivate dead, broken, or ad-injecting legacy default relays
      await Promise.all([
        StreamingServerModel.updateOne(
          { id: "vidsrc", baseUrl: "https://vidsrc.xyz" },
          { $set: { isActive: false } }
        ),
        StreamingServerModel.updateOne(
          { id: "superembed", baseUrl: "https://multiembed.mov" },
          { $set: { isActive: false } }
        ),
        StreamingServerModel.updateOne(
          { id: "twoembed", baseUrl: "https://www.2embed.cc" },
          { $set: { isActive: false } }
        ),
        StreamingServerModel.updateOne(
          { id: "smashystream", baseUrl: "https://player.smashystream.com" },
          { $set: { isActive: false } }
        ),
        StreamingServerModel.updateOne(
          { id: "vidnest", baseUrl: "https://vidnest.fun" },
          { $set: { isActive: false } }
        ),
        StreamingServerModel.updateOne(
          { id: "vidfast", baseUrl: "https://vidfast.pro" },
          { $set: { isActive: false } }
        ),
        StreamingServerModel.updateOne(
          { id: "vidlink", baseUrl: "https://vidlink.pro" },
          { $set: { isActive: false } }
        ),
      ]);

      for (const serverData of defaultServers) {
        await StreamingServerModel.findOneAndUpdate(
          { id: serverData.id },
          { $setOnInsert: serverData },
          { upsert: true, returnDocument: "after" }
        );
      }
      this.invalidateCache();
      logger.info("[StreamingService] Default streaming servers verified.");
    } catch (error) {
      logger.error({ error }, "[StreamingService] Failed to seed default streaming servers");
    }
  }

  /**
   * Helper to interpolate template variables and append query parameters safely
   */
  buildEmbedUrl(
    server: IStreamingServerDoc,
    options: ResolveMediaOptions
  ): string {
    const { type, tmdbId, season = 1, episode = 1, anilistId, paramsOverride } = options;
    const tmdbStr = tmdbId !== undefined ? String(tmdbId) : "";
    const anilistStr = anilistId !== undefined ? String(anilistId) : tmdbStr;
    let url = "";

    if (type === "movie") {
      url = server.moviePattern.replaceAll("{tmdb_id}", tmdbStr);
    } else if (type === "tv") {
      url = server.tvPattern
        .replaceAll("{tmdb_id}", tmdbStr)
        .replaceAll("{season}", String(season))
        .replaceAll("{episode}", String(episode));
    } else if (type === "anilist") {
      url = server.anilistPattern
        .replaceAll("{anilist_id}", anilistStr)
        .replaceAll("{tmdb_id}", tmdbStr || anilistStr)
        .replaceAll("{episode}", String(episode));
    } else {
      url = server.moviePattern.replaceAll("{tmdb_id}", tmdbStr);
    }

    const mergedParams: Record<string, unknown> = {
      ...server.defaultParams,
      ...paramsOverride,
    };

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(mergedParams)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    }

    const query = searchParams.toString();
    if (!query) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${query}`;
  }

  private async loadActiveServers(): Promise<IStreamingServerDoc[]> {
    const now = Date.now();
    if (
      this.activeServersCache &&
      now - this.activeServersCache.cachedAt < SERVER_CACHE_TTL_MS
    ) {
      return this.activeServersCache.servers;
    }

    const servers = await StreamingServerModel.find({ isActive: true })
      .sort({ priority: 1 })
      .lean<IStreamingServerDoc[]>();

    this.activeServersCache = { servers, cachedAt: now };
    return servers;
  }

  /**
   * Fetch all active servers formatted with ready-to-embed URLs for a specific movie or episode
   */
  async getAvailableServersForMedia(
    options: ResolveMediaOptions
  ): Promise<AvailableServerPayload[]> {
    const fallbackPayload = (): AvailableServerPayload[] => [
      {
        id: DEFAULT_FALLBACK_SERVER.id,
        name: DEFAULT_FALLBACK_SERVER.name,
        embedUrl: this.buildEmbedUrl(
          DEFAULT_FALLBACK_SERVER as IStreamingServerDoc,
          options
        ),
        quality: DEFAULT_FALLBACK_SERVER.quality || "Adaptive HLS • Ad-Free",
        priority: DEFAULT_FALLBACK_SERVER.priority,
        isRecommended: true,
      },
    ];

    try {
      const servers = await this.loadActiveServers();
      if (!servers || servers.length === 0) {
        return fallbackPayload();
      }

      return servers.map((srv, index) => ({
        id: srv.id,
        name: srv.name,
        embedUrl: this.buildEmbedUrl(srv, options),
        quality: srv.quality || "Adaptive HLS",
        priority: srv.priority,
        isRecommended: index === 0,
      }));
    } catch (err) {
      logger.error({ err }, "[StreamingService] Error fetching available servers for media");
      return fallbackPayload();
    }
  }

  /**
   * Get all streaming servers (for admin / listing)
   */
  async getAllServers(): Promise<IStreamingServerDoc[]> {
    return StreamingServerModel.find().sort({ priority: 1 });
  }

  /**
   * Get single server config by ID
   */
  async getServerById(id: string): Promise<IStreamingServerDoc> {
    const server = await StreamingServerModel.findOne({ id });
    if (!server) {
      throw new ApiError(404, `Streaming server '${id}' not found`);
    }
    return server;
  }

  /**
   * Create new streaming server config
   */
  async createServer(data: CreateServerBody): Promise<IStreamingServerDoc> {
    const existing = await StreamingServerModel.findOne({ id: data.id });
    if (existing) {
      throw new ApiError(409, `Streaming server with id '${data.id}' already exists`);
    }
    const created = await StreamingServerModel.create(data);
    this.invalidateCache();
    return created;
  }

  /**
   * Update existing streaming server config
   */
  async updateServer(
    id: string,
    data: UpdateServerBody
  ): Promise<IStreamingServerDoc> {
    const server = await StreamingServerModel.findOneAndUpdate(
      { id },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    );
    if (!server) {
      throw new ApiError(404, `Streaming server '${id}' not found`);
    }
    this.invalidateCache();
    return server;
  }

  /**
   * Delete streaming server config
   */
  async deleteServer(id: string): Promise<void> {
    const result = await StreamingServerModel.findOneAndDelete({ id });
    if (!result) {
      throw new ApiError(404, `Streaming server '${id}' not found`);
    }
    this.invalidateCache();
  }
}

export const streamingService = new StreamingService();
