import { TMDBTvItem, TMDBPaginatedResponse } from "../discover/discover.types.js";
import {
  Genre,
  SpokenLanguage,
  CastMember,
  CrewMember,
} from "../movie/movie.types.js";
import { AvailableServerPayload } from "../streaming/streaming.types.js";

export type TMDBTvListResponse = TMDBPaginatedResponse<TMDBTvItem>;

export interface TvListQueryInput {
  language?: string;
  page?: number;
  timezone?: string;
}

export interface TvCreatedBy {
  id: number;
  credit_id: string;
  name: string;
  gender: number | null;
  profile_path: string | null;
}

export interface TvEpisode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  production_code: string;
  runtime: number | null;
  season_number: number;
  show_id: number;
  still_path: string | null;
}

export interface TvNetwork {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TvSeason {
  air_date: string | null;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TMDBTvCreditsResponse {
  id?: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface TMDBTvDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  tagline: string | null;
  type: string;
  status: string;
  genres: Genre[];
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  in_production: boolean;
  languages: string[];
  episode_run_time: number[];
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: TvSeason[];
  created_by: TvCreatedBy[];
  networks: TvNetwork[];
  spoken_languages: SpokenLanguage[];
  last_episode_to_air: TvEpisode | null;
  next_episode_to_air: TvEpisode | null;
  homepage: string | null;
  original_language: string;
  origin_country: string[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  credits?: TMDBTvCreditsResponse;
  servers?: AvailableServerPayload[];
  [key: string]: unknown;
}

export type TMDBTvDetailsSanitized = Omit<
  TMDBTvDetails,
  "production_companies" | "production_countries"
>;

export interface TMDBTvSeasonEpisode {
  air_date: string | null;
  episode_number: number;
  episode_type?: string;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number | null;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew: CrewMember[];
  guest_stars: CastMember[];
  [key: string]: unknown;
}

export interface TMDBTvSeasonDetails {
  _id: string;
  air_date: string | null;
  episodes: TMDBTvSeasonEpisode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
  networks?: TvNetwork[];
  [key: string]: unknown;
}

export interface TMDBTvEpisodeDetails {
  air_date: string | null;
  crew: CrewMember[];
  episode_number: number;
  episode_type?: string;
  guest_stars: CastMember[];
  name: string;
  overview: string;
  id: number;
  production_code: string;
  runtime: number | null;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  servers?: AvailableServerPayload[];
  [key: string]: unknown;
}

