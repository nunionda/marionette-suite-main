// ---------------------------------------------------------------------------
// Pipeline / production run types
// ---------------------------------------------------------------------------

export const ProductionPhase = {
  PRE: "PRE",
  MAIN: "MAIN",
  POST: "POST",
} as const;

export type ProductionPhase = (typeof ProductionPhase)[keyof typeof ProductionPhase];

export const RunStatus = {
  QUEUED: "queued",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type RunStatus = (typeof RunStatus)[keyof typeof RunStatus];

// ---------------------------------------------------------------------------
// Step result stored inside a pipeline run
// ---------------------------------------------------------------------------

export interface StepResult {
  step: string;
  status: RunStatus;
  started_at: string | null;
  completed_at: string | null;
  output: Record<string, unknown> | null;
  error_message: string | null;
}

// ---------------------------------------------------------------------------
// API request / response shapes
// ---------------------------------------------------------------------------

export interface PipelineRunCreate {
  steps: string[];
  idea: string;
}

export interface PipelineRunResponse {
  id: string;
  project_id: string;
  steps: string[];
  current_step: string | null;
  status: RunStatus;
  progress: number;
  step_results: StepResult[];
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}
