import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import { TrendingRequestQuery } from "./trending.schema.js";
import {
  TimeWindow,
  TMDBTrendingAllResponse,
  TMDBTrendingMovieResponse,
  TMDBTrendingTvResponse,
} from "./trending.types.js";

export class TrendingService {
  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  /**
   * Get trending movies, TV shows, and people by time window (day or week)
   */
  async getTrendingAll(
    timeWindow: TimeWindow = "day",
    query: TrendingRequestQuery
  ): Promise<TMDBTrendingAllResponse> {
    return this.adapter.get<TMDBTrendingAllResponse>(
      `/trending/all/${timeWindow}`,
      query as Record<string, unknown>
    );
  }

  /**
   * Get trending movies by time window (day or week)
   */
  async getTrendingMovies(
    timeWindow: TimeWindow = "day",
    query: TrendingRequestQuery
  ): Promise<TMDBTrendingMovieResponse> {
    return this.adapter.get<TMDBTrendingMovieResponse>(
      `/trending/movie/${timeWindow}`,
      query as Record<string, unknown>
    );
  }

  /**
   * Get trending TV shows by time window (day or week)
   */
  async getTrendingTv(
    timeWindow: TimeWindow = "day",
    query: TrendingRequestQuery
  ): Promise<TMDBTrendingTvResponse> {
    return this.adapter.get<TMDBTrendingTvResponse>(
      `/trending/tv/${timeWindow}`,
      query as Record<string, unknown>
    );
  }
}

export const trendingService = new TrendingService();
