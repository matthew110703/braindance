import { z } from "zod";

export const searchMultiSchema = z.object({
  query: z.object({
    query: z
      .string({ required_error: "Search query is required" })
      .trim()
      .min(1, "Search query cannot be empty"),
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
    include_adult: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((val) => val === true || val === "true")
      .default(false),
  }),
});

export const searchMovieSchema = z.object({
  query: z.object({
    query: z
      .string({ required_error: "Search query is required" })
      .trim()
      .min(1, "Search query cannot be empty"),
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
    include_adult: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((val) => val === true || val === "true")
      .default(false),
    primary_release_year: z.string().optional(),
    year: z.string().optional(),
    region: z.string().optional(),
  }),
});

export const searchTvSchema = z.object({
  query: z.object({
    query: z
      .string({ required_error: "Search query is required" })
      .trim()
      .min(1, "Search query cannot be empty"),
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
    include_adult: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((val) => val === true || val === "true")
      .default(false),
    first_air_date_year: z.string().optional(),
    year: z.string().optional(),
  }),
});

export const searchKeywordSchema = z.object({
  query: z.object({
    query: z
      .string({ required_error: "Search query is required" })
      .trim()
      .min(1, "Search query cannot be empty"),
    page: z.coerce.number().int().min(1).max(500).default(1),
  }),
});

export type SearchMultiQuery = z.infer<typeof searchMultiSchema>["query"];
export type SearchMovieQuery = z.infer<typeof searchMovieSchema>["query"];
export type SearchTvQuery = z.infer<typeof searchTvSchema>["query"];
export type SearchKeywordQuery = z.infer<typeof searchKeywordSchema>["query"];

