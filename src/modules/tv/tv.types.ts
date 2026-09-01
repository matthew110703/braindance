import { TMDBTvItem, TMDBPaginatedResponse } from "../discover/discover.types.js";

export type TMDBTvListResponse = TMDBPaginatedResponse<TMDBTvItem>;

export interface TvListQueryInput {
  language?: string;
  page?: number;
  timezone?: string;
}
