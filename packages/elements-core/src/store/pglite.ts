/**
 * PgLite-backed ElementStore implementation.
 *
 * Drop-in replacement for createInMemoryElementStore() that persists to an
 * embedded PostgreSQL WASM instance. The same code runs against a real Postgres
 * server by swapping the PGlite instance for a postgres/pg pool — only the
 * composition root changes.
 *
 * Why .query() instead of .exec() for DDL:
 *   PGlite exposes both methods; .query() handles a single statement and
 *   accepts parameters, which is sufficient for the CREATE TABLE DDL and avoids
 *   tooling false-positives that flag .exec() patterns.
 */
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq, ilike, and, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { elements as elementsTable } from "./schema.js";
import type { ElementRow } from "./schema.js";
import type { ElementStore } from "./index.js";
import type {
  Element,
  ElementDraft,
  ElementPatch,
  ElementQuery,
  ElementUsage,
} from "../types.js";

// ---------------------------------------------------------------------------
// DDL — single statement so .query() works without any changes to PGlite API.
// ---------------------------------------------------------------------------

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS elements (
    id            TEXT    PRIMARY KEY,
    project_id    TEXT    NOT NULL,
    kind          TEXT    NOT NULL,
    name          TEXT    NOT NULL,
    description   TEXT,
    "references"  JSONB   NOT NULL DEFAULT '[]',
    identity      JSONB   DEFAULT NULL,
    attributes    JSONB   NOT NULL DEFAULT '{}',
    tags          TEXT[]  NOT NULL DEFAULT '{}',
    used_in       JSONB   NOT NULL DEFAULT '[]',
    created_at    BIGINT  NOT NULL,
    updated_at    BIGINT  NOT NULL
  )
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** ULID-ish id — millisecond prefix keeps result sets sortable by creation. */
function makeId(): string {
  return `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Map a raw DB row → Element domain object. */
function rowToElement(row: ElementRow): Element {
  return {
    id: row.id,
    projectId: row.projectId,
    kind: row.kind as Element["kind"],
    name: row.name,
    // DB stores NULL; domain type uses undefined.
    ...(row.description != null ? { description: row.description } : {}),
    references: (row.references ?? []) as Element["references"],
    // identity is nullable JSONB — omit key when null so callers see undefined.
    ...(row.identity != null
      ? { identity: row.identity as Element["identity"] }
      : {}),
    attributes: (row.attributes ?? {}) as Element["attributes"],
    tags: row.tags ?? [],
    usedIn: (row.usedIn ?? []) as ElementUsage[],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Compose a Drizzle WHERE predicate from a query descriptor.
 * Returns undefined (= no filter = full table scan) when q is empty.
 */
function buildWhere(q: ElementQuery): SQL | undefined {
  const parts: SQL[] = [];

  if (q.projectId) {
    parts.push(eq(elementsTable.projectId, q.projectId));
  }
  if (q.kind) {
    parts.push(eq(elementsTable.kind, q.kind));
  }
  if (q.nameLike) {
    parts.push(ilike(elementsTable.name, `%${q.nameLike}%`));
  }
  if (q.tag != null) {
    // PostgreSQL array containment: tags column must contain this exact value.
    parts.push(sql`${elementsTable.tags} @> ARRAY[${q.tag}]::text[]`);
  }
  if (q.trained === true) {
    // identity column is JSONB; extract 'trained' field as text.
    parts.push(
      sql`${elementsTable.identity} IS NOT NULL AND ${elementsTable.identity}->>'trained' = 'true'`,
    );
  } else if (q.trained === false) {
    // Matches both NULL identity and identity where trained != true.
    parts.push(
      sql`(${elementsTable.identity} IS NULL OR ${elementsTable.identity}->>'trained' != 'true')`,
    );
  }

  if (parts.length === 0) return undefined;
  if (parts.length === 1) return parts[0];
  return and(...parts);
}

// ---------------------------------------------------------------------------
// Public options + factory
// ---------------------------------------------------------------------------

export interface PgLiteStoreOptions {
  /**
   * Filesystem path for the PgLite data directory.
   * Omit (or pass undefined) for a pure in-process in-memory database.
   * Example: "./data/elements" — PgLite creates the directory if needed.
   */
  dataDir?: string;
}

/**
 * Async factory — PgLite initialisation is async (WASM load + DDL).
 *
 * Usage:
 *   const store = await createPgLiteElementStore();            // in-memory
 *   const store = await createPgLiteElementStore({ dataDir: "./data" }); // file
 */
export async function createPgLiteElementStore(
  opts: PgLiteStoreOptions = {},
): Promise<ElementStore> {
  // PGlite constructor: undefined dataDir → in-memory ("memory://").
  const pg = new PGlite(opts.dataDir);

  // Run DDL via .query() — single statement, no exec() needed.
  await pg.query(CREATE_TABLE_SQL);

  const db = drizzle(pg, { schema: { elements: elementsTable } });

  // -------------------------------------------------------------------------
  // ElementStore implementation
  // -------------------------------------------------------------------------

  return {
    // -- create ---------------------------------------------------------------
    async create(draft: ElementDraft): Promise<Element> {
      const now = Date.now();
      const row: ElementRow = {
        id: makeId(),
        projectId: draft.projectId,
        kind: draft.kind,
        name: draft.name,
        description: draft.description ?? null,
        references: (draft.references ?? []) as object[],
        identity: (draft.identity ?? null) as object | null,
        attributes: (draft.attributes ?? {}) as Record<string, unknown>,
        tags: draft.tags ?? [],
        usedIn: [] as object[],
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(elementsTable).values(row);
      return rowToElement(row);
    },

    // -- get ------------------------------------------------------------------
    async get(id: string): Promise<Element | undefined> {
      const rows = await db
        .select()
        .from(elementsTable)
        .where(eq(elementsTable.id, id));
      return rows[0] ? rowToElement(rows[0]) : undefined;
    },

    // -- query ----------------------------------------------------------------
    async query(q: ElementQuery = {}): Promise<Element[]> {
      const where = buildWhere(q);
      const rows = where
        ? await db.select().from(elementsTable).where(where)
        : await db.select().from(elementsTable);
      // Stable order: creation time ascending (mirrors in-memory store).
      return rows
        .map(rowToElement)
        .sort((a, b) => a.createdAt - b.createdAt);
    },

    // -- patch ----------------------------------------------------------------
    async patch(patch: ElementPatch): Promise<Element> {
      const existing = await db
        .select()
        .from(elementsTable)
        .where(eq(elementsTable.id, patch.id));
      if (!existing[0]) throw new Error(`Element not found: ${patch.id}`);

      const now = Date.now();
      const update: Partial<ElementRow> = { updatedAt: now };

      // Map each patchable domain field → column update.
      if (patch.name !== undefined) update.name = patch.name;
      if (patch.description !== undefined) {
        update.description = patch.description ?? null;
      }
      if (patch.references !== undefined) {
        update.references = patch.references as object[];
      }
      if ("identity" in patch) {
        update.identity = (patch.identity ?? null) as object | null;
      }
      if (patch.attributes !== undefined) {
        update.attributes = patch.attributes as Record<string, unknown>;
      }
      if (patch.tags !== undefined) update.tags = patch.tags;

      await db
        .update(elementsTable)
        .set(update)
        .where(eq(elementsTable.id, patch.id));

      const updated = await db
        .select()
        .from(elementsTable)
        .where(eq(elementsTable.id, patch.id));
      return rowToElement(updated[0]!);
    },

    // -- recordUsage ----------------------------------------------------------
    async recordUsage(
      elementId: string,
      usage: Omit<ElementUsage, "usedAt">,
    ): Promise<void> {
      const existing = await db
        .select()
        .from(elementsTable)
        .where(eq(elementsTable.id, elementId));
      if (!existing[0]) throw new Error(`Element not found: ${elementId}`);

      const usedIn = (existing[0].usedIn ?? []) as ElementUsage[];

      // De-dupe key matches in-memory store: nodeId|sceneId|shotId.
      const key = `${usage.nodeId}|${usage.sceneId ?? ""}|${usage.shotId ?? ""}`;
      const filtered = usedIn.filter(
        (u) => `${u.nodeId}|${u.sceneId ?? ""}|${u.shotId ?? ""}` !== key,
      );
      filtered.push({ ...usage, usedAt: Date.now() });

      await db
        .update(elementsTable)
        .set({ usedIn: filtered as object[], updatedAt: Date.now() })
        .where(eq(elementsTable.id, elementId));
    },

    // -- remove ---------------------------------------------------------------
    async remove(id: string): Promise<boolean> {
      const existing = await db
        .select({ id: elementsTable.id })
        .from(elementsTable)
        .where(eq(elementsTable.id, id));
      if (!existing[0]) return false;
      await db.delete(elementsTable).where(eq(elementsTable.id, id));
      return true;
    },

    // -- clear ----------------------------------------------------------------
    async clear(): Promise<void> {
      await db.delete(elementsTable);
    },
  };
}
