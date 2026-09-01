import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import { TvListQuery } from "./tv.schema.js";
import { TMDBTvListResponse } from "./tv.types.js";

export class TvService {
  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  /**
   * Get a list of TV shows airing today
   */
  async getAiringToday(params: TvListQuery): Promise<TMDBTvListResponse> {
    return this.adapter.get<TMDBTvListResponse>(
      "/tv/airing_today",
      params as Record<string, unknown>
    );
  }

  /**
   * Get a list of TV shows that air in the next 7 days
   */
  async getOnTheAir(params: TvListQuery): Promise<TMDBTvListResponse> {
    return this.adapter.get<TMDBTvListResponse>(
      "/tv/on_the_air",
      params as Record<string, unknown>
    );
  }

  /**
   * Get a list of TV shows ordered by popularity
   */
  async getPopular(params: TvListQuery): Promise<TMDBTvListResponse> {
    return this.adapter.get<TMDBTvListResponse>(
      "/tv/popular",
      params as Record<string, unknown>
    );
  }

  /**
   * Get a list of TV shows ordered by rating
   */
  async getTopRated(params: TvListQuery): Promise<TMDBTvListResponse> {
    return this.adapter.get<TMDBTvListResponse>(
      "/tv/top_rated",
      params as Record<string, unknown>
    );
  }
}

export const tvService = new TvService();
