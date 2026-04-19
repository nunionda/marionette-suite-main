/**
 * Element store — in-memory CRUD + query + usage index.
 *
 * Interface-first: consumers (engines/cinema, engines/marketing, Hub API
 * routes) depend on `ElementStore`, not on this impl. A future Drizzle +
 * Postgres store can slot in at the composition root without touching
 * callers. See plan B.8 "임시 SQLite 유지 · store interface migration-ready".
 *
 * usedIn semantics: CRUD does NOT mutate usedIn. Engines call
 * `recordUsage()` when they wire an element into a pipeline node. This
 * keeps the reverse index authoritative (every write is a real usage)
 * instead of reconstructed via scans.
 */
import type {
  Element,
  ElementDraft,
  ElementPatch,
  ElementQuery,
  ElementUsage,
} from "../types";

export interface ElementStore {
  create(draft: ElementDraft): Promise<Element>;
  get(id: string): Promise<Element | undefined>;
  query(q?: ElementQuery): Promise<Element[]>;
  patch(patch: ElementPatch): Promise<Element>;
  recordUsage(
    elementId: string,
    usage: Omit<ElementUsage, "usedAt">,
  ): Promise<void>;
  remove(id: string): Promise<boolean>;
  /** Test/dev helper. Production stores MAY implement as no-op. */
  clear(): Promise<void>;
}

/** ULID-ish id — millisecond prefix + random suffix. Stable sort by creation. */
function makeId(): string {
  return `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function matches(el: Element, q: ElementQuery): boolean {
  if (q.projectId && el.projectId !== q.projectId) return false;
  if (q.kind && el.kind !== q.kind) return false;
  if (q.tag && !el.tags.includes(q.tag)) return false;
  if (q.nameLike) {
    if (!el.name.toLowerCase().includes(q.nameLike.toLowerCase())) return false;
  }
  if (q.trained !== undefined) {
    const isTrained = el.identity?.trained === true;
    if (q.trained !== isTrained) return false;
  }
  return true;
}

export function createInMemoryElementStore(): ElementStore {
  const elements = new Map<string, Element>();

  return {
    async create(draft) {
      const now = Date.now();
      const el: Element = {
        ...draft,
        id: makeId(),
        usedIn: [],
        createdAt: now,
        updatedAt: now,
      };
      elements.set(el.id, el);
      return el;
    },

    async get(id) {
      return elements.get(id);
    },

    async query(q = {}) {
      const out: Element[] = [];
      for (const el of elements.values()) {
        if (matches(el, q)) out.push(el);
      }
      // Stable order: creation time ascending (id embeds ms prefix).
      out.sort((a, b) => a.createdAt - b.createdAt);
      return out;
    },

    async patch(patch) {
      const existing = elements.get(patch.id);
      if (!existing) throw new Error(`Element not found: ${patch.id}`);

      // Strip immutable fields from the patch before merging.
      const { id: _id, ...rest } = patch;
      const next: Element = {
        ...existing,
        ...rest,
        // Preserve invariants from the existing record.
        id: existing.id,
        projectId: existing.projectId,
        createdAt: existing.createdAt,
        updatedAt: Date.now(),
      };
      elements.set(next.id, next);
      return next;
    },

    async recordUsage(elementId, usage) {
      const existing = elements.get(elementId);
      if (!existing) throw new Error(`Element not found: ${elementId}`);

      // De-dupe on (nodeId, sceneId?, shotId?) — re-running a node should
      // update the timestamp, not append a duplicate row.
      const key = `${usage.nodeId}|${usage.sceneId ?? ""}|${usage.shotId ?? ""}`;
      const filtered = existing.usedIn.filter(
        (u) => `${u.nodeId}|${u.sceneId ?? ""}|${u.shotId ?? ""}` !== key,
      );
      filtered.push({ ...usage, usedAt: Date.now() });

      elements.set(elementId, {
        ...existing,
        usedIn: filtered,
        updatedAt: Date.now(),
      });
    },

    async remove(id) {
      return elements.delete(id);
    },

    async clear() {
      elements.clear();
    },
  };
}

/** Shared default instance — convenient for dev/test, not a requirement. */
export const defaultElementStore: ElementStore = createInMemoryElementStore();
