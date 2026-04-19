/**
 * Suggestion engine — deterministic rule checks + optional LLM follow-up.
 *
 * Two tiers:
 *
 *   1. **Rule checks**: locally computed from ProjectContext. Fast, no API
 *      key required, reproducible. Cover well-known patterns like
 *      "trained identity missing for heavily-used element".
 *   2. **LLM synthesis** (optional): given the project context + rule
 *      results, ask a TextProvider for open-ended advice. Skipped silently
 *      when no text provider is available — the engine still returns rule
 *      output.
 *
 * We keep rule checks first-class so the Hub UI can populate useful
 * guidance even on fresh BYOK setups where no text provider is wired yet.
 */
import type {
  TextGenerateRequest,
  TextProvider,
} from "@marionette/ai-providers/text";
import type { ProjectContext } from "./project-context";
import { renderProjectContext } from "./project-context";

export type SuggestionSeverity = "info" | "warn" | "critical";

export interface Suggestion {
  /** Stable machine id for dedup + UI keys. */
  id: string;
  severity: SuggestionSeverity;
  title: string;
  rationale: string;
  /** Optional CTA — e.g. { kind: "train-soul", elementId: "el_..." }. */
  action?: {
    kind: string;
    [param: string]: unknown;
  };
}

/** Threshold at which an untrained element's usage count triggers a warn. */
export const UNTRAINED_USAGE_WARN_THRESHOLD = 3;

/**
 * Rule-based suggestion checks. Deterministic, no I/O, no LLM. Safe to call
 * as often as the UI wants.
 */
export function computeRuleSuggestions(ctx: ProjectContext): Suggestion[] {
  const out: Suggestion[] = [];

  // Rule 1: empty project — nudge to create an element.
  if (ctx.elements.length === 0) {
    out.push({
      id: "empty-project",
      severity: "info",
      title: "No elements yet",
      rationale:
        "Characters, locations, props, and costumes live in the Elements Library. Creating them up-front lets every shot reuse the same references and Soul IDs.",
      action: { kind: "create-element" },
    });
    return out;
  }

  // Rule 2: untrained elements heavily used → suggest training.
  for (const el of ctx.elements) {
    if (!el.trained && el.usageCount >= UNTRAINED_USAGE_WARN_THRESHOLD) {
      out.push({
        id: `train-soul:${el.id}`,
        severity: "warn",
        title: `Train a Soul ID for "${el.name}"`,
        rationale: `${el.name} appears in ${el.usageCount} shots without a trained identity. Drift across shots is likely — training a Soul ID locks the look.`,
        action: { kind: "train-soul", elementId: el.id },
      });
    }
  }

  // Rule 3: low consistency score on a trained element.
  for (const el of ctx.elements) {
    if (el.trained && el.consistencyScore !== undefined && el.consistencyScore < 0.7) {
      out.push({
        id: `retrain-soul:${el.id}`,
        severity: "warn",
        title: `Consistency score low for "${el.name}"`,
        rationale: `Trained identity reports ${el.consistencyScore.toFixed(2)} — below 0.70. Consider retraining with more varied references.`,
        action: { kind: "retrain-soul", elementId: el.id },
      });
    }
  }

  // Rule 4: element with no references and no trained identity.
  for (const el of ctx.elements) {
    if (el.referenceCount === 0 && !el.trained) {
      out.push({
        id: `add-refs:${el.id}`,
        severity: "critical",
        title: `"${el.name}" has no references`,
        rationale: `Elements need at least one reference image (or a trained Soul ID) to anchor their look. Add 3-9 references for best consistency.`,
        action: { kind: "add-references", elementId: el.id },
      });
    }
  }

  // Rule 5: orphan elements (never used).
  if (ctx.stats.unused >= 3 && ctx.stats.totalElements > 5) {
    out.push({
      id: "orphans",
      severity: "info",
      title: `${ctx.stats.unused} elements unused`,
      rationale: `These elements exist in the library but aren't referenced in any shot yet. Consider archiving them or wiring them into the pipeline.`,
      action: { kind: "list-unused" },
    });
  }

  return out;
}

export interface SuggestionEngineOptions {
  /**
   * Optional text provider for open-ended advice. When absent, the engine
   * still returns rule-based suggestions (deterministic path).
   */
  textProvider?: TextProvider;
  /**
   * If set to `false`, skip the LLM call even when a provider is available.
   * Default `true` when `textProvider` is passed.
   */
  enableLlm?: boolean;
  /** Free-form user question to focus the LLM pass. */
  question?: string;
}

const SYSTEM_PROMPT = `You are Mr. Higgs, the co-director for a Marionette film/marketing project.
You receive a compact Markdown snapshot of the current project state and (optionally) a user question.
Produce AT MOST 3 actionable suggestions. Keep each one short (title + 1-sentence rationale).
Do NOT repeat facts the user can already see. Focus on non-obvious next steps.
Format each suggestion as: "- [severity] title — rationale"
Valid severities: info, warn, critical.`;

function parseLlmSuggestions(text: string): Suggestion[] {
  // Best-effort parse of bullet lines. Unparseable output falls back to a
  // single free-text suggestion rather than throwing.
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "));
  const results: Suggestion[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.slice(2);
    const m = line.match(
      /^\[(info|warn|critical)\]\s*(.+?)\s+[—-]+\s+(.+)$/i,
    );
    if (!m) continue;
    results.push({
      id: `llm:${i}`,
      severity: m[1]!.toLowerCase() as SuggestionSeverity,
      title: m[2]!.trim(),
      rationale: m[3]!.trim(),
    });
  }
  if (results.length === 0 && text.trim()) {
    results.push({
      id: "llm:raw",
      severity: "info",
      title: "Co-director note",
      rationale: text.trim().slice(0, 500),
    });
  }
  return results;
}

export async function computeSuggestions(
  ctx: ProjectContext,
  opts: SuggestionEngineOptions = {},
): Promise<Suggestion[]> {
  const rule = computeRuleSuggestions(ctx);

  const shouldCallLlm =
    opts.textProvider !== undefined && opts.enableLlm !== false;
  if (!shouldCallLlm) return rule;

  const systemWithContext = `${SYSTEM_PROMPT}\n\n## Context\n${renderProjectContext(ctx)}`;
  const userMessage = opts.question
    ? `User question: ${opts.question}`
    : "What should I focus on next? Give me up to 3 non-obvious suggestions.";

  const req: TextGenerateRequest = {
    system: systemWithContext,
    messages: [{ role: "user", content: userMessage }],
    temperature: 0.5,
    maxTokens: 600,
  };

  try {
    const result = await opts.textProvider!.generate(req);
    const llmSuggestions = parseLlmSuggestions(result.text);
    return [...rule, ...llmSuggestions];
  } catch (err) {
    // LLM failure is non-fatal — rule suggestions are still valuable.
    return [
      ...rule,
      {
        id: "llm:error",
        severity: "info",
        title: "LLM assist unavailable",
        rationale:
          err instanceof Error
            ? err.message.slice(0, 300)
            : "Unknown error reaching the text provider.",
      },
    ];
  }
}
