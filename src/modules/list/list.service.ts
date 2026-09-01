import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import { sanitizeResponse } from "../../utils/sanitize.util.js";
import {
  CreateListBodyInput,
  ListMediaItemBodyInput,
  TMDBListCreateResponse,
  TMDBListActionResponse,
  TMDBListItemStatusResponse,
  TMDBListDetailsResponse,
} from "./list.types.js";

export class ListService {
  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  /**
   * Create a new custom list on TMDB
   */
  async createList(
    body: CreateListBodyInput,
    sessionId: string
  ): Promise<TMDBListCreateResponse> {
    return this.adapter.post<TMDBListCreateResponse>(
      "/list",
      body,
      { params: { session_id: sessionId } }
    );
  }

  /**
   * Get the details and items of a list
   */
  async getListDetails(
    listId: number,
    query: { page?: number; language?: string }
  ): Promise<TMDBListDetailsResponse> {
    const data = await this.adapter.get<TMDBListDetailsResponse>(
      `/list/${listId}`,
      query as Record<string, unknown>
    );
    return sanitizeResponse(data);
  }

  /**
   * Check if a movie is present in the list
   */
  async checkItemStatus(
    listId: number,
    query: { movie_id: number; language?: string }
  ): Promise<TMDBListItemStatusResponse> {
    return this.adapter.get<TMDBListItemStatusResponse>(
      `/list/${listId}/item_status`,
      query as Record<string, unknown>
    );
  }

  /**
   * Add a movie to a list
   */
  async addMovie(
    listId: number,
    body: ListMediaItemBodyInput,
    sessionId: string
  ): Promise<TMDBListActionResponse> {
    return this.adapter.post<TMDBListActionResponse>(
      `/list/${listId}/add_item`,
      body,
      { params: { session_id: sessionId } }
    );
  }

  /**
   * Remove a movie from a list
   */
  async removeMovie(
    listId: number,
    body: ListMediaItemBodyInput,
    sessionId: string
  ): Promise<TMDBListActionResponse> {
    return this.adapter.post<TMDBListActionResponse>(
      `/list/${listId}/remove_item`,
      body,
      { params: { session_id: sessionId } }
    );
  }
}

export const listService = new ListService();
