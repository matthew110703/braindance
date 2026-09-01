import { z } from "zod";

export const movieIdParamSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({ invalid_type_error: "Movie ID must be a number" })
      .int("Movie ID must be an integer")
      .positive("Movie ID must be positive"),
  }),
});

export const movieListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
    region: z
      .string()
      .regex(/^[A-Z]{2}$/, "Region must be a 2-letter ISO 3166-1 country code (e.g. US, GB, IN)")
      .optional(),
  }),
});

export const movieDetailsSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({ invalid_type_error: "Movie ID must be a number" })
      .int("Movie ID must be an integer")
      .positive("Movie ID must be positive"),
  }),
  query: z.object({
    language: z.string().default("en-US"),
    append_to_response: z.string().optional(),
  }),
});

export const movieRecommendationsSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({ invalid_type_error: "Movie ID must be a number" })
      .int("Movie ID must be an integer")
      .positive("Movie ID must be positive"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
  }),
});

export type MovieListQuery = z.infer<typeof movieListQuerySchema>["query"];
export type MovieDetailsQuery = z.infer<typeof movieDetailsSchema>["query"];
export type MovieRecommendationsQuery = z.infer<typeof movieRecommendationsSchema>["query"];
