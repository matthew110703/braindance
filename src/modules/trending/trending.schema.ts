import { z } from "zod";

export const trendingRequestSchema = z.object({
  params: z
    .object({
      time_window: z.enum(["day", "week"]).default("day"),
    })
    .default({ time_window: "day" }),
  query: z.object({
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
  }),
});

export type TrendingRequestParams = z.infer<typeof trendingRequestSchema>["params"];
export type TrendingRequestQuery = z.infer<typeof trendingRequestSchema>["query"];
