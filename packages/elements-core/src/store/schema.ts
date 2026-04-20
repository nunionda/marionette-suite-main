/**
 * Drizzle schema for the `elements` table.
 *
 * Design rationale:
 * - Queryable scalar fields (projectId, kind, name, tags) → regular columns
 *   so SQL indexes + WHERE clauses work without JSON extraction.
 * - Complex nested objects (references, identity, attributes, usedIn) → jsonb
 *   columns: no rigid sub-schema needed, and PostgreSQL's JSONB operators
 *   give containment queries when required later.
 * - Timestamps stored as BIGINT milliseconds (matches Date.now() convention
 *   used throughout the runtime — avoids timezone parsing overhead).
 *
 * Migration path: this schema works identically with PgLite (in-process dev)
 * and real Postgres (prod). Swapping the Drizzle connection is the only
 * change needed at promotion time.
 */
import {
  pgTable,
  text,
  bigint,
  jsonb,
} from "drizzle-orm/pg-core";

export const elements = pgTable("elements", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  kind: text("kind").notNull(),
  name: text("name").notNull(),
  description: text("description"),

  /** Up to 9 ImageReference objects — mirrors Higgsfield Cinema 9-ref slots. */
  references: jsonb("references").$type<object[]>().notNull().default([]),

  /** ElementIdentity — absent until training completes. */
  identity: jsonb("identity").$type<object | null>().default(null),

  /** Free-form engine metadata (character arc, palette, GPS, etc.). */
  attributes: jsonb("attributes").$type<Record<string, unknown>>().notNull().default({}),

  /**
   * Tag array stored as TEXT[]. PostgreSQL array operators enable
   * single-tag containment queries (`= ANY(tags)`) and GIN indexing
   * for multi-tag searches in the future.
   */
  tags: text("tags").array().notNull().default([]),

  /** ElementUsage[] reverse index. Written only by recordUsage(). */
  usedIn: jsonb("used_in").$type<object[]>().notNull().default([]),

  /** Millisecond epoch — stable sort key, matches makeId() el_ prefix. */
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

/** Inferred row type — used internally by the PgLite store. */
export type ElementRow = typeof elements.$inferSelect;
export type ElementInsert = typeof elements.$inferInsert;
