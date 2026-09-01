import { TMDBMovieDetails } from "../movie/movie.types.js";

export interface WatchlistActionResponse {
  success: boolean;
  message: string;
  media_id: number;
  count: number;
}

export interface WatchlistCheckResponse {
  media_id: number;
  item_present: boolean;
}

export interface WatchlistResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: (TMDBMovieDetails & { media_type?: string })[];
}
