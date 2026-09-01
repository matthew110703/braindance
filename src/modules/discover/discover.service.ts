import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import { DiscoverMovieQueryInput, DiscoverTvQueryInput } from "./discover.schema.js";
import { TMDBPaginatedResponse, TMDBMovieItem, TMDBTvItem } from "./discover.types.js";

export class DiscoverService {
  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  /**
   * Discover movies using flexible filter and sorting criteria from TMDB
   */
  async discoverMovies(
    params: DiscoverMovieQueryInput
  ): Promise<TMDBPaginatedResponse<TMDBMovieItem>> {
    return this.adapter.get<TMDBPaginatedResponse<TMDBMovieItem>>(
      "/discover/movie",
      params as Record<string, unknown>
    );
  }

  /**
   * Discover TV shows using flexible filter and sorting criteria from TMDB
   */
  async discoverTvShows(
    params: DiscoverTvQueryInput
  ): Promise<TMDBPaginatedResponse<TMDBTvItem>> {
    return this.adapter.get<TMDBPaginatedResponse<TMDBTvItem>>(
      "/discover/tv",
      params as Record<string, unknown>
    );
  }
}

export const discoverService = new DiscoverService();
