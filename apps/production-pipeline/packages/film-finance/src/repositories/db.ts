import { PrismaClient } from "../generated/client/index.js";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Prisma resolves SQLite paths relative to schema.prisma, so the DB lives at prisma/finance.db
const DEFAULT_DB_PATH = `file:${resolve(__dirname, "../../prisma/finance.db")}`;

let _client: PrismaClient | null = null;

export function getFinanceDb(): PrismaClient {
  if (!_client) {
    _client = new PrismaClient({
      datasources: {
        db: {
          url: process.env.FINANCE_DATABASE_URL ?? DEFAULT_DB_PATH,
        },
      },
    });
  }
  return _client;
}
