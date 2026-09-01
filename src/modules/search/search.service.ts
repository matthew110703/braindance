import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import {
  SearchMultiQuery,
  SearchMovieQuery,
  SearchTvQuery,
  SearchKeywordQuery,
} from "./search.schema.js";
import {
  TMDBSearchMultiResponse,
  TMDBSearchMovieResponse,
  TMDBSearchTvResponse,
  TMDBSearchKeywordResponse,
} from "./search.types.js";

export class SearchService {
  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  /**
   * Search for movies, TV shows, and people in a single request
   */
  async searchMulti(query: SearchMultiQuery): Promise<TMDBSearchMultiResponse> {
    return this.adapter.get<TMDBSearchMultiResponse>(
      "/search/multi",
      query as Record<string, unknown>
    );
  }

  /**
   * Search for movies by title
   */
  async searchMovies(query: SearchMovieQuery): Promise<TMDBSearchMovieResponse> {
    return this.adapter.get<TMDBSearchMovieResponse>(
      "/search/movie",
      query as Record<string, unknown>
    );
  }

  /**
   * Search for TV shows by name
   */
  async searchTv(query: SearchTvQuery): Promise<TMDBSearchTvResponse> {
    return this.adapter.get<TMDBSearchTvResponse>(
      "/search/tv",
      query as Record<string, unknown>
    );
  }

  /**
   * Search for keywords by name
   */
  async searchKeywords(query: SearchKeywordQuery): Promise<TMDBSearchKeywordResponse> {
    return this.adapter.get<TMDBSearchKeywordResponse>(
      "/search/keyword",
      query as Record<string, unknown>
    );
  }
}

export const searchService = new SearchService();

