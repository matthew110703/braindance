import mongoose from "mongoose";
import { UserModel, IUser, IWatchlistEntry } from "../../models/user.model.js";
import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import { TMDBMovieDetails } from "../movie/movie.types.js";
import { TMDBTvDetails } from "../tv/tv.types.js";
import { sanitizeResponse } from "../../utils/sanitize.util.js";
import { logger } from "../../config/logger.config.js";
import {
  WatchlistActionResponse,
  WatchlistCheckResponse,
  WatchlistHydratedItem,
  WatchlistResponse,
} from "./watchlist.types.js";
import { GetWatchlistQuery, WatchlistMediaType } from "./watchlist.schema.js";

const MAX_MEMORY_USERS = 500;

interface StoredWatchlistEntry {
  media_id: number;
  media_type: WatchlistMediaType;
}

export class WatchlistService {
  private memoryStore: Map<string, Map<string, StoredWatchlistEntry>> = new Map();

  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  private entryKey(mediaId: number, mediaType: WatchlistMediaType): string {
    return `${mediaType}:${mediaId}`;
  }

  private getMemoryUser(deviceToken: string): Map<string, StoredWatchlistEntry> {
    if (!this.memoryStore.has(deviceToken)) {
      if (this.memoryStore.size >= MAX_MEMORY_USERS) {
        const oldestKey = this.memoryStore.keys().next().value;
        if (oldestKey !== undefined) {
          this.memoryStore.delete(oldestKey);
        }
      }
      this.memoryStore.set(deviceToken, new Map());
    }
    return this.memoryStore.get(deviceToken)!;
  }

  private mergeUserEntries(user: IUser | null | undefined): StoredWatchlistEntry[] {
    if (!user) return [];
    const merged = new Map<string, StoredWatchlistEntry>();

    for (const item of user.watchlistItems || []) {
      const type: WatchlistMediaType = item.media_type === "tv" ? "tv" : "movie";
      merged.set(this.entryKey(item.media_id, type), {
        media_id: item.media_id,
        media_type: type,
      });
    }

    for (const legacyId of user.watchlist || []) {
      const key = this.entryKey(legacyId, "movie");
      if (!merged.has(key)) {
        merged.set(key, { media_id: legacyId, media_type: "movie" });
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Add a movie or TV ID to the user's watchlist
   */
  async addToWatchlist(
    deviceToken: string,
    mediaId: number,
    mediaType: WatchlistMediaType = "movie"
  ): Promise<WatchlistActionResponse> {
    const mem = this.getMemoryUser(deviceToken);
    mem.set(this.entryKey(mediaId, mediaType), { media_id: mediaId, media_type: mediaType });

    let count = mem.size;

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

        const exists = (user.watchlistItems || []).some(
          (entry: IWatchlistEntry) =>
            entry.media_id === mediaId && entry.media_type === mediaType
        );

        if (!exists) {
          user.watchlistItems = user.watchlistItems || [];
          user.watchlistItems.unshift({
            media_id: mediaId,
            media_type: mediaType,
            addedAt: new Date(),
          });
        }

        if (mediaType === "movie" && !user.watchlist.includes(mediaId)) {
          user.watchlist.push(mediaId);
        }

        await user.save();
        count = this.mergeUserEntries(user).length;
      } catch (err) {
        logger.error({ err, deviceToken, mediaId, mediaType }, "⚠️ Error adding item to watchlist in MongoDB");
      }
    }

    return {
      success: true,
      message: "Media item added to watchlist successfully",
      media_id: mediaId,
      media_type: mediaType,
      count,
    };
  }

  /**
   * Remove a movie or TV ID from the user's watchlist
   */
  async removeFromWatchlist(
    deviceToken: string,
    mediaId: number,
    mediaType?: WatchlistMediaType
  ): Promise<WatchlistActionResponse> {
    const mem = this.getMemoryUser(deviceToken);
    if (mediaType) {
      mem.delete(this.entryKey(mediaId, mediaType));
    } else {
      mem.delete(this.entryKey(mediaId, "movie"));
      mem.delete(this.entryKey(mediaId, "tv"));
    }

    let count = mem.size;

    if (mongoose.connection.readyState === 1) {
      try {
        const pullItemsQuery = mediaType
          ? { media_id: mediaId, media_type: mediaType }
          : { media_id: mediaId };

        const updateOp: Record<string, unknown> = {
          $pull: {
            watchlistItems: pullItemsQuery,
            ...(mediaType !== "tv" ? { watchlist: mediaId } : {}),
          },
        };

        const user = await UserModel.findOneAndUpdate(
          { deviceToken },
          updateOp,
          { returnDocument: "after" }
        );
        if (user) {
          count = this.mergeUserEntries(user).length;
        }
      } catch (err) {
        logger.error({ err, deviceToken, mediaId, mediaType }, "⚠️ Error removing item from watchlist in MongoDB");
      }
    }

    return {
      success: true,
      message: "Media item removed from watchlist successfully",
      media_id: mediaId,
      ...(mediaType ? { media_type: mediaType } : {}),
      count,
    };
  }

  /**
   * Check if a media item is present in the user's watchlist
   */
  async checkStatus(
    deviceToken: string,
    mediaId: number,
    mediaType?: WatchlistMediaType
  ): Promise<WatchlistCheckResponse> {
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserModel.findOne({ deviceToken }).lean<IUser>();
        const entries = this.mergeUserEntries(user);
        const isPresent = entries.some((entry) =>
          mediaType
            ? entry.media_id === mediaId && entry.media_type === mediaType
            : entry.media_id === mediaId
        );
        return {
          media_id: mediaId,
          ...(mediaType ? { media_type: mediaType } : {}),
          item_present: isPresent,
        };
      } catch (err) {
        logger.error({ err, deviceToken, mediaId }, "⚠️ Error checking watchlist status in MongoDB");
      }
    }

