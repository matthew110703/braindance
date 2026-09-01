export type MovieSortBy =
  | "popularity.asc"
  | "popularity.desc"
  | "revenue.asc"
  | "revenue.desc"
  | "primary_release_date.asc"
  | "primary_release_date.desc"
  | "vote_average.asc"
  | "vote_average.desc"
  | "vote_count.asc"
  | "vote_count.desc"
  | "title.asc"
  | "title.desc"
  | "original_title.asc"
  | "original_title.desc";

export type TvSortBy =
  | "popularity.asc"
  | "popularity.desc"
  | "first_air_date.asc"
  | "first_air_date.desc"
  | "vote_average.asc"
  | "vote_average.desc"
  | "vote_count.asc"
  | "vote_count.desc"
  | "name.asc"
  | "name.desc"
  | "original_name.asc"
  | "original_name.desc";

export type WatchMonetizationType = "flatrate" | "free" | "ads" | "rent" | "buy";

export interface TMDBMovieItem {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  popularity: number;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  original_language: string;
}

export interface TMDBTvItem {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  popularity: number;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  original_language: string;
  origin_country: string[];
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
