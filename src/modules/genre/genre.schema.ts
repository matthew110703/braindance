import { z } from "zod";

export const genreQuerySchema = z.object({
  query: z.object({
    language: z
      .string()
      .trim()
      .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Invalid ISO language code")
      .default("en"),
  }),
});

export type GenreQuery = z.infer<typeof genreQuerySchema>["query"];
