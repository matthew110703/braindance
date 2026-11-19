import { IVidriftParams } from "../../models/streamingServer.model.js";

export interface AvailableServerPayload {
  id: string;
  name: string;
  embedUrl: string;
  quality: string;
  priority: number;
  isRecommended: boolean;
}

export interface ResolveMediaOptions {
  type: "movie" | "tv" | "anilist";
  tmdbId?: number;
  season?: number;
  episode?: number;
  anilistId?: number;
  paramsOverride?: Partial<IVidriftParams>;
}
