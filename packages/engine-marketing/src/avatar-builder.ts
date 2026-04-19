/**
 * Avatar builder — adapter from photo(s) to an Element with Soul ID intent.
 *
 * Marketing Studio's UGC/testimonial styles often need a recognizable
 * person. Rather than re-implement identity training, we reuse the
 * elements-core domain + soul-trainer orchestration:
 *
 *   1. Operator uploads N photos
 *   2. buildAvatarElement() creates a Character element with those refs
 *   3. (later, optionally) trainElement() locks in a Soul ID
 *
 * This module is the *glue* — just takes photos + a name + returns a
 * new element via the store. Nothing clever; kept here so MarketingStudio
 * UI imports one module instead of three.
 */
import type { ImageReference } from "@marionette/ai-providers/image";
import type {
  Element,
  ElementStore,
} from "@marionette/elements-core";

export interface AvatarBriefInput {
  projectId: string;
  name: string;
  description?: string;
  /** 1..9 photos — more than 9 is accepted but capped. */
  photos: ImageReference[];
  /** Free-form tags (e.g. "hero-model", "senior"). */
  tags?: string[];
}

export async function buildAvatarElement(
  store: ElementStore,
  brief: AvatarBriefInput,
): Promise<Element> {
  const refs = brief.photos.slice(0, 9);
  return store.create({
    projectId: brief.projectId,
    kind: "character",
    name: brief.name,
    description: brief.description,
    references: refs,
    attributes: { role: "avatar" },
    tags: brief.tags ?? ["avatar"],
  });
}
