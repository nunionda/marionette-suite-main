import type {
  ImagePromptNeutral,
  VideoPromptNeutral,
  AdapterContext,
} from "./types";
import type { HiggsfieldProduct } from "@marionette/pipeline-core";

export interface AdapterOutput {
  text: string;
  metadata?: Record<string, unknown>;
}

export interface PromptAdapter {
  id: string;
  product: HiggsfieldProduct;
  renderImage(prompt: ImagePromptNeutral, ctx: AdapterContext): AdapterOutput;
  renderVideo(prompt: VideoPromptNeutral, ctx: AdapterContext): AdapterOutput;
}

const _registry: Map<string, PromptAdapter> = new Map();

export function registerAdapter(adapter: PromptAdapter): void {
  _registry.set(adapter.id, adapter);
}

export function getAdapter(id: string): PromptAdapter | undefined {
  return _registry.get(id);
}

export function listAdapters(): PromptAdapter[] {
  return [..._registry.values()];
}
