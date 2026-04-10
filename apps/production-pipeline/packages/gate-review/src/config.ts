import type { GateConfig, PipelineConfig } from './types';

export const GATE_CONFIGS: GateConfig[] = [
  {
    gate: 1,
    name: 'Concept Gate',
    description: 'Evaluates logline, hook strength, and originality after Stage 1',
    thresholds: {
      passScore: 75,
      maxRevisions: 2,
      escalateAfterRevisions: 2,
      requiredCategories: ['Premise & Concept'],
    },
  },
  {
    gate: 2,
    name: 'Structure Gate',
    description: 'Evaluates narrative structure and character arcs after Stage 2',
    thresholds: {
      passScore: 70,
      maxRevisions: 2,
      escalateAfterRevisions: 2,
      requiredCategories: ['Plot Structure & Logic', 'Character & Dialogue'],
    },
  },
  {
    gate: 3,
    name: 'Draft Gate',
    description: 'Full 8-category coverage evaluation after Stage 3 treatment',
    thresholds: {
      passScore: 75,
      maxRevisions: 3,
      escalateAfterRevisions: 2,
    },
  },
  {
    gate: 4,
    name: 'Production Gate',
    description: 'Final quality + production feasibility check before pipeline handoff',
    thresholds: {
      passScore: 85,
      maxRevisions: 3,
      escalateAfterRevisions: 3,
    },
  },
];

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  gates: GATE_CONFIGS,
  providerChain: ['gemini', 'groq', 'anthropic', 'mock'],
  maxTotalRevisions: 10,
  targetCoverageScore: 85,
};
