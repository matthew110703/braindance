import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(8001),
  DATABASE_URL: z
    .string({
      required_error: "DATABASE_URL is required",
    })
    .min(1, "DATABASE_URL cannot be empty"),
  CORS_ORIGIN: z.string().default("*"),
  TMDB_ACCESS_TOKEN: z
    .string({
      required_error: "TMDB_ACCESS_TOKEN is required",
    })
    .min(1, "TMDB_ACCESS_TOKEN cannot be empty"),
  TMDB_BASE_URL: z.string().url().default("https://api.themoviedb.org/3"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000), // 15 mins
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
});

export type EnvConfig = z.infer<typeof envSchema>;

const parseEnv = (): EnvConfig => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Environment validation error:");
    const errors = result.error.flatten().fieldErrors;
    for (const [field, messages] of Object.entries(errors)) {
      console.error(`  - ${field}: ${messages?.join(", ")}`);
    }
    process.exit(1);
  }

  return Object.freeze(result.data);
};

export const env = parseEnv();
