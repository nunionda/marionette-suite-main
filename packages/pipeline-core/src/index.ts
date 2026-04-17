/**
 * Pipeline Core — Abstract stage model.
 *
 * Every content type (film/drama/commercial/youtube) customizes these via profile.
 * Apps consume profile-aware views, never raw enums.
 */

export type Phase = "PRE" | "MAIN" | "POST" | "LIBRARY";

export type ContentCategory = "film" | "drama" | "commercial" | "youtube";

export type StudioCode = "STE" | "IMP" | "MAR";

export interface Artifact {
  id: string;
  kind:
    | "logline"
    | "treatment"
    | "script"
    | "storyboard"
    | "prompt_sheet"
    | "budget"
    | "call_sheet"
    | "daily_log"
    | "footage"
    | "edit_cut"
    | "vfx_shot"
    | "sound_mix"
    | "color_master"
    | "delivery_master"
    | "client_brief"
    | "analytics_report";
  required: boolean;
  uri?: string;
}

export interface GateRule {
  id: string;
  description: string;
  validator: "human_review" | "automated_check" | "llm_review";
}

export interface PipelineStage {
  phase: Phase;
  stageId: string;
  label: string;
  weight: number; // 0-100, emphasis for UI
  artifacts: Artifact[];
  gates: GateRule[];
}

export interface ContentProfile {
  category: ContentCategory;
  label: string;
  stages: PipelineStage[];
  metrics: string[];
  stakeholders: string[];
  ui: {
    emphasize: Phase;
    collapse?: Phase[];
  };
  generationTarget: GenerationTarget;
}

export interface Project {
  id: string;
  title: string;
  category: ContentCategory;
  studio: StudioCode;
  currentPhase: Phase;
  createdAt: string;
  updatedAt: string;
}

export type HiggsfieldProduct =
  | "cinema-studio-3.5"
  | "marketing-studio"
  | "original-series";

export type PromptStyle =
  | "cinematic"
  | "ad-ugc"
  | "ad-cgi"
  | "episodic";

export interface GenerationTarget {
  platform: "higgsfield"; // 향후 "runway" | "luma" 등 추가 가능
  product: HiggsfieldProduct;
  promptStyle: PromptStyle;
  shotStructure: "sequential" | "parallel" | "montage";
}
