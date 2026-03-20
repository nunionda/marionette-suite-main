export interface PipelineRunSnapshot {
  runId: string
  projectId: string
  projectTitle: string
  status: string
  currentStep: string | null
  progress: number
  steps: string[]
}

export interface BatchRunSnapshot {
  batchRunId: string
  projectId: string
  projectTitle: string
  status: string
  progress: number
  totalScenes: number
  completedScenes: number
  currentScene?: number
}

export type PipelineWSEvent =
  | { type: "run:snapshot"; runs: PipelineRunSnapshot[] }
  | { type: "run:started"; runId: string; projectId: string; projectTitle: string; steps: string[] }
  | { type: "step:started"; runId: string; step: string; stepIndex: number }
  | { type: "step:completed"; runId: string; step: string; success: boolean; message?: string }
  | { type: "progress"; runId: string; progress: number; currentStep: string }
  | { type: "run:completed"; runId: string; status: "completed" | "failed"; error?: string }
  | { type: "batch:started"; batchRunId: string; projectId: string; totalScenes: number }
  | { type: "batch:scene:started"; batchRunId: string; sceneNumber: number }
  | { type: "batch:scene:completed"; batchRunId: string; sceneNumber: number; success: boolean }
  | { type: "batch:cut:started"; batchRunId: string; sceneNumber: number; cutNumber: number; step: string }
  | { type: "batch:cut:completed"; batchRunId: string; sceneNumber: number; cutNumber: number; success: boolean }
  | { type: "batch:cut:step:completed"; batchRunId: string; sceneNumber: number; cutNumber: number; step: string; success: boolean }
  | { type: "batch:progress"; batchRunId: string; progress: number; currentScene: number; currentCut?: number }
  | { type: "batch:completed"; batchRunId: string; status: "completed" | "failed" | "cancelled" }
  | { type: "batch:snapshot"; batchRuns: BatchRunSnapshot[] }
