import { z } from "zod";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]).default("info"),
  // External APIs — free-tier only
  TMDB_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),   // remaining credits only
  HUGGINGFACE_API_KEY: z.string().optional(), // free tier
  OLLAMA_BASE_URL: z.string().url().optional(), // local Ollama server
  KOFIC_API_KEY: z.string().optional(),
  PINECONE_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
