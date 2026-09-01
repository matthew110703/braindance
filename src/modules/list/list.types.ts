import { TMDBMovieItem } from "../discover/discover.types.js";

export interface TMDBListCreateResponse {
  status_message: string;
  success: boolean;
  status_code: number;
  list_id: number;
}

export interface TMDBListActionResponse {
  status_code: number;
  status_message: string;
  success?: boolean;
}

export interface TMDBListItemStatusResponse {
  id: string | number;
  item_present: boolean;
}

export interface TMDBListDetailsResponse {
  created_by: string;
  description: string;
  favorite_count: number;
  id: string | number;
  items: (TMDBMovieItem & { media_type?: string })[];
  item_count: number;
  iso_639_1: string;
  name: string;
  poster_path: string | null;
}

export interface CreateListBodyInput {
  name: string;
  description: string;
  language?: string;
}

export interface ListMediaItemBodyInput {
  media_id: number;
}
