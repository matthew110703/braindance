import { z } from "zod";

export const genreQuerySchema = z.object({
  query: z.object({
    language: z.string().trim().default("en"),
  }),
});

export type GenreQuery = z.infer<typeof genreQuerySchema>["query"];
