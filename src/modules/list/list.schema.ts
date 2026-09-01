import { z } from "zod";

export const createListSchema = z.object({
  query: z.object({
    session_id: z
      .string({ required_error: "session_id query parameter is required" })
      .min(1, "session_id cannot be empty"),
  }),
  body: z.object({
    name: z
      .string({ required_error: "List name is required" })
      .trim()
      .min(1, "List name cannot be empty"),
    description: z
      .string({ required_error: "List description is required" })
      .trim()
      .min(1, "List description cannot be empty"),
    language: z.string().default("en"),
  }),
});

export const getListDetailsSchema = z.object({
  params: z.object({
    list_id: z.coerce
      .number({ required_error: "List ID is required" })
      .int()
      .positive("List ID must be a positive integer"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).max(500).default(1),
    language: z.string().default("en-US"),
  }),
});

export const checkListItemStatusSchema = z.object({
  params: z.object({
    list_id: z.coerce
      .number({ required_error: "List ID is required" })
      .int()
      .positive("List ID must be a positive integer"),
  }),
  query: z.object({
    movie_id: z.coerce
      .number({ required_error: "movie_id query parameter is required" })
      .int()
      .positive("movie_id must be a positive integer"),
    language: z.string().default("en-US"),
  }),
});

export const listMediaItemSchema = z.object({
  params: z.object({
    list_id: z.coerce
      .number({ required_error: "List ID is required" })
      .int()
      .positive("List ID must be a positive integer"),
  }),
  query: z.object({
    session_id: z
      .string({ required_error: "session_id query parameter is required" })
      .min(1, "session_id cannot be empty"),
  }),
  body: z.object({
    media_id: z
      .number({ required_error: "media_id is required" })
      .int()
      .positive("media_id must be a positive integer"),
  }),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type GetListDetailsInput = z.infer<typeof getListDetailsSchema>;
export type CheckListItemStatusInput = z.infer<typeof checkListItemStatusSchema>;
export type ListMediaItemInput = z.infer<typeof listMediaItemSchema>;
