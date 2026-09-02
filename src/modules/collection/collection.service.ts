import { tmdbAdapter, TMDBAdapter } from "../../adapters/tmdb.adapter.js";
import { sanitizeResponse } from "../../utils/sanitize.util.js";
import { TMDBCollectionDetails } from "./collection.types.js";
import { GetCollectionQuery } from "./collection.schema.js";

export class CollectionService {
  constructor(private readonly adapter: TMDBAdapter = tmdbAdapter) {}

  /**
   * Get TMDB collection details by ID (franchises like Star Wars, Avengers, etc.)
   */
  async getCollectionDetails(
    collectionId: number,
    query: GetCollectionQuery
  ): Promise<TMDBCollectionDetails> {
    const data = await this.adapter.get<TMDBCollectionDetails>(
      `/collection/${collectionId}`,
      query as Record<string, unknown>
    );

    return sanitizeResponse(data) as TMDBCollectionDetails;
  }
}

export const collectionService = new CollectionService();
