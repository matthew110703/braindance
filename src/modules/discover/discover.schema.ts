import { z } from "zod";

const booleanCoerce = z
  .preprocess((val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
      if (val.toLowerCase() === "true" || val === "1") return true;
      if (val.toLowerCase() === "false" || val === "0") return false;
    }
    return val;
  }, z.boolean())
  .optional();

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .optional();

export const movieSortByEnum = z.enum([
  "popularity.asc",
  "popularity.desc",
  "revenue.asc",
  "revenue.desc",
  "primary_release_date.asc",
  "primary_release_date.desc",
  "vote_average.asc",
  "vote_average.desc",
  "vote_count.asc",
  "vote_count.desc",
  "title.asc",
  "title.desc",
  "original_title.asc",
  "original_title.desc",
]);

export const tvSortByEnum = z.enum([
  "popularity.asc",
  "popularity.desc",
  "first_air_date.asc",
  "first_air_date.desc",
  "name.asc",
  "name.desc",
  "original_name.asc",
  "original_name.desc",
  "vote_average.asc",
  "vote_average.desc",
  "vote_count.asc",
  "vote_count.desc",
]);

export const discoverMovieQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
    sort_by: movieSortByEnum.default("popularity.desc"),
    include_adult: booleanCoerce.default(false),
    include_video: booleanCoerce.default(false),
    region: z.string().optional(),
    certification: z.string().optional(),
    "certification.gte": z.string().optional(),
    "certification.lte": z.string().optional(),
    certification_country: z.string().optional(),
    primary_release_year: z.coerce.number().int().optional(),
    "primary_release_date.gte": dateString,
    "primary_release_date.lte": dateString,
    "release_date.gte": dateString,
    "release_date.lte": dateString,
    year: z.coerce.number().int().optional(),
    "vote_average.gte": z.coerce.number().min(0).max(10).optional(),
    "vote_average.lte": z.coerce.number().min(0).max(10).optional(),
    "vote_count.gte": z.coerce.number().min(0).optional(),
    "vote_count.lte": z.coerce.number().min(0).optional(),
    watch_region: z.string().optional(),
    with_cast: z.string().optional(),
    with_companies: z.string().optional(),
    with_crew: z.string().optional(),
    with_genres: z.string().optional(),
    with_keywords: z.string().optional(),
    with_origin_country: z.string().optional(),
    with_original_language: z.string().optional(),
    with_people: z.string().optional(),
    with_release_type: z.string().or(z.coerce.number()).optional(),
    "with_runtime.gte": z.coerce.number().int().optional(),
    "with_runtime.lte": z.coerce.number().int().optional(),
    with_watch_monetization_types: z.string().optional(),
    with_watch_providers: z.string().optional(),
    without_companies: z.string().optional(),
    without_genres: z.string().optional(),
    without_keywords: z.string().optional(),
    without_watch_providers: z.string().optional(),
  }),
});

export const discoverTvQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
    sort_by: tvSortByEnum.default("popularity.desc"),
    include_adult: booleanCoerce.default(false),
    include_null_first_air_dates: booleanCoerce.default(false),
    screened_theatrically: booleanCoerce,
    timezone: z.string().optional(),
    first_air_date_year: z.coerce.number().int().optional(),
    "first_air_date.gte": dateString,
    "first_air_date.lte": dateString,
    "air_date.gte": dateString,
    "air_date.lte": dateString,
    "vote_average.gte": z.coerce.number().min(0).max(10).optional(),
    "vote_average.lte": z.coerce.number().min(0).max(10).optional(),
    "vote_count.gte": z.coerce.number().min(0).optional(),
    "vote_count.lte": z.coerce.number().min(0).optional(),
    watch_region: z.string().optional(),
    with_companies: z.string().optional(),
    with_genres: z.string().optional(),
    with_keywords: z.string().optional(),
    with_networks: z.string().or(z.coerce.number()).optional(),
    with_origin_country: z.string().optional(),
    with_original_language: z.string().optional(),
    "with_runtime.gte": z.coerce.number().int().optional(),
    "with_runtime.lte": z.coerce.number().int().optional(),
    with_status: z.string().optional(),
    with_type: z.string().optional(),
    with_watch_monetization_types: z.string().optional(),
    with_watch_providers: z.string().optional(),
    without_companies: z.string().optional(),
    without_genres: z.string().optional(),
    without_keywords: z.string().optional(),
    without_watch_providers: z.string().optional(),
  }),
});

export type DiscoverMovieQueryInput = z.infer<typeof discoverMovieQuerySchema>["query"];
export type DiscoverTvQueryInput = z.infer<typeof discoverTvQuerySchema>["query"];
