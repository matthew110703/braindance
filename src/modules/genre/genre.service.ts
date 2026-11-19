import mongoose from "mongoose";
import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import { GenreModel, IGenreDoc } from "../../models/genre.model.js";
import { isCacheValid } from "../../utils/cache.util.js";
import { sanitizeResponse } from "../../utils/sanitize.util.js";
import { logger } from "../../config/logger.config.js";
import {
  TMDBGenreItem,
  TMDBGenreListResponse,
  AllGenresResponse,
} from "./genre.types.js";
import { GenreQuery } from "./genre.schema.js";

const MAX_GENRE_CACHE_SIZE = 50;

export class GenreService {
  private memoryCache: Map<string, { genres: TMDBGenreItem[]; lastFetchedAt: Date }> = new Map();

  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  private setMemoryCache(key: string, genres: TMDBGenreItem[], lastFetchedAt: Date): void {
    if (!this.memoryCache.has(key) && this.memoryCache.size >= MAX_GENRE_CACHE_SIZE) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.memoryCache.delete(oldestKey);
      }
    }
    this.memoryCache.set(key, { genres, lastFetchedAt });
  }

  /**
   * Internal helper to fetch from TMDB, update MongoDB cache, and update in-memory cache
   */
  private async fetchAndCache(
    type: "movie" | "tv",
    language: string
  ): Promise<TMDBGenreItem[]> {
    logger.debug({ type, language }, "📡 Cache miss / expired: Fetching genres from TMDB");
    const tmdbResponse = await this.adapter.get<TMDBGenreListResponse>(
      `/genre/${type}/list`,
      { language }
    );

    const sanitized = sanitizeResponse(tmdbResponse);
    const genres = sanitized.genres || [];
    const now = new Date();

    // Update bounded in-memory fallback cache
    this.setMemoryCache(`${type}_${language}`, genres, now);

    // Update MongoDB cache
    if (mongoose.connection.readyState === 1) {
      try {
        await GenreModel.findOneAndUpdate(
          { type, language },
          { genres, lastFetchedAt: now },
          { upsert: true, returnDocument: "after" }
        );
        logger.info({ type, language, count: genres.length }, "💾 Saved genres to MongoDB Atlas");
      } catch (err) {
        logger.error({ err, type, language }, "⚠️ Error saving genres to MongoDB");
      }
    }

    return genres;
  }

  /**
   * Get official genres for movies (served from MongoDB cache if fresh)
   */
  async getMovieGenres(params: GenreQuery): Promise<TMDBGenreListResponse> {
    const language = params.language || "en";
    const cacheKey = `movie_${language}`;

    // 1. Check MongoDB cache
    if (mongoose.connection.readyState === 1) {
      try {
        const cachedDoc = await GenreModel.findOne({
          type: "movie",
          language,
        }).lean<IGenreDoc>();

        if (cachedDoc && cachedDoc.genres && isCacheValid(cachedDoc.lastFetchedAt)) {
          logger.debug({ language, count: cachedDoc.genres.length }, "⚡ Cache HIT: Serving movie genres from MongoDB Atlas");
          return { genres: cachedDoc.genres };
        }
      } catch (err) {
        logger.error({ err }, "⚠️ Failed to read movie genres from MongoDB");
      }
    }

    // 2. Check in-memory fallback
    const mem = this.memoryCache.get(cacheKey);
    if (mem && isCacheValid(mem.lastFetchedAt)) {
      logger.debug({ language }, "⚡ Cache HIT: Serving movie genres from memory fallback");
      return { genres: mem.genres };
    }

    // 3. Fetch fresh from TMDB and persist
    const freshGenres = await this.fetchAndCache("movie", language);
    return { genres: freshGenres };
  }

  /**
   * Get official genres for TV series (served from MongoDB cache if fresh)
   */
  async getTvGenres(params: GenreQuery): Promise<TMDBGenreListResponse> {
    const language = params.language || "en";
    const cacheKey = `tv_${language}`;

    // 1. Check MongoDB cache
    if (mongoose.connection.readyState === 1) {
      try {
        const cachedDoc = await GenreModel.findOne({
          type: "tv",
          language,
        }).lean<IGenreDoc>();

        if (cachedDoc && cachedDoc.genres && isCacheValid(cachedDoc.lastFetchedAt)) {
          logger.debug({ language, count: cachedDoc.genres.length }, "⚡ Cache HIT: Serving TV genres from MongoDB Atlas");
          return { genres: cachedDoc.genres };
        }
      } catch (err) {
        logger.error({ err }, "⚠️ Failed to read TV genres from MongoDB");
      }
    }

    // 2. Check in-memory fallback
    const mem = this.memoryCache.get(cacheKey);
    if (mem && isCacheValid(mem.lastFetchedAt)) {
      logger.debug({ language }, "⚡ Cache HIT: Serving TV genres from memory fallback");
      return { genres: mem.genres };
    }

    // 3. Fetch fresh from TMDB and persist
    const freshGenres = await this.fetchAndCache("tv", language);
    return { genres: freshGenres };
  }

  /**
   * Get all official genres for both Movies and TV series
   */
  async getAllGenres(params: GenreQuery): Promise<AllGenresResponse> {
    const [movieData, tvData] = await Promise.all([
      this.getMovieGenres(params),
      this.getTvGenres(params),
    ]);

    return {
      movie: movieData.genres,
      tv: tvData.genres,
    };
  }
}

export const genreService = new GenreService();
