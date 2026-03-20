export type StepResult = {
  status: "completed" | "failed"
  message?: string
  outputPath?: string
  completedAt: string
}

export type StepResults = Record<string, StepResult>

export interface BatchAgentInput {
  projectId: string
  runId: string
  sceneNumber: number
  cutNumber?: number
  batchRunId: string
  sceneTaskId: string
  cutTaskId?: string
  [key: string]: unknown
}
