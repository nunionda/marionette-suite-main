import type { ScriptCoverage, CoverageCategory } from '@marionette/scenario-core';

export type GateNumber = 1 | 2 | 3 | 4;

export type GateDecision = 'pass' | 'revise' | 'escalate';

export interface GateThresholds {
  passScore: number;
  maxRevisions: number;
  escalateAfterRevisions: number;
  requiredCategories?: string[];
}

export interface GateConfig {
  gate: GateNumber;
  name: string;
  description: string;
  thresholds: GateThresholds;
}

export interface GateReviewInput {
  projectId: string;
  gate: GateNumber;
  scriptText: string;
  metadata?: {
    genre?: string;
    targetAudience?: string;
    logline?: string;
    characters?: Record<string, unknown>[];
  };
}

export interface GateReviewResult {
  projectId: string;
  gate: GateNumber;
  gateName: string;
  decision: GateDecision;
  score: number;
  coverage?: ScriptCoverage;
  relevantCategories: CoverageCategory[];
  feedback: string[];
  revisionCount: number;
  timestamp: string;
}

export interface RevisionRequest {
  projectId: string;
  gate: GateNumber;
  weaknesses: string[];
  targetScore: number;
  currentScore: number;
  revisionNumber: number;
}

export interface WriterScore {
  projectId: string;
  gateResults: GateReviewResult[];
  overallCoverageScore: number;
  gatePassRate: number;
  totalRevisions: number;
  productionReady: boolean;
}

export interface PipelineConfig {
  gates: GateConfig[];
  providerChain: string[];
  maxTotalRevisions: number;
  targetCoverageScore: number;
}
