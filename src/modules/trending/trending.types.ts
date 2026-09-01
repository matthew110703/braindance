import {
  TMDBMovieItem,
  TMDBTvItem,
  TMDBPaginatedResponse,
} from "../discover/discover.types.js";

export type TimeWindow = "day" | "week";

export interface TMDBTrendingPersonItem {
  id: number;
  name: string;
  original_name: string;
  media_type: "person";
  adult: boolean;
  popularity: number;
  gender: number | null;
  known_for_department: string;
  profile_path: string | null;
  known_for: Array<TMDBMovieItem | TMDBTvItem>;
}

export type TMDBTrendingAllItem =
  | (TMDBMovieItem & { media_type: "movie" })
  | (TMDBTvItem & { media_type: "tv" })
  | TMDBTrendingPersonItem;

export type TMDBTrendingAllResponse = TMDBPaginatedResponse<TMDBTrendingAllItem>;
export type TMDBTrendingMovieResponse = TMDBPaginatedResponse<TMDBMovieItem & { media_type: "movie" }>;
export type TMDBTrendingTvResponse = TMDBPaginatedResponse<TMDBTvItem & { media_type: "tv" }>;

export interface TrendingQueryInput {
  language?: string;
  page?: number;
}
