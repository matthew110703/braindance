import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import { MovieListQuery } from "./movie.schema.js";
import { TMDBMovieListResponse } from "./movie.types.js";

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
   * Get a list of movies that are being released soon
   */
  async getUpcoming(params: MovieListQuery): Promise<TMDBMovieListResponse> {
    return this.adapter.get<TMDBMovieListResponse>(
      "/movie/upcoming",
      params as Record<string, unknown>
    );
  }
}

export const movieService = new MovieService();
