import { Hono } from "hono";
import { prisma } from "@marionette/db";
import { BoxOfficePredictor, RiskAuditor } from "@marionette/analysis-core";
import { NotFoundError } from "../middleware/error-handler.js";

export const analysisRoutes = new Hono();

// Initialize analysis engines
// In a full DI setup, these would be injected or handled via a Service
const predictor = new BoxOfficePredictor();
const auditor = new RiskAuditor(predictor);

/**
 * POST /api/analysis/:projectId/run
 * Performs full intelligence audit (ROI, Risk, Kelly Fraction)
 */
analysisRoutes.post("/:projectId/run", async (c) => {
  const projectId = c.req.param("projectId");
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { development: true }
  });

  if (!project) throw new NotFoundError("Project", projectId);

  // 1. Perform analysis logic using packages/analysis-core
  // Note: This matches the 'Golden Logic' ported in Phase 2
  const features = {
    sceneCount: 120, // Simplified for demonstration; would extract from screenplay
    tropeDensity: 0.4
  };

  const prediction = await (predictor as any).predict(features);
  const audit = await auditor.audit(prediction, features);

  // 2. Persist to DB using extended schema (Phase 3.1)
  const report = await prisma.analysisReport.upsert({
    where: { projectId },
    update: {
      predictedRoi: prediction.roi.tier,
      predictedRating: prediction.mpaaRating.rating,
      totalElements: features.sceneCount,
      sceneCount: features.sceneCount,
      // ... other fields
      riskAudit: {
        upsert: {
          create: {
            divergenceIndex: audit.divergenceIndex,
            commercialScore: audit.commercialScore,
            status: audit.status as any,
            resourceAllocation: audit.kellyAllocation
          },
          update: {
            divergenceIndex: audit.divergenceIndex,
            commercialScore: audit.commercialScore,
            status: audit.status as any,
            resourceAllocation: audit.kellyAllocation
          }
        }
      }
    },
    create: {
      projectId,
      predictedRoi: prediction.roi.tier,
      predictedRating: prediction.mpaaRating.rating,
      totalElements: features.sceneCount,
      sceneCount: features.sceneCount,
      characterCount: 0,
      dialogueLineCount: 0,
      actionLineCount: 0,
      dialogueToActionRatio: 0,
      averageWordsPerDialogue: 0,
      characterNetwork: {},
      beatSheet: {},
      emotionGraph: {},
      predictions: prediction,
      riskAudit: {
        create: {
          divergenceIndex: audit.divergenceIndex,
          commercialScore: audit.commercialScore,
          status: audit.status as any,
          resourceAllocation: audit.kellyAllocation
        }
      }
    }
  });

  return c.json({ success: true, report });
});

/**
 * GET /api/analysis/:projectId
 * Retrives latest audit report
 */
analysisRoutes.get("/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const report = await prisma.analysisReport.findUnique({
    where: { projectId },
    include: { riskAudit: true }
  });

  if (!report) throw new NotFoundError("AnalysisReport for project", projectId);
  return c.json(report);
});
