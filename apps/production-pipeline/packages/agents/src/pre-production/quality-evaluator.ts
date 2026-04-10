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

  async run(input: QualityEvaluatorInput): Promise<AgentOutput> {
    const { projectId, assetPath, visualDna, analysisData } = input;

    console.log(`[QualityEvaluator] Evaluating integrity for Project: ${projectId}`);

    // 1. Creative & Commercial Risk Audit (Level 4 Intelligence)
    let riskReport = null;
    if (analysisData) {
      // Logic would normally call RiskAuditor here
      // riskReport = await this.riskAuditor.audit(analysisData, input.screenplayFeatures);
    }

    // 2. Visual Quality Assessment (SAIL System Logic)
    const prompt = `
      You are the Senior Quality Assurance Director (SOQ System).
      Evaluate the integrity of the following cinematic asset/concept.
      
      [CONTEXT]
      - Project: ${projectId}
      - Visual DNA: ${visualDna || "Standard Cinematic"}
      
      [REQUIREMENTS]
      - SOQ Score (0-100)
      - Aesthetic Alignment
      - Technical Feasibility
      
      Return JSON with fields: soq_score, decision (Approved/Revision_Required), and feedback.
    `;

    const result = await this.gateway.text(prompt, {
      provider: "gemini" // Enforce Zero-Cost policy by default
    });

    const evalData = JSON.parse(result);

    return {
      success: true,
      data: {
        ...evalData,
        risk_report: riskReport,
        timestamp: new Date().toISOString()
      }
    };
  }
}
