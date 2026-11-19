import mongoose from "mongoose";
import {
  UserModel,
  IUser,
  IHistoryItem,
  IEpisodePlaybackProgress,
} from "../../models/user.model.js";
import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import { sanitizeResponse } from "../../utils/sanitize.util.js";
import { logger } from "../../config/logger.config.js";
import {
  HistoryItem,
  HistoryListResponse,
  HistoryActionResponse,
  HistoryStatusResponse,
  IPlaybackProgress,
} from "./history.types.js";
import {
  UpdateHistoryInput,
  GetHistoryItemQuery,
  GetHistoryListQuery,
} from "./history.schema.js";

const MAX_MEMORY_USERS = 500;
const MAX_HISTORY_ITEMS = 100;

function extractCompactMetadata(
  details: Record<string, unknown>,
  mediaType: "movie" | "tv"
): Record<string, unknown> {
  const genres = Array.isArray(details.genres)
    ? (details.genres as Array<{ id?: number }>)
        .map((g) => g.id)
        .filter((id): id is number => typeof id === "number")
    : undefined;

  return {
    title: details.title ?? undefined,
    name: details.name ?? undefined,
    poster_path: details.poster_path ?? null,
    backdrop_path: details.backdrop_path ?? null,
    vote_average: details.vote_average ?? 0,
    release_date: details.release_date ?? undefined,
    first_air_date: details.first_air_date ?? undefined,
    overview:
      typeof details.overview === "string"
        ? details.overview.slice(0, 500)
        : undefined,
    genre_ids: Array.isArray(details.genre_ids) ? details.genre_ids : genres,
    ...(mediaType === "tv" && details.number_of_seasons !== undefined
      ? { number_of_seasons: details.number_of_seasons }
      : {}),
  };
}

function getEpisodeKey(season?: number | null, episode?: number | null): string | null {
  if (
    typeof season === "number" &&
    typeof episode === "number" &&
    season >= 0 &&
    episode >= 0
  ) {
    return `S${season}E${episode}`;
  }
  return null;
}

export class HistoryService {
  private memoryStore: Map<string, HistoryItem[]> = new Map();

  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  private getMemoryHistory(deviceToken: string): HistoryItem[] {
    if (!this.memoryStore.has(deviceToken)) {
      if (this.memoryStore.size >= MAX_MEMORY_USERS) {
        const oldestKey = this.memoryStore.keys().next().value;
        if (oldestKey !== undefined) {
          this.memoryStore.delete(oldestKey);
        }
      }
      this.memoryStore.set(deviceToken, []);
    }
    return this.memoryStore.get(deviceToken)!;
  }

  private matchesItem(
    item: { id: number; media_type?: string },
    mediaId: number,
    mediaType?: "movie" | "tv"
  ): boolean {
    if (Number(item.id) !== mediaId) return false;
    if (!mediaType) return true;
    return (item.media_type || "movie") === mediaType;
  }

