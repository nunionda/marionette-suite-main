/**
 * ProjectContext — deterministic snapshot of project state used as LLM
 * grounding for the Mr. Higgs-style co-director.
 *
 * Pure function of (store, projectId). Building it is free (no API calls),
 * runs synchronously against the in-memory store today, and can be
 * extended later to include job-runner state + recent generations.
 *
 * Two consumption paths:
 *
 *   1. Deterministic analysis       → suggestion-engine's rule-based checks
 *                                      (train unsold Soul IDs, flag drift, etc)
 *   2. LLM grounding                → serialized as a compact summary block
 *                                      and prepended to the system prompt
 *
 * Keeping it structured (not just a giant string) means rule-based checks
 * stay fast and verifiable, while the LLM still gets the narrative it
 * needs via the render helpers.
 */
import type { Element, ElementKind, ElementStore } from "@marionette/elements-core";

export interface ElementSummary {
  id: string;
  name: string;
  kind: ElementKind;
  referenceCount: number;
  trained: boolean;
  soulProvider?: string;
  consistencyScore?: number;
  usageCount: number;
  tags: string[];
}

export interface ProjectContext {
  projectId: string;
  capturedAt: number;
  elements: ElementSummary[];
  /** Quick stats — kept alongside elements[] so the LLM prompt can cite them. */
  stats: {
    totalElements: number;
    byKind: Partial<Record<ElementKind, number>>;
    trained: number;
    untrained: number;
    unused: number;
    mostUsed?: { id: string; name: string; usageCount: number };
  };
}

export async function buildProjectContext(
  store: ElementStore,
  projectId: string,
): Promise<ProjectContext> {
  const elements = await store.query({ projectId });

  const summaries = elements.map(toSummary);

  const byKind: Partial<Record<ElementKind, number>> = {};
  let trained = 0;
  let untrained = 0;
  let unused = 0;
  let mostUsed: ElementSummary | undefined;

  for (const s of summaries) {
    byKind[s.kind] = (byKind[s.kind] ?? 0) + 1;
    if (s.trained) trained++;
    else untrained++;
    if (s.usageCount === 0) unused++;
    if (!mostUsed || s.usageCount > mostUsed.usageCount) mostUsed = s;
  }

  return {
    projectId,
    capturedAt: Date.now(),
    elements: summaries,
    stats: {
      totalElements: summaries.length,
      byKind,
      trained,
      untrained,
      unused,
      mostUsed:
        mostUsed && mostUsed.usageCount > 0
          ? {
              id: mostUsed.id,
              name: mostUsed.name,
              usageCount: mostUsed.usageCount,
            }
          : undefined,
    },
  };
}

function toSummary(el: Element): ElementSummary {
  return {
    id: el.id,
    name: el.name,
    kind: el.kind,
    referenceCount: el.references.length,
    trained: el.identity?.trained === true,
    soulProvider: el.identity?.provider,
    consistencyScore: el.identity?.consistencyScore,
    usageCount: el.usedIn.length,
    tags: [...el.tags],
  };
}

/**
 * Render ProjectContext as a compact markdown block suitable for embedding
 * in an LLM system prompt. Kept terse — 4-8KB of tokens even for 100+
 * elements. The LLM gets structure + numbers, not prose.
 */
export function renderProjectContext(ctx: ProjectContext): string {
  const lines: string[] = [];
  lines.push(`# Project ${ctx.projectId}`);
  lines.push(
    `- ${ctx.stats.totalElements} elements (` +
      `${ctx.stats.trained} trained / ${ctx.stats.untrained} untrained / ${ctx.stats.unused} unused)`,
  );
  const kindSummary = Object.entries(ctx.stats.byKind)
    .map(([k, n]) => `${k}: ${n}`)
    .join(", ");
  if (kindSummary) lines.push(`- Kinds: ${kindSummary}`);
  if (ctx.stats.mostUsed) {
    lines.push(
      `- Most-used: **${ctx.stats.mostUsed.name}** (${ctx.stats.mostUsed.usageCount} usages)`,
    );
  }

  if (ctx.elements.length > 0) {
    lines.push("");
    lines.push("## Elements");
    for (const el of ctx.elements) {
      const bits: string[] = [];
      bits.push(`${el.referenceCount} refs`);
      if (el.trained)
        bits.push(
          `TRAINED (${el.soulProvider}${
            el.consistencyScore !== undefined
              ? `, consistency ${el.consistencyScore.toFixed(2)}`
              : ""
          })`,
        );
      else bits.push("untrained");
      bits.push(`${el.usageCount} usages`);
      if (el.tags.length) bits.push(`tags: ${el.tags.join(",")}`);
      lines.push(`- **${el.name}** (${el.kind}) — ${bits.join(" · ")}`);
    }
  }

  return lines.join("\n");
}
