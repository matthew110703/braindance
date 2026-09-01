import { TMDBMovieItem, TMDBPaginatedResponse } from "../discover/discover.types.js";

export interface MovieDateRange {
  maximum: string;
  minimum: string;
}

export interface TMDBMovieListResponse<T = TMDBMovieItem> extends TMDBPaginatedResponse<T> {
  dates?: MovieDateRange;
}

export interface MovieListQueryInput {
  language?: string;
  page?: number;
  region?: string;
}
