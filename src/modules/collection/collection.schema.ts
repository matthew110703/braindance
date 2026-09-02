import { z } from "zod";

export const getCollectionSchema = z.object({
  params: z.object({
    collection_id: z.coerce
      .number({
        required_error: "collection_id parameter is required",
        invalid_type_error: "collection_id must be a number",
      })
      .int()
      .positive("collection_id must be a positive integer"),
  }),
  query: z.object({
    language: z.string().trim().default("en-US"),
  }),
});

export type GetCollectionParams = z.infer<typeof getCollectionSchema>["params"];
export type GetCollectionQuery = z.infer<typeof getCollectionSchema>["query"];
