import { BaseAgent } from "../base/agent.js";
import type { AgentInput, AgentOutput } from "../base/agent.js";
import type { AIGateway } from "@marionette/ai-gateway";
import type { PrismaClient } from "@prisma/client";
import { RiskAuditor } from "@marionette/analysis-core";

export interface QualityEvaluatorInput extends AgentInput {
  assetPath?: string;
  visualDna?: string;
  setConcept?: string;
  analysisData?: any;
  screenplayFeatures?: any;
}

/**
 * QualityEvaluatorAgent (Industrialized Version)
 * Acts as the final gatekeeper for production assets and creative integrity.
 * Integrates SAIL (Visual SOQ) and RiskAuditor (Quant Intelligence).
 */
export class QualityEvaluatorAgent extends BaseAgent {
  private riskAuditor: RiskAuditor;

  constructor(gateway: AIGateway, db: PrismaClient) {
    super(gateway, db);
    // Note: In a real monorepo setup, you'd inject the predictor correctly.
    // For now, we assume RiskAuditor can be initialized or passed.
    this.riskAuditor = new (RiskAuditor as any)(); 
  }

  async execute(input: QualityEvaluatorInput): Promise<AgentOutput> {
    const { projectId, runId, assetId, assetPath, visualDna, analysisData } = input;

    this.log(`Evaluating integrity for Project: ${projectId} (Asset: ${assetId || "New Concept"})`);
    await this.updateProgress(runId, 20);

    // 1. Creative & Commercial Risk Audit (Level 4 Intelligence)
    let riskReport = { divergenceIndex: 0.1, commercialScore: 85 }; 
    
    try {
      if (analysisData) {
        // In the industrialized pipeline, we use the RiskAuditor from analysis-core
        const audit = await this.riskAuditor.audit(analysisData, input.screenplayFeatures || {});
        riskReport = {
          divergenceIndex: audit.divergenceIndex,
          commercialScore: audit.commercialScore
        };
      }
    } catch (err) {
      this.log(`[Warning] RiskAuditor failed, using safe baseline: ${err}`);
    }

    await this.updateProgress(runId, 50);

    // 2. Visual Quality Assessment (SAIL System Logic)
    const prompt = `
      You are the Senior Quality Assurance Director (SOQ System).
      Evaluate the integrity of the following cinematic asset/concept and provide a SOQ score.
      
      [CONTEXT]
      - Project: ${projectId}
      - Visual DNA: ${visualDna || "Standard Cinematic"}
      - Current Divergence Index: ${riskReport.divergenceIndex}
      
      [REQUIREMENTS]
      - Return JSON only.
      - Fields: 
          "score": (0-100) The Quality/SOQ score.
          "divergenceIndex": Combined with visual feel.
          "decision": "Approved" | "Revision_Required"
          "feedback": Detailed improvement guide for the producing agent.
    `;

    const result = await this.gateway.text(prompt, {
      provider: "gemini" 
    });

    const evalData = JSON.parse(result);
    await this.updateProgress(runId, 80);

    // 3. Persist Evaluation to Asset or PipelineRun
    if (assetId) {
      await this.db.asset.update({
        where: { id: assetId },
        data: {
          metadata: {
            soq_score: evalData.score,
            soq_feedback: evalData.feedback,
            soq_decision: evalData.decision,
            risk_report: riskReport,
            evaluated_at: new Date().toISOString()
          }
        }
      });
      this.log(`Asset ${assetId} SOQ Score: ${evalData.score} | Decision: ${evalData.decision}`);
    }

    await this.updateProgress(runId, 100);

    return {
      success: true,
      message: `Quality evaluation completed. Decision: ${evalData.decision}`,
      data: {
        score: evalData.score ?? 0,
        divergenceIndex: evalData.divergenceIndex ?? riskReport.divergenceIndex,
        decision: evalData.decision,
        feedback: evalData.feedback,
        risk_report: riskReport,
        timestamp: new Date().toISOString()
      }
    };
  }
}
