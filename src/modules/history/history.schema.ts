import { z } from "zod";

export const updateHistorySchema = z.object({
  params: z.object({
    media_id: z.coerce
      .number({
        required_error: "media_id parameter is required",
        invalid_type_error: "media_id must be a number",
      })
      .int()
      .positive("media_id must be a positive integer"),
  }),
  body: z.object({
    event: z.enum(["timeupdate", "play", "pause", "ended", "seeked"], {
      required_error: "event is required",
    }),
    currentTime: z.number({
      required_error: "currentTime is required",
    }).min(0, "currentTime must be non-negative"),
    duration: z.number({
      required_error: "duration is required",
    }).min(0, "duration must be non-negative"),
    progress: z.number({
      required_error: "progress is required",
    }).min(0, "progress must be non-negative"),
    id: z.union([z.string(), z.number()]).optional(),
    mediaType: z.enum(["movie", "tv"]).default("movie"),
    season: z.number().int().min(0).nullable().optional(),
    episode: z.number().int().min(0).nullable().optional(),
    timestamp: z.number().positive().default(() => Date.now()),
  }),
});

export const getHistoryItemSchema = z.object({
  params: z.object({
    media_id: z.coerce
      .number({
        required_error: "media_id parameter is required",
        invalid_type_error: "media_id must be a number",
      })
      .int()
      .positive("media_id must be a positive integer"),
  }),
});

export const getHistoryListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    mediaType: z.enum(["movie", "tv"]).optional(),
  }),
});

export const removeHistoryItemSchema = z.object({
  params: z.object({
    media_id: z.coerce
      .number({
        required_error: "media_id parameter is required",
        invalid_type_error: "media_id must be a number",
      })
      .int()
      .positive("media_id must be a positive integer"),
  }),
});

export type UpdateHistoryInput = z.infer<typeof updateHistorySchema>["body"];
export type GetHistoryListQuery = z.infer<typeof getHistoryListSchema>["query"];
