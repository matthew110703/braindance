import mongoose from "mongoose";
import { UserModel, IUser } from "../../models/user.model.js";
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
import { UpdateHistoryInput, GetHistoryListQuery } from "./history.schema.js";

export class HistoryService {
  private memoryStore: Map<string, HistoryItem[]> = new Map();

  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  private getMemoryHistory(deviceToken: string): HistoryItem[] {
    if (!this.memoryStore.has(deviceToken)) {
      this.memoryStore.set(deviceToken, []);
    }
    return this.memoryStore.get(deviceToken)!;
  }

  /**
   * Update or insert watch history progress with flat media metadata
   */
  async updateProgress(
    deviceToken: string,
    mediaId: number,
    input: UpdateHistoryInput
  ): Promise<HistoryActionResponse> {
    const progress: IPlaybackProgress = {
      event: input.event,
      currentTime: input.currentTime,
      duration: input.duration,
      progress: input.progress,
      season: input.season ?? null,
      episode: input.episode ?? null,
      timestamp: input.timestamp || Date.now(),
    };

    let resultItem: HistoryItem | null = null;
    const now = new Date();

    if (mongoose.connection.readyState === 1) {
      try {
        let user = await UserModel.findOne({ deviceToken });
        if (!user) {
          user = await UserModel.create({
            deviceToken,
            watchlist: [],
            history: [],
          });
        }

        // Find existing history item
        const existingIndex = user.history.findIndex(
          (item: any) => Number(item.id) === mediaId
        );

        if (existingIndex !== -1) {
          // Existing item: Update progress & timestamp without redundant TMDB call
          const rawDoc = (user.history[existingIndex] as any).toObject
            ? (user.history[existingIndex] as any).toObject()
            : user.history[existingIndex];

          const updatedItem: HistoryItem = {
            ...rawDoc,
            id: mediaId,
            media_type: input.mediaType || rawDoc.media_type || "movie",
            progress,
            updatedAt: now,
          };

          // Remove and prepend to top (MRU order)
          user.history.splice(existingIndex, 1);
          user.history.unshift(updatedItem as any);
          user.markModified("history");
          await user.save();

          resultItem = updatedItem;
          logger.debug({ deviceToken, mediaId, event: input.event }, "⚡ Updated watch progress in MongoDB");
        } else {
          // New item: Fetch TMDB details and store flat
          const mediaType = input.mediaType || "movie";
          const endpoint = mediaType === "tv" ? `/tv/${mediaId}` : `/movie/${mediaId}`;

          logger.debug({ mediaId, mediaType }, "📡 Fetching media metadata from TMDB for history entry");
          let mediaDetails: Record<string, any> = {};
          try {
            const fetched = await this.adapter.get<Record<string, any>>(endpoint, {
              language: "en-US",
            });
            mediaDetails = sanitizeResponse(fetched);
          } catch (fetchErr) {
            logger.warn({ fetchErr, mediaId }, "⚠️ Could not fetch full TMDB details, saving minimal history record");
          }

          const newItem: HistoryItem = {
            ...mediaDetails,
            id: mediaId,
            media_type: mediaType,
            progress,
            updatedAt: now,
          };

          user.history.unshift(newItem as any);
          user.markModified("history");
          await user.save();

          resultItem = newItem;
          logger.info({ deviceToken, mediaId, mediaType }, "💾 Created new watch history item in MongoDB");
        }
      } catch (err) {
        logger.error({ err, deviceToken, mediaId }, "⚠️ Error saving watch progress to MongoDB");
      }
    }

    // Update in-memory fallback
    const memList = this.getMemoryHistory(deviceToken);
    const memIdx = memList.findIndex((item) => Number(item.id) === mediaId);
    if (!resultItem) {
      resultItem = {
        id: mediaId,
        media_type: input.mediaType || "movie",
        progress,
        updatedAt: now,
      };
    }

    if (memIdx !== -1) {
      memList.splice(memIdx, 1);
    }
    memList.unshift(resultItem);

    return {
      success: true,
      message: "Watch progress updated successfully",
      media_id: mediaId,
      data: resultItem,
    };
  }

  /**
   * Get watch progress and media details for a specific media item
   */
  async getProgress(
    deviceToken: string,
    mediaId: number
  ): Promise<HistoryStatusResponse> {
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserModel.findOne({ deviceToken }).lean<IUser>();
        if (user && user.history) {
          const item = user.history.find(
            (h: any) => Number(h.id) === mediaId
          );
          if (item) {
            return {
              media_id: mediaId,
              item_present: true,
              data: item as HistoryItem,
            };
          }
        }
      } catch (err) {
        logger.error({ err, deviceToken, mediaId }, "⚠️ Error querying item progress from MongoDB");
      }
    }

    // Check in-memory fallback
    const memList = this.getMemoryHistory(deviceToken);
    const memItem = memList.find((h) => Number(h.id) === mediaId);
    if (memItem) {
      return {
        media_id: mediaId,
        item_present: true,
        data: memItem,
      };
    }

    return {
      media_id: mediaId,
      item_present: false,
      data: null,
    };
  }

  /**
   * Get paginated watch history for a device, sorted by most recently watched
   */
  async getHistory(
    deviceToken: string,
    query: GetHistoryListQuery
  ): Promise<HistoryListResponse> {
    let historyItems: HistoryItem[] = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserModel.findOne({ deviceToken }).lean<IUser>();
        if (user && user.history) {
          historyItems = user.history as HistoryItem[];
        }
      } catch (err) {
        logger.error({ err, deviceToken }, "⚠️ Error querying watch history from MongoDB");
      }
    }

    if (historyItems.length === 0) {
      historyItems = this.getMemoryHistory(deviceToken);
    }

    // Optional filter by mediaType
    if (query.mediaType) {
      historyItems = historyItems.filter(
        (item) => item.media_type === query.mediaType
      );
    }

    const totalResults = historyItems.length;
    const pageSize = query.limit || 20;
    const totalPages = Math.ceil(totalResults / pageSize) || 1;
    const page = query.page || 1;

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
   * Remove a single item from watch history
   */
  async removeFromHistory(
    deviceToken: string,
    mediaId: number
  ): Promise<HistoryActionResponse> {
    if (mongoose.connection.readyState === 1) {
      try {
        await UserModel.updateOne(
          { deviceToken },
          { $pull: { history: { id: mediaId } } }
        );
        logger.info({ deviceToken, mediaId }, "🗑️ Removed item from watch history in MongoDB");
      } catch (err) {
        logger.error({ err, deviceToken, mediaId }, "⚠️ Error removing item from history in MongoDB");
      }
    }

    // In-memory removal
    const memList = this.getMemoryHistory(deviceToken);
    const idx = memList.findIndex((item) => Number(item.id) === mediaId);
    if (idx !== -1) {
      memList.splice(idx, 1);
    }

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
