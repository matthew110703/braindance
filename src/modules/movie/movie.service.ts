import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import {
  MovieListQuery,
  MovieDetailsQuery,
  MovieRecommendationsQuery,
} from "./movie.schema.js";
import {
  TMDBMovieListResponse,
  TMDBMovieDetails,
  TMDBMovieDetailsSanitized,
} from "./movie.types.js";
import { TMDBMovieItem, TMDBPaginatedResponse } from "../discover/discover.types.js";
import { streamingService } from "../streaming/streaming.service.js";

import { sanitizeResponse } from "../../utils/sanitize.util.js";

export class MovieService {
  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  /**
   * Get a list of movies that are currently in theatres
   */
  async getNowPlaying(params: MovieListQuery): Promise<TMDBMovieListResponse> {
    return this.adapter.get<TMDBMovieListResponse>(
      "/movie/now_playing",
      params as Record<string, unknown>
    );
  }

  /**
   * Get a list of movies ordered by popularity
   */
  async getPopular(params: MovieListQuery): Promise<TMDBMovieListResponse> {
    return this.adapter.get<TMDBMovieListResponse>(
      "/movie/popular",
      params as Record<string, unknown>
    );
  }

  /**
   * Get a list of movies ordered by rating
   */
  async getTopRated(params: MovieListQuery): Promise<TMDBMovieListResponse> {
    return this.adapter.get<TMDBMovieListResponse>(
      "/movie/top_rated",
      params as Record<string, unknown>
    );
  }

  /**
   * Get a list of upcoming movies in theatres
   */
  async getUpcoming(params: MovieListQuery): Promise<TMDBMovieListResponse> {
    return this.adapter.get<TMDBMovieListResponse>(
      "/movie/upcoming",
      params as Record<string, unknown>
    );
  }

  /**
   * Get top level details of a movie by ID (with credits included and production metadata omitted)
   */
  async getMovieDetails(
    id: number,
    query: MovieDetailsQuery
  ): Promise<TMDBMovieDetailsSanitized> {
    const appendList = query.append_to_response
      ? Array.from(
          new Set([
            ...query.append_to_response
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            "credits",
          ])
        ).join(",")
      : "credits";

    const [data, servers] = await Promise.all([
      this.adapter.get<TMDBMovieDetails>(`/movie/${id}`, {
        ...query,
        append_to_response: appendList,
      } as Record<string, unknown>),
      streamingService.getAvailableServersForMedia({
        type: "movie",
        tmdbId: id,
      }),
    ]);

    const sanitized = sanitizeResponse(data) as unknown as TMDBMovieDetailsSanitized;
    sanitized.servers = servers;

    return sanitized;
  }

  /**
   * Get recommended movies based on a movie ID
   */
  async getMovieRecommendations(
    id: number,
    query: MovieRecommendationsQuery
  ): Promise<TMDBPaginatedResponse<TMDBMovieItem>> {
    return this.adapter.get<TMDBPaginatedResponse<TMDBMovieItem>>(
      `/movie/${id}/recommendations`,
      query as Record<string, unknown>
    );
  }
}

export const movieService = new MovieService();
