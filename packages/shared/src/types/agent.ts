// ---------------------------------------------------------------------------
// Agent configuration & runtime types
// ---------------------------------------------------------------------------

export const AgentStatus = {
  IDLE: "idle",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type AgentStatus = (typeof AgentStatus)[keyof typeof AgentStatus];

export interface AgentConfig {
  name: string;
  description: string;
  phase: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
}

export interface AgentInput {
  project_id: string;
  step: string;
  context: Record<string, unknown>;
}

export interface AgentOutput {
  step: string;
  status: AgentStatus;
  result: Record<string, unknown> | null;
  error_message: string | null;
  duration_ms: number;
}
