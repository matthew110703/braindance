import { TMDBMovieDetails } from "../movie/movie.types.js";
import { TMDBTvDetails } from "../tv/tv.types.js";

export interface WatchlistActionResponse {
  success: boolean;
  message: string;
  media_id: number;
  media_type?: "movie" | "tv";
  count: number;
}

export interface WatchlistCheckResponse {
  media_id: number;
  media_type?: "movie" | "tv";
  item_present: boolean;
}

export type WatchlistHydratedItem = (TMDBMovieDetails | TMDBTvDetails) & {
  media_type: "movie" | "tv";
};

export interface WatchlistResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: WatchlistHydratedItem[];
}
