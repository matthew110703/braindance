import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import {
  TvListQuery,
  TvDetailsQuery,
  TvRecommendationsQuery,
} from "./tv.schema.js";
import {
  TMDBTvListResponse,
  TMDBTvDetails,
  TMDBTvDetailsSanitized,
  TMDBTvSeasonDetails,
  TMDBTvEpisodeDetails,
} from "./tv.types.js";
import { TMDBTvItem, TMDBPaginatedResponse } from "../discover/discover.types.js";

import { sanitizeResponse } from "../../utils/sanitize.util.js";

export class TvService {
  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  /**
   * Get a list of TV shows airing today
   */
  async getAiringToday(params: TvListQuery): Promise<TMDBTvListResponse> {
    return this.adapter.get<TMDBTvListResponse>(
      "/tv/airing_today",
      params as Record<string, unknown>
    );
  }

  /**
   * Get a list of TV shows that air in the next 7 days
   */
  async getOnTheAir(params: TvListQuery): Promise<TMDBTvListResponse> {
    return this.adapter.get<TMDBTvListResponse>(
      "/tv/on_the_air",
      params as Record<string, unknown>
    );
  }

  /**
   * Get a list of TV shows ordered by popularity
   */
  async getPopular(params: TvListQuery): Promise<TMDBTvListResponse> {
    return this.adapter.get<TMDBTvListResponse>(
      "/tv/popular",
      params as Record<string, unknown>
    );
  }

  /**
   * Get a list of TV shows ordered by rating
   */
  async getTopRated(params: TvListQuery): Promise<TMDBTvListResponse> {
    return this.adapter.get<TMDBTvListResponse>(
      "/tv/top_rated",
      params as Record<string, unknown>
    );
  }

  /**
   * Get top level details of a TV show by ID (with credits included and production metadata omitted)
   */
  async getTvDetails(
    id: number,
    query: TvDetailsQuery
  ): Promise<TMDBTvDetailsSanitized> {
    const appendList = query.append_to_response
      ? Array.from(
          new Set([...query.append_to_response.split(",").map((s) => s.trim()), "credits"])
        ).join(",")
      : "credits";

    const data = await this.adapter.get<TMDBTvDetails>(
      `/tv/${id}`,
      { ...query, append_to_response: appendList } as Record<string, unknown>
    );

    return sanitizeResponse(data) as unknown as TMDBTvDetailsSanitized;
  }

  /**
   * Get recommended TV shows based on a TV show ID
   */
  async getTvRecommendations(
    id: number,
    query: TvRecommendationsQuery
  ): Promise<TMDBPaginatedResponse<TMDBTvItem>> {
    return this.adapter.get<TMDBPaginatedResponse<TMDBTvItem>>(
      `/tv/${id}/recommendations`,
      query as Record<string, unknown>
    );
  }

  /**
   * Get details of a TV season by series ID and season number
   */
  async getTvSeasonDetails(
    seriesId: number,
    seasonNumber: number,
    query: TvDetailsQuery
  ): Promise<TMDBTvSeasonDetails> {
    return this.adapter.get<TMDBTvSeasonDetails>(
      `/tv/${seriesId}/season/${seasonNumber}`,
      query as Record<string, unknown>
    );
  }

  /**
   * Get details of a TV episode by series ID, season number, and episode number
   */
  async getTvEpisodeDetails(
    seriesId: number,
    seasonNumber: number,
    episodeNumber: number,
    query: TvDetailsQuery
  ): Promise<TMDBTvEpisodeDetails> {
    return this.adapter.get<TMDBTvEpisodeDetails>(
      `/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`,
      query as Record<string, unknown>
    );
  }
}

export const tvService = new TvService();

