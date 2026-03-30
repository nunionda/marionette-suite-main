import type { GateReviewInput, GateReviewResult, RevisionRequest } from './types';
import type { GateReviewOrchestrator } from './GateReviewOrchestrator';
import { DEFAULT_PIPELINE_CONFIG } from './config';

export type RevisionHandler = (request: RevisionRequest) => Promise<string>;

export class RevisionLoop {
  private readonly orchestrator: GateReviewOrchestrator;
  private readonly maxTotalRevisions: number;

  constructor(orchestrator: GateReviewOrchestrator, maxTotalRevisions?: number) {
    this.orchestrator = orchestrator;
    this.maxTotalRevisions = maxTotalRevisions ?? DEFAULT_PIPELINE_CONFIG.maxTotalRevisions;
  }

  async run(
    input: GateReviewInput,
    onRevisionNeeded: RevisionHandler,
  ): Promise<GateReviewResult> {
    let currentInput = { ...input };
    let revisionCount = 0;

    while (revisionCount <= this.maxTotalRevisions) {
      const result = await this.orchestrator.review(currentInput, revisionCount);

      if (result.decision === 'pass' || result.decision === 'escalate') {
        return result;
      }

      revisionCount++;

      const revisionRequest: RevisionRequest = {
        projectId: input.projectId,
        gate: input.gate,
        weaknesses: result.feedback,
        targetScore: DEFAULT_PIPELINE_CONFIG.gates.find(g => g.gate === input.gate)?.thresholds.passScore ?? 85,
        currentScore: result.score,
        revisionNumber: revisionCount,
      };

      const revisedScript = await onRevisionNeeded(revisionRequest);
      currentInput = { ...currentInput, scriptText: revisedScript };
    }

    const finalResult = await this.orchestrator.review(currentInput, revisionCount);
    return { ...finalResult, decision: 'escalate' };
  }
}
