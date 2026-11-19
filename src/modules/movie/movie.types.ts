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

import { AvailableServerPayload } from "../streaming/streaming.types.js";

export interface Genre {
  id: number;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface MovieCollection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface CastMember {
  id: number;
  name: string;
  original_name: string;
  character: string;
  credit_id: string;
  order: number;
  cast_id?: number;
  popularity: number;
  profile_path: string | null;
  gender: number | null;
  known_for_department: string;
  adult: boolean;
}

export interface CrewMember {
  id: number;
  name: string;
  original_name: string;
  department: string;
  job: string;
  credit_id: string;
  popularity: number;
  profile_path: string | null;
  gender: number | null;
  known_for_department: string;
  adult: boolean;
}

export interface TMDBCreditsResponse {
  id?: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  tagline: string | null;
  genres: Genre[];
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  budget: number;
  revenue: number;
  status: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  video: boolean;
  homepage: string | null;
  imdb_id: string | null;
  original_language: string;
  origin_country: string[];
  spoken_languages: SpokenLanguage[];
  belongs_to_collection: MovieCollection | null;
  credits?: TMDBCreditsResponse;
  servers?: AvailableServerPayload[];
  [key: string]: unknown;
}

export type TMDBMovieDetailsSanitized = Omit<
  TMDBMovieDetails,
  "production_companies" | "production_countries"
>;