  /**
   * Update or insert watch history progress with compact media metadata
   */
  async updateProgress(
    deviceToken: string,
    mediaId: number,
    input: UpdateHistoryInput
  ): Promise<HistoryActionResponse> {
    const mediaType: "movie" | "tv" = input.mediaType || "movie";
    const progress: IPlaybackProgress = {
      event: input.event,
      currentTime: input.currentTime,
      duration: input.duration,
      progress: Math.min(100, Math.max(0, input.progress)),
      season: input.season ?? null,
      episode: input.episode ?? null,
      timestamp: input.timestamp || Date.now(),
    };

    const episodeKey =
      mediaType === "tv" ? getEpisodeKey(progress.season, progress.episode) : null;

    let resultItem: HistoryItem | null = null;
    const now = new Date();

    if (mongoose.connection.readyState === 1) {
      try {
        let user = await UserModel.findOne({ deviceToken });
        if (!user) {
          user = new UserModel({
            deviceToken,
            watchlist: [],
            watchlistItems: [],
            history: [],
          });
        }

        const existingIndex = user.history.findIndex((item: IHistoryItem) =>
          this.matchesItem(item, mediaId, mediaType)
        );

        if (existingIndex !== -1) {
          const existingEntry = user.history[existingIndex] as unknown as {
            toObject?: () => Record<string, unknown>;
          } & IHistoryItem;
          const rawDoc = existingEntry.toObject
            ? existingEntry.toObject()
            : existingEntry;

          const existingEpisodes = (
            rawDoc.episodes && typeof rawDoc.episodes === "object"
              ? { ...(rawDoc.episodes as Record<string, IEpisodePlaybackProgress>) }
              : {}
          );
          if (episodeKey) {
            existingEpisodes[episodeKey] = {
              ...progress,
              updatedAt: now,
            };
          }

          const updatedItem: HistoryItem = {
            ...rawDoc,
            id: mediaId,
            media_type: mediaType,
            progress,
            ...(episodeKey || Object.keys(existingEpisodes).length > 0
              ? { episodes: existingEpisodes }
              : {}),
            updatedAt: now,
          };

          user.history.splice(existingIndex, 1);
          user.history.unshift(updatedItem as unknown as IHistoryItem);
          if (user.history.length > MAX_HISTORY_ITEMS) {
            user.history = user.history.slice(0, MAX_HISTORY_ITEMS);
          }
          user.markModified("history");
          await user.save();

          resultItem = updatedItem;
          logger.debug(
            { deviceToken, mediaId, mediaType, event: input.event },
            "⚡ Updated watch progress in MongoDB"
          );
        } else {
          const endpoint = mediaType === "tv" ? `/tv/${mediaId}` : `/movie/${mediaId}`;

          logger.debug(
            { mediaId, mediaType },
            "📡 Fetching media metadata from TMDB for history entry"
          );
          let compactMetadata: Record<string, unknown> = {};
          try {
            const fetched = await this.adapter.get<Record<string, unknown>>(endpoint, {
              language: "en-US",
            });
            compactMetadata = extractCompactMetadata(
              sanitizeResponse(fetched),
              mediaType
            );
          } catch (fetchErr) {
            logger.warn(
              { fetchErr, mediaId },
              "⚠️ Could not fetch full TMDB details, saving minimal history record"
            );
          }

          const episodesMap = episodeKey
            ? { [episodeKey]: { ...progress, updatedAt: now } }
            : undefined;

          const newItem: HistoryItem = {
            ...compactMetadata,
            id: mediaId,
            media_type: mediaType,
            progress,
            ...(episodesMap ? { episodes: episodesMap } : {}),
            updatedAt: now,
          };

          user.history.unshift(newItem as unknown as IHistoryItem);
          if (user.history.length > MAX_HISTORY_ITEMS) {
            user.history = user.history.slice(0, MAX_HISTORY_ITEMS);
          }
          user.markModified("history");
          await user.save();

          resultItem = newItem;
          logger.info(
            { deviceToken, mediaId, mediaType },
            "💾 Created new watch history item in MongoDB"
          );
        }
      } catch (err) {
        logger.error(
          { err, deviceToken, mediaId },
          "⚠️ Error saving watch progress to MongoDB"
        );
      }
    }

    // Update bounded in-memory fallback
    const memList = this.getMemoryHistory(deviceToken);
    const memIdx = memList.findIndex((item) =>
      this.matchesItem(item, mediaId, mediaType)
    );
    if (!resultItem) {
      const existingMem = memIdx !== -1 ? memList[memIdx] : undefined;
      const existingEpisodes = existingMem?.episodes ? { ...existingMem.episodes } : {};
      if (episodeKey) {
        existingEpisodes[episodeKey] = { ...progress, updatedAt: now };
      }
      resultItem = {
        ...(existingMem || {}),
        id: mediaId,
        media_type: mediaType,
        progress,
        ...(episodeKey || Object.keys(existingEpisodes).length > 0
          ? { episodes: existingEpisodes }
          : {}),
        updatedAt: now,
      };
    }

    if (memIdx !== -1) {
      memList.splice(memIdx, 1);
    }
    memList.unshift(resultItem);
    if (memList.length > MAX_HISTORY_ITEMS) {
      memList.length = MAX_HISTORY_ITEMS;
    }

    return {
      success: true,
      message: "Watch progress updated successfully",
      media_id: mediaId,
      data: resultItem,
    };
  }

  private resolveItemProgress(
    item: HistoryItem,
    query?: GetHistoryItemQuery
  ): HistoryItem {
    if (!query || query.season === undefined || query.episode === undefined) {
      return item;
    }
    const epKey = getEpisodeKey(query.season, query.episode);
    if (epKey && item.episodes && item.episodes[epKey]) {
      return {
        ...item,
        progress: item.episodes[epKey],
      };
    }
    return item;
  }

