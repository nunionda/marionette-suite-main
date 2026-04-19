/**
 * Context-aware chat — free-form Q&A against the current project state.
 *
 * Thin wrapper around TextProvider.generate() that injects the rendered
 * project context as the system prompt. Not a streaming implementation
 * yet (TextProvider contract is non-streaming); when `stream: true` lands
 * in the ai-providers TextProvider, this wrapper swaps without changing
 * callers.
 *
 * Use cases:
 *   - "Summarize the state of this project in 3 bullets"
 *   - "Which elements need the most attention?"
 *   - "Propose a 5-shot sequence featuring Jane and the alley"
 */
import type {
  ChatMessage,
  TextGenerateRequest,
  TextProvider,
} from "@marionette/ai-providers/text";
import type { ProjectContext } from "./project-context";
import { renderProjectContext } from "./project-context";

export interface ChatRequest {
  /** Prior turns in this conversation (may be empty). */
  history?: ChatMessage[];
  /** The new user message. */
  message: string;
  /** Override temperature (default 0.4 — balanced between deterministic + creative). */
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  /** Assistant reply text. */
  text: string;
  providerId: string;
  /** Populated when the provider emitted reasoning traces. */
  reasoning?: string;
}

const BASE_SYSTEM = `You are Mr. Higgs, the in-app co-director for a Marionette film/marketing project.
Ground every answer in the structured project context below. Cite element names by their exact casing.
Be concise — prefer 3-5 bullets over prose paragraphs. If the context lacks the answer, say so instead of guessing.`;

export async function askCoDirector(
  provider: TextProvider,
  ctx: ProjectContext,
  req: ChatRequest,
): Promise<ChatResponse> {
  const system = `${BASE_SYSTEM}\n\n## Project Context\n${renderProjectContext(ctx)}`;

  const messages: ChatMessage[] = [
    ...(req.history ?? []),
    { role: "user", content: req.message },
  ];

  const llmReq: TextGenerateRequest = {
    system,
    messages,
    temperature: req.temperature ?? 0.4,
    maxTokens: req.maxTokens ?? 800,
  };

  const result = await provider.generate(llmReq);
  return {
    text: result.text,
    providerId: provider.meta.id,
    reasoning: result.reasoning,
  };
}
