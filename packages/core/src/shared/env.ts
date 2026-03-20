import { z } from "zod";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]).default("info"),
  // External APIs (Uncomment when implementing Phase 1.2 and Phase 2)
  // IMDB_API_KEY: z.string().min(1, "IMDb API Key is required"),
  // OPENAI_API_KEY: z.string().min(1, "OpenAI API Key is required"),
  // PINECONE_API_KEY: z.string().min(1, "Pinecone API Key is required"),
});

// This will throw an error immediately if any required environment variables are missing
export const env = envSchema.parse(process.env);