  /**
   * Get watch progress and media details for a specific media item
   */
  async getProgress(
    deviceToken: string,
    mediaId: number,
    query?: GetHistoryItemQuery
  ): Promise<HistoryStatusResponse> {
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserModel.findOne({ deviceToken }).lean<IUser>();
        const item = (user?.history || []).find((h) =>
          this.matchesItem(h, mediaId, query?.mediaType)
        );
        return {
          media_id: mediaId,
          item_present: Boolean(item),
          data: item ? this.resolveItemProgress(item as HistoryItem, query) : null,
        };
      } catch (err) {
        logger.error(
          { err, deviceToken, mediaId },
          "⚠️ Error querying item progress from MongoDB"
        );
      }
    }

    const memList = this.getMemoryHistory(deviceToken);
    const memItem = memList.find((h) =>
      this.matchesItem(h, mediaId, query?.mediaType)
    );

    return {
      media_id: mediaId,
      item_present: Boolean(memItem),
      data: memItem ? this.resolveItemProgress(memItem, query) : null,
    };
  }

  private async loadHistoryItems(deviceToken: string): Promise<HistoryItem[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserModel.findOne({ deviceToken }).lean<IUser>();
        return (user?.history || []) as HistoryItem[];
      } catch (err) {
        logger.error({ err, deviceToken }, "⚠️ Error querying watch history from MongoDB");
      }
    }

    return this.getMemoryHistory(deviceToken);
  }

  /**
   * Get paginated watch history for a device, sorted by most recently watched
   */
  async getHistory(
    deviceToken: string,
    query: GetHistoryListQuery
  ): Promise<HistoryListResponse> {
    let historyItems = await this.loadHistoryItems(deviceToken);

    if (query.mediaType) {
      historyItems = historyItems.filter(
        (item) => (item.media_type || "movie") === query.mediaType
      );
    }

    const totalResults = historyItems.length;
    const pageSize = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const totalPages = Math.ceil(totalResults / pageSize) || 1;
    const page = Math.max(1, Number(query.page) || 1);

    const startIndex = (page - 1) * pageSize;
    const results = historyItems.slice(startIndex, startIndex + pageSize);

    return {
      page,
      total_pages: totalPages,
      total_results: totalResults,
      results,
    };
  }

  /**
   * Get unfinished items (1% <= progress < 95%) suitable for Continue Watching rails
   */
  async getContinueWatching(
    deviceToken: string,
    limit: number = 20,
    mediaType?: "movie" | "tv"
  ): Promise<HistoryListResponse> {
    let historyItems = await this.loadHistoryItems(deviceToken);

    if (mediaType) {
      historyItems = historyItems.filter(
        (item) => (item.media_type || "movie") === mediaType
      );
    }

    const filtered = historyItems.filter((item) => {
      const pct = Number(item.progress?.progress ?? 0);
      const evt = item.progress?.event;
      return evt !== "ended" && pct >= 1 && pct < 95;
    });

    const cappedLimit = Math.min(50, Math.max(1, Number(limit) || 20));
    const results = filtered.slice(0, cappedLimit);

    return {
      page: 1,
      total_pages: 1,
      total_results: filtered.length,
      results,
    };
  }

  /**
   * Remove a single item from watch history
   */
  async removeFromHistory(
    deviceToken: string,
    mediaId: number,
    mediaType?: "movie" | "tv"
  ): Promise<HistoryActionResponse> {
    if (mongoose.connection.readyState === 1) {
      try {
        if (mediaType) {
          const user = await UserModel.findOne({ deviceToken });
          if (user) {
            user.history = user.history.filter(
              (item: IHistoryItem) => !this.matchesItem(item, mediaId, mediaType)
            );
            user.markModified("history");
            await user.save();
          }
        } else {
          await UserModel.updateOne(
            { deviceToken },
            { $pull: { history: { id: mediaId } } }
          );
        }
        logger.info({ deviceToken, mediaId, mediaType }, "🗑️ Removed item from watch history in MongoDB");
      } catch (err) {
        logger.error(
          { err, deviceToken, mediaId },
          "⚠️ Error removing item from history in MongoDB"
        );
      }
    }

    const memList = this.getMemoryHistory(deviceToken);
    const filtered = memList.filter(
      (item) => !this.matchesItem(item, mediaId, mediaType)
    );
    this.memoryStore.set(deviceToken, filtered);

    return {
      success: true,
      message: "Item removed from watch history successfully",
      media_id: mediaId,
    };
  }

  /**
   * Clear entire watch history for a device
   */
  async clearHistory(deviceToken: string): Promise<HistoryActionResponse> {
    if (mongoose.connection.readyState === 1) {
      try {
        await UserModel.updateOne({ deviceToken }, { $set: { history: [] } });
        logger.info({ deviceToken }, "🧹 Cleared entire watch history in MongoDB");
      } catch (err) {
        logger.error({ err, deviceToken }, "⚠️ Error clearing watch history in MongoDB");
      }
    }

    this.memoryStore.set(deviceToken, []);

    return {
      success: true,
      message: "Watch history cleared successfully",
    };
  }
}

export const historyService = new HistoryService();
