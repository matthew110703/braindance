import {
  TMDBMovieItem,
  TMDBTvItem,
  TMDBPaginatedResponse,
} from "../discover/discover.types.js";
import { TMDBTrendingPersonItem } from "../trending/trending.types.js";

export type TMDBSearchMultiItem =
  | (TMDBMovieItem & { media_type: "movie" })
  | (TMDBTvItem & { media_type: "tv" })
  | TMDBTrendingPersonItem;

export type TMDBSearchMultiResponse = TMDBPaginatedResponse<TMDBSearchMultiItem>;
export type TMDBSearchMovieResponse = TMDBPaginatedResponse<TMDBMovieItem>;
export type TMDBSearchTvResponse = TMDBPaginatedResponse<TMDBTvItem>;

export interface SearchMultiQueryInput {
  query: string;
  page?: number;
  language?: string;
  include_adult?: boolean;
}

export interface SearchMovieQueryInput {
  query: string;
  page?: number;
  language?: string;
  include_adult?: boolean;
  primary_release_year?: string;
  year?: string;
  region?: string;
}

export interface SearchTvQueryInput {
  query: string;
  page?: number;
  language?: string;
  include_adult?: boolean;
  first_air_date_year?: string;
  year?: string;
}

export interface TMDBKeywordItem {
  id: number;
  name: string;
}

export type TMDBSearchKeywordResponse = TMDBPaginatedResponse<TMDBKeywordItem>;

export interface SearchKeywordQueryInput {
  query: string;
  page?: number;
}

