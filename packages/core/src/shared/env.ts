import { z } from "zod";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]).default("info"),
  // External APIs
  TMDB_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  PINECONE_API_KEY: z.string().optional(),
});

// This will throw an error immediately if any required environment variables are missing
export const env = envSchema.parse(process.env);
