import mongoose from "mongoose";
import { UserModel, IUser } from "../../models/user.model.js";
import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import { TMDBMovieDetails } from "../movie/movie.types.js";
import { sanitizeResponse } from "../../utils/sanitize.util.js";
import {
  WatchlistActionResponse,
  WatchlistCheckResponse,
  WatchlistResponse,
} from "./watchlist.types.js";
import { GetWatchlistQuery } from "./watchlist.schema.js";

export class WatchlistService {
  private memoryStore: Map<string, { watchlist: Set<number>; history: Set<number> }> = new Map();

  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  private getMemoryUser(deviceToken: string): { watchlist: Set<number>; history: Set<number> } {
    if (!this.memoryStore.has(deviceToken)) {
      this.memoryStore.set(deviceToken, {
        watchlist: new Set<number>(),
        history: new Set<number>(),
      });
    }
    return this.memoryStore.get(deviceToken)!;
  }

  /**
   * Add a movie ID to the user's watchlist
   */
  async addToWatchlist(deviceToken: string, mediaId: number): Promise<WatchlistActionResponse> {
    const mem = this.getMemoryUser(deviceToken);
    mem.watchlist.add(mediaId);

    let count = mem.watchlist.size;

    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserModel.findOneAndUpdate(
          { deviceToken },
          { $addToSet: { watchlist: mediaId } },
          { upsert: true, new: true }
        );
        if (user) {
          count = user.watchlist.length;
        }
      } catch (err) {
        // Fallback to memory count
      }
    }

    return {
      success: true,
      message: "Media item added to watchlist successfully",
      media_id: mediaId,
      count,
    };
  }

  /**
   * Remove a movie ID from the user's watchlist
   */
  async removeFromWatchlist(deviceToken: string, mediaId: number): Promise<WatchlistActionResponse> {
    const mem = this.getMemoryUser(deviceToken);
    mem.watchlist.delete(mediaId);

    let count = mem.watchlist.size;

    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserModel.findOneAndUpdate(
          { deviceToken },
          { $pull: { watchlist: mediaId } },
          { new: true }
        );
        if (user) {
          count = user.watchlist.length;
        }
      } catch (err) {
        // Fallback to memory count
      }
    }

    return {
      success: true,
      message: "Media item removed from watchlist successfully",
      media_id: mediaId,
      count,
    };
  }

  /**
   * Check if a movie is present in the user's watchlist
   */
  async checkStatus(deviceToken: string, mediaId: number): Promise<WatchlistCheckResponse> {
    const mem = this.getMemoryUser(deviceToken);
    let isPresent = mem.watchlist.has(mediaId);

    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserModel.findOne({
          deviceToken,
          watchlist: mediaId,
        });
        if (user) {
          isPresent = true;
        }
      } catch (err) {
        // Use memory value
      }
    }

    return {
      media_id: mediaId,
      item_present: isPresent,
    };
  }

  /**
   * Get all watchlist items with full TMDB details hydrated and sanitized
   */
  async getWatchlist(deviceToken: string, query: GetWatchlistQuery): Promise<WatchlistResponse> {
    let movieIds: number[] = Array.from(this.getMemoryUser(deviceToken).watchlist);

    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserModel.findOne({ deviceToken }).lean<IUser>();
        if (user && user.watchlist) {
          // Merge IDs
          movieIds = Array.from(new Set([...user.watchlist, ...movieIds]));
        }
      } catch (err) {
        // Fallback to memory
      }
    }

    const totalResults = movieIds.length;
    const pageSize = 20;
    const totalPages = Math.ceil(totalResults / pageSize) || 1;
    const page = query.page || 1;

    const startIndex = (page - 1) * pageSize;
    const pagedIds = movieIds.slice(startIndex, startIndex + pageSize);

    // Fetch movie details concurrently from TMDB
    const moviePromises = pagedIds.map(async (id) => {
      try {
        const movie = await this.adapter.get<TMDBMovieDetails>(`/movie/${id}`, {
          language: query.language || "en-US",
        });
        const sanitizedMovie = sanitizeResponse(movie);
        return {
          ...sanitizedMovie,
          media_type: "movie",
        };
      } catch {
        return null;
      }
    });

    const results = (await Promise.all(moviePromises)).filter(
      (m): m is TMDBMovieDetails & { media_type: string } => m !== null
    );

    return {
      page,
      total_pages: totalPages,
      total_results: totalResults,
      results,
    };
  }
}

export const watchlistService = new WatchlistService();
