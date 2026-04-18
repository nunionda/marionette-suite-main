/**
 * Neutral prompt schema — stored canonical in Marionette Suite.
 * Adapters convert these into vendor-specific prompt strings.
 */
import type { ContentCategory } from "@marionette/pipeline-core";

export interface CharacterRef {
  id: string;
  name: string;
  visualAnchors?: string[];
}

export interface LocationRef {
  id: string;
  name: string;
  visualAnchors?: string[];
}

export interface PropRef {
  id: string;
  name: string;
  visualAnchors?: string[];
}

export interface Camera {
  angle?: "eye-level" | "high" | "low" | "top-down" | "dutch";
  lens?: "wide" | "normal" | "tele" | "macro";
  height?: "ground" | "eye" | "overhead";
}

export interface Lighting {
  key: "natural" | "hard" | "soft" | "practical" | "mixed";
  mood?: string;
  timeOfDay?: "dawn" | "day" | "golden" | "dusk" | "night";
}

export interface Style {
  tone?: string;
  era?: string;
  reference?: string[];
}

export interface ImagePromptNeutral {
  cutId: string;
  projectId: string;
  characters: CharacterRef[];
  location: LocationRef;
  props: PropRef[];
  camera: Camera;
  lighting: Lighting;
  style: Style;
  description: string;
}

export interface Motion {
  action: string;
  subject?: string;
  intensity?: "subtle" | "moderate" | "dynamic";
}

export interface CameraMove {
  type: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld" | "orbit";
  speed?: "slow" | "medium" | "fast";
  target?: string;
}

export interface VideoPromptNeutral {
  cutId: string;
  imagePromptId: string;
  projectId: string;
  motion: Motion;
  cameraMove: CameraMove;
  durationSeconds: number;
  description: string;
}

export interface AdapterContext {
  category: ContentCategory;
  projectTitle: string;
}
