import { z } from "zod";

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

export type MovieListQuery = z.infer<typeof movieListQuerySchema>["query"];
