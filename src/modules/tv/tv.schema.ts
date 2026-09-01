import { z } from "zod";

export const tvListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
    timezone: z.string().optional(),
  }),
});

export type TvListQuery = z.infer<typeof tvListQuerySchema>["query"];
