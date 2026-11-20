import { z } from "zod";

export const vidriftParamsSchema = z.object({
  brand: z.string().optional(),
  brandColor: z.string().optional(),
  brandLogo: z.string().url().optional(),
  poster: z.string().url().optional(),
  font: z.string().optional(),
  exit: z.coerce.number().min(0).max(1).optional(),
  showTitle: z.coerce.number().min(0).max(1).optional(),
  watermark: z.coerce.number().min(0).max(1).optional(),
  uiScale: z.coerce.number().min(0.85).max(1.5).optional(),
  controlBg: z.enum(["solid", "gradient"]).optional(),
  caps: z.coerce.number().min(0).max(1).optional(),
  muted: z.coerce.number().min(0).max(1).optional(),
  autoplay: z.coerce.number().min(0).max(1).optional(),
  mobileSheets: z.boolean().optional(),
  hide: z.string().optional(),
});

const httpsUrlPattern = z
  .string()
  .min(8)
  .refine((val) => val.startsWith("https://"), {
    message: "Pattern must begin with https://",
  });

export const createServerSchema = z.object({
  body: z.object({
    id: z.string().min(2).max(50).regex(/^[a-z0-9_-]+$/i, "id must be alphanumeric/dash/underscore"),
    name: z.string().min(2).max(100),
    baseUrl: z.string().url().refine((u) => u.startsWith("https://"), "baseUrl must use https://"),
    moviePattern: httpsUrlPattern,
    tvPattern: httpsUrlPattern,
    anilistPattern: httpsUrlPattern,
    defaultParams: vidriftParamsSchema.default({}),
    isActive: z.boolean().default(true),
    priority: z.number().int().min(1).default(1),
    quality: z.string().default("Adaptive HLS"),
  }),
});

export const updateServerSchema = z.object({
  params: z.object({
    id: z.string().min(2),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    baseUrl: z.string().url().refine((u) => u.startsWith("https://"), "baseUrl must use https://").optional(),
    moviePattern: httpsUrlPattern.optional(),
    tvPattern: httpsUrlPattern.optional(),
    anilistPattern: httpsUrlPattern.optional(),
    defaultParams: vidriftParamsSchema.optional(),
    isActive: z.boolean().optional(),
    priority: z.number().int().min(1).optional(),
    quality: z.string().optional(),
  }),
});

export const serverIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(2),
  }),
});

export const resolveEmbedUrlSchema = z.object({
  query: z
    .object({
      type: z.enum(["movie", "tv", "anilist"]),
      tmdbId: z.coerce.number().int().positive().optional(),
      season: z.coerce.number().int().positive().default(1),
      episode: z.coerce.number().int().positive().default(1),
      anilistId: z.coerce.number().int().positive().optional(),
      serverId: z.string().optional(),
    })
    .refine(
      (q) =>
        q.type === "anilist"
          ? q.anilistId !== undefined || q.tmdbId !== undefined
          : q.tmdbId !== undefined,
      {
        message: "tmdbId is required for movie/tv (or anilistId for anilist)",
        path: ["tmdbId"],
      }
    ),
});

export const resolveDirectStreamSchema = z.object({
  query: z.object({
    type: z.enum(["movie", "tv"]),
    tmdbId: z.coerce.number().int().positive(),
    season: z.coerce.number().int().positive().default(1),
    episode: z.coerce.number().int().positive().default(1),
  }),
});

export type CreateServerBody = z.infer<typeof createServerSchema>["body"];
export type UpdateServerBody = z.infer<typeof updateServerSchema>["body"];
export type ResolveEmbedUrlQuery = z.infer<typeof resolveEmbedUrlSchema>["query"];
export type ResolveDirectStreamQuery = z.infer<typeof resolveDirectStreamSchema>["query"];
