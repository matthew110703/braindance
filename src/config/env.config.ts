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
    .default(1),
  DATABASE_URL: z
    .string({
      required_error: "DATABASE_URL is required",
    })
    .min(1, "DATABASE_URL cannot be empty"),
  JWT_SECRET: z
    .string({
      required_error: "JWT_SECRET is required",
    })
    .min(16, "JWT_SECRET must be at least 16 characters long"),
  CORS_ORIGIN: z.string().default("*"),
  ENABLE_SWAGGER: z
    .preprocess((val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") return val.toLowerCase() === "true";
      return false;
    }, z.boolean())
    .default(false),
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