    const mem = this.getMemoryUser(deviceToken);
    const isPresent = mediaType
      ? mem.has(this.entryKey(mediaId, mediaType))
      : mem.has(this.entryKey(mediaId, "movie")) || mem.has(this.entryKey(mediaId, "tv"));

    return {
      media_id: mediaId,
      ...(mediaType ? { media_type: mediaType } : {}),
      item_present: isPresent,
    };
  }

  /**
   * Get all watchlist items with full TMDB details hydrated and sanitized
   */
  async getWatchlist(deviceToken: string, query: GetWatchlistQuery): Promise<WatchlistResponse> {
    let entries: StoredWatchlistEntry[] = [];
    let readFromDb = false;

    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserModel.findOne({ deviceToken }).lean<IUser>();
        entries = this.mergeUserEntries(user);
        readFromDb = true;
      } catch (err) {
        logger.error({ err, deviceToken }, "⚠️ Error querying watchlist from MongoDB");
      }
    }

    if (!readFromDb) {
      entries = Array.from(this.getMemoryUser(deviceToken).values());
    }

    if (query.media_type) {
      entries = entries.filter((entry) => entry.media_type === query.media_type);
    }

    const pageSize = 20;
    const page = Math.max(1, Number(query.page) || 1);
    const startIndex = (page - 1) * pageSize;
    const pagedEntries = entries.slice(startIndex, startIndex + pageSize);

    const itemPromises = pagedEntries.map(async (entry) => {
      try {
        const endpoint =
          entry.media_type === "tv" ? `/tv/${entry.media_id}` : `/movie/${entry.media_id}`;
        const details = await this.adapter.get<TMDBMovieDetails | TMDBTvDetails>(endpoint, {
          language: query.language || "en-US",
        });
        const sanitized = sanitizeResponse(details);
        return {
          ...sanitized,
          media_type: entry.media_type,
        } as WatchlistHydratedItem;
      } catch (err) {
        logger.warn({ err, entry }, "⚠️ Failed to hydrate watchlist item from TMDB");
        return null;
      }
    });

    const results = (await Promise.all(itemPromises)).filter(
      (item): item is WatchlistHydratedItem => item !== null
    );

    const totalResults =
      entries.length <= pageSize && page === 1 ? results.length : entries.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

    return {
      page,
      total_pages: totalPages,
      total_results: totalResults,
      results,
    };
  }
}

export const watchlistService = new WatchlistService();
