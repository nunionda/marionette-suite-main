import type { GateReviewResult, WriterScore } from './types';

export class WriterScorecard {
  private results: Map<string, GateReviewResult[]> = new Map();

  record(result: GateReviewResult): void {
    const existing = this.results.get(result.projectId) ?? [];
    existing.push(result);
    this.results.set(result.projectId, existing);
  }

  getScore(projectId: string): WriterScore {
    const gateResults = this.results.get(projectId) ?? [];

    const passedGates = gateResults.filter(r => r.decision === 'pass');
    const gatePassRate = gateResults.length > 0
      ? passedGates.length / new Set(gateResults.map(r => r.gate)).size
      : 0;

    const totalRevisions = gateResults.reduce((sum, r) => sum + r.revisionCount, 0);

    const lastResult = gateResults[gateResults.length - 1];
    const overallCoverageScore = lastResult?.score ?? 0;

    const gate4Pass = gateResults.some(r => r.gate === 4 && r.decision === 'pass');

    return {
      projectId,
      gateResults,
      overallCoverageScore,
      gatePassRate: Math.round(gatePassRate * 100),
      totalRevisions,
      productionReady: gate4Pass,
    };
  }

  getAllProjects(): string[] {
    return [...this.results.keys()];
  }

  toJSON(projectId: string): string {
    return JSON.stringify(this.getScore(projectId), null, 2);
  }
}
