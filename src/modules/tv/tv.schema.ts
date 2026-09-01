import { z } from "zod";

export const tvIdParamSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({ invalid_type_error: "TV Series ID must be a number" })
      .int("TV Series ID must be an integer")
      .positive("TV Series ID must be positive"),
  }),
});

export const tvListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
    timezone: z.string().optional(),
  }),
});

export const tvDetailsSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({ invalid_type_error: "TV Series ID must be a number" })
      .int("TV Series ID must be an integer")
      .positive("TV Series ID must be positive"),
  }),
  query: z.object({
    language: z.string().default("en-US"),
    append_to_response: z.string().optional(),
  }),
});

export const tvRecommendationsSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({ invalid_type_error: "TV Series ID must be a number" })
      .int("TV Series ID must be an integer")
      .positive("TV Series ID must be positive"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
  }),
});

export const tvSeasonDetailsSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({ invalid_type_error: "TV Series ID must be a number" })
      .int("TV Series ID must be an integer")
      .positive("TV Series ID must be positive"),
    season_number: z.coerce
      .number({ invalid_type_error: "Season number must be a number" })
      .int("Season number must be an integer")
      .min(0, "Season number cannot be negative"),
  }),
  query: z.object({
    language: z.string().default("en-US"),
    append_to_response: z.string().optional(),
  }),
});

export const tvEpisodeDetailsSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({ invalid_type_error: "TV Series ID must be a number" })
      .int("TV Series ID must be an integer")
      .positive("TV Series ID must be positive"),
    season_number: z.coerce
      .number({ invalid_type_error: "Season number must be a number" })
      .int("Season number must be an integer")
      .min(0, "Season number cannot be negative"),
    episode_number: z.coerce
      .number({ invalid_type_error: "Episode number must be a number" })
      .int("Episode number must be an integer")
      .min(0, "Episode number cannot be negative"),
  }),
  query: z.object({
    language: z.string().default("en-US"),
    append_to_response: z.string().optional(),
  }),
});

export type TvListQuery = z.infer<typeof tvListQuerySchema>["query"];
export type TvDetailsQuery = z.infer<typeof tvDetailsSchema>["query"];
export type TvRecommendationsQuery = z.infer<typeof tvRecommendationsSchema>["query"];
export type TvSeasonDetailsParams = z.infer<typeof tvSeasonDetailsSchema>["params"];
export type TvSeasonDetailsQuery = z.infer<typeof tvSeasonDetailsSchema>["query"];
export type TvEpisodeDetailsParams = z.infer<typeof tvEpisodeDetailsSchema>["params"];
export type TvEpisodeDetailsQuery = z.infer<typeof tvEpisodeDetailsSchema>["query"];

