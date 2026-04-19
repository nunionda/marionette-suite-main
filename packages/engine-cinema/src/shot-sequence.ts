/**
 * Multi-shot coherence — keeping the same Element looking like itself
 * across consecutive shots.
 *
 * Higgsfield Cinema 3.5's trick is to (a) reuse the same reference set and
 * (b) lock the random seed. We replicate:
 *
 *   - Each Element contributes its references[] to the shot's refs
 *   - A per-Element seed is derived deterministically from element.id so
 *     shot N+1 uses the same seed as shot N when the same character is on
 *     camera (subject to provider honoring seed)
 *   - usedIn is recorded after every successful submit so the aggregator
 *     can answer "which shots use Jane?" in O(1)
 *
 * This module is the glue between `@marionette/elements-core` and
 * `@marionette/ai-providers/video`. It stays small on purpose — fancier
 * coherence strategies (style transfer locks, LoRA hot-swaps) belong in
 * a future sprint once we see real drift reports.
 */
import type { ImageReference } from "@marionette/ai-providers/image";
import type { ElementStore } from "@marionette/elements-core";

export const MAX_REFERENCES = 9;

/** Deterministic seed derived from element id. Same element → same seed. */
export function seedFromElementId(id: string): number {
  // 32-bit FNV-1a — good enough for reproducibility, not for cryptography.
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Combine seeds from multiple elements into one. Deterministic, order-
 * independent (XOR is commutative). Returns undefined when no elements.
 */
export function combinedSeed(elementIds: string[]): number | undefined {
  if (elementIds.length === 0) return undefined;
  return elementIds
    .map(seedFromElementId)
    .reduce((acc, s) => (acc ^ s) >>> 0, 0);
}

export interface CollectedReferences {
  /** Flat list of references, capped at MAX_REFERENCES. */
  references: ImageReference[];
  /** Element ids actually used (may be fewer than asked if over cap). */
  usedElementIds: string[];
  /**
   * Soul ID model ids discovered on the elements — providers that honor
   * structured identity locks can use these instead of references.
   */
  soulModelIds: string[];
}

/**
 * Collect references from a list of element ids, in order, honoring
 * the 9-reference cap. Elements without references are skipped (identity-
 * only binding). When a cap is hit mid-element, we drop that element's
 * refs entirely rather than splitting them — partial refs hurt more than
 * they help for Soul-style identity.
 */
export async function collectReferencesForElements(
  store: ElementStore,
  elementIds: string[],
): Promise<CollectedReferences> {
  const references: ImageReference[] = [];
  const usedElementIds: string[] = [];
  const soulModelIds: string[] = [];

  for (const id of elementIds) {
    const el = await store.get(id);
    if (!el) continue;

    if (el.identity?.trained && el.identity.modelId) {
      soulModelIds.push(el.identity.modelId);
    }

    if (el.references.length === 0) {
      // Identity-only (trained Soul ID with no refs) — still counts as used.
      if (el.identity?.trained) usedElementIds.push(id);
      continue;
    }

    const remaining = MAX_REFERENCES - references.length;
    if (remaining <= 0) break;
    if (el.references.length > remaining) {
      // Would overflow — skip this element's refs (but still note it's used
      // if it has a trained Soul ID that can anchor it without refs).
      if (el.identity?.trained) usedElementIds.push(id);
      continue;
    }

    references.push(...el.references);
    usedElementIds.push(id);
  }

  return { references, usedElementIds, soulModelIds };
}
