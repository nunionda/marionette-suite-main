/**
 * CoDirector — facade combining project-context, suggestion-engine,
 * and chat-stream into a single dependency-injected object.
 *
 * The Hub UI imports `createCoDirector({ store, resolveTextProvider? })`
 * and gets:
 *
 *   co.summary(projectId)                → ProjectContext snapshot
 *   co.suggest(projectId, { question? }) → Suggestion[]
 *   co.ask(projectId, { message, ... })  → ChatResponse
 *
 * resolveTextProvider is optional — when absent, suggest() falls back to
 * rule-based suggestions only and ask() throws with a clear message. This
 * matches the BYOK philosophy: the feature degrades gracefully when no
 * text keys are present.
 */
import type { ElementStore } from "@marionette/elements-core";
import type { TextProvider } from "@marionette/ai-providers/text";
import { resolveTextProvider } from "@marionette/ai-providers/registry";
import { buildProjectContext, type ProjectContext } from "./project-context";
import {
  computeSuggestions,
  type Suggestion,
  type SuggestionEngineOptions,
} from "./suggestion-engine";
import { askCoDirector, type ChatRequest, type ChatResponse } from "./chat-stream";

export interface CoDirectorDeps {
  store: ElementStore;
  /**
   * Optional text provider resolver. Omitted → uses
   * registry.resolveTextProvider() which respects env + health.
   * Pass `null` to disable LLM entirely (rule-based only).
   */
  resolveTextProvider?: (() => Promise<TextProvider>) | null;
}

export interface CoDirector {
  summary(projectId: string): Promise<ProjectContext>;
  suggest(
    projectId: string,
    opts?: Pick<SuggestionEngineOptions, "question" | "enableLlm">,
  ): Promise<Suggestion[]>;
  ask(projectId: string, req: ChatRequest): Promise<ChatResponse>;
}

export function createCoDirector(deps: CoDirectorDeps): CoDirector {
  const resolveText =
    deps.resolveTextProvider === null
      ? null
      : deps.resolveTextProvider ?? (() => resolveTextProvider());

  async function getTextProviderSafe(): Promise<TextProvider | undefined> {
    if (resolveText === null) return undefined;
    try {
      return await resolveText();
    } catch {
      // No healthy text provider — degrade gracefully.
      return undefined;
    }
  }

  return {
    async summary(projectId) {
      return buildProjectContext(deps.store, projectId);
    },

    async suggest(projectId, opts = {}) {
      const ctx = await buildProjectContext(deps.store, projectId);
      const textProvider = await getTextProviderSafe();
      return computeSuggestions(ctx, {
        textProvider,
        enableLlm: opts.enableLlm,
        question: opts.question,
      });
    },

    async ask(projectId, req) {
      const textProvider = await getTextProviderSafe();
      if (!textProvider) {
        throw new Error(
          "No text provider available. Configure ANTHROPIC_API_KEY / GOOGLE_AI_STUDIO_KEY / GROQ_API_KEY / OLLAMA_BASE_URL to enable co-director chat.",
        );
      }
      const ctx = await buildProjectContext(deps.store, projectId);
      return askCoDirector(textProvider, ctx, req);
    },
  };
}
