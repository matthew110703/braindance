import { z } from "zod";

export const addWatchlistSchema = z.object({
  body: z.object({
    media_id: z.coerce
      .number({ required_error: "media_id is required" })
      .int()
      .positive("media_id must be a positive integer"),
  }),
});

export const removeWatchlistSchema = z.object({
  params: z.object({
    media_id: z.coerce
      .number({ required_error: "media_id parameter is required" })
      .int()
      .positive("media_id must be a positive integer"),
  }),
});

export const checkWatchlistSchema = z.object({
  params: z.object({
    media_id: z.coerce
      .number({ required_error: "media_id parameter is required" })
      .int()
      .positive("media_id must be a positive integer"),
  }),
});

export const getWatchlistSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
  }),
});

export type AddWatchlistInput = z.infer<typeof addWatchlistSchema>["body"];
export type GetWatchlistQuery = z.infer<typeof getWatchlistSchema>["query"];
