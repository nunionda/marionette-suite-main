/**
 * Element — cross-cutting first-class domain object.
 *
 * An Element is a persistent, reusable identity or asset referenced across
 * the Marionette pipeline: a character used in multiple scenes, a location
 * appearing in flashback + flashforward, a costume tracked across shoot
 * days. The Element layer unifies:
 *
 *   - Higgsfield Soul ID          (image identity lock, trained)
 *   - ElevenLabs PVC voice id     (audio identity lock, trained)
 *   - Runway / LTX reusable refs  (collection of source images)
 *   - Celtx / StudioBinder entities (breakdown rows)
 *
 * Upper layers (engines/cinema, engines/marketing) treat Element as the
 * single source of truth for "who/what is in this shot". Layer 1 providers
 * consume `references` and `identity` via the ImageReference shape.
 */
import type { ImageReference } from "@marionette/ai-providers/image";

export type ElementKind =
  | "character"
  | "location"
  | "prop"
  | "costume"
  | "style"
  | "lighting"
  | "vehicle"
  | "vfx";

/**
 * Persistent identity produced by a training job (image Soul ID or voice PVC).
 * `trained: false` means references-only (no model weights yet) — useful for
 * quick iteration before committing to the training cost.
 */
export interface ElementIdentity {
  /** Which provider produced this identity. */
  provider:
    | "soul-2.0"
    | "lora"
    | "dreambooth"
    | "textual-inversion"
    | "elevenlabs-ivc"
    | "elevenlabs-pvc";
  /** Vendor-native id — pass back to the provider to invoke the identity. */
  modelId: string;
  /** Source samples fed into training (for audit + retraining). */
  trainingSampleIds: string[];
  trained: boolean;
  /** Optional self-reported quality metric, 0..1 (driftScore inverse). */
  consistencyScore?: number;
  /** When the identity was locked. */
  trainedAt?: number;
}

/**
 * Usage index entry — reverse pointer from Element to every consumer.
 * Populated by the store whenever an engine references this element in a
 * pipeline node. Enables the aggregator to answer "which scenes/shots use
 * Jane?" in O(1).
 */
export interface ElementUsage {
  nodeId: string;
  sceneId?: string;
  shotId?: string;
  /** Free-form label for the usage context (e.g. "adr-dubbing:scene-7"). */
  contextLabel?: string;
  usedAt: number;
}

export interface Element {
  id: string;
  projectId: string;
  kind: ElementKind;
  name: string;
  description?: string;

  /** Up to 9 references (mirrors Higgsfield Cinema 3.5 reference slots). */
  references: ImageReference[];

  /** Optional persistent identity — absent until training completes. */
  identity?: ElementIdentity;

  /**
   * Arbitrary attributes — Layer 3 orchestrators stuff structured metadata
   * here (e.g. character arc, costume palette, location GPS). Keeping this
   * open avoids boxing the schema every time a new engine idea lands.
   */
  attributes: Record<string, unknown>;

  tags: string[];
  usedIn: ElementUsage[];
  createdAt: number;
  updatedAt: number;
}

/** Minimal payload for create — store auto-fills id/timestamps/usedIn. */
export type ElementDraft = Omit<Element, "id" | "createdAt" | "updatedAt" | "usedIn">;

/** Partial update — `id` required, everything else optional. */
export type ElementPatch = Partial<Omit<Element, "id" | "projectId" | "createdAt">> & {
  id: string;
};

export interface ElementQuery {
  projectId?: string;
  kind?: ElementKind;
  tag?: string;
  /** Case-insensitive name substring. */
  nameLike?: string;
  /** Return only elements whose identity.trained === this value. */
  trained?: boolean;
}

/**
 * Drift check result — "how far has this shot's rendering wandered from the
 * Element's trained identity?" Higher driftScore = less consistent.
 */
export interface DriftReport {
  elementId: string;
  shotId?: string;
  /** 0..1 — 0 = identical, 1 = totally different. */
  driftScore: number;
  /** Optional free-text explanation (e.g. "hair color shifted to blonde"). */
  notes?: string;
}
