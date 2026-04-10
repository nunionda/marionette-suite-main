/**
 * Marionette Suite - Golden Sample Kickoff
 * Project: Nike - The Future of Motion
 * Responsible AI Architect: Antigravity
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createRun, executeRun } from "../../../apps/api/src/services/pipeline.service.js";

const prisma = new PrismaClient();

async function kickoff() {
  console.log("🎬 [Golden Sample] Initializing 'Nike: Future of Motion'...");

  // 1. Create/Update Project with Industrialized World Bible
  const project = await prisma.project.upsert({
    where: { id: "nike-golden-sample" },
    update: {
      title: "Nike: Future of Motion",
      category: "Commercial",
      analysisData: {
        visualDna: {
          mood: "Atmospheric, High-Contrast, Kinetic",
          color_palette: ["Luminous Cyan", "Deep Obsidian", "Neon Ember"],
          cinematography: "Anamorphic wide-angle, low-light film grain"
        }
      },
      development: {
        upsert: {
          create: {
            logline: "A high-octane cinematic trailer exploring a neon-drenched Seoul in 2077, where Nike's bioluminescent footwear powers the last human runners.",
            worldview: "Seoul 2077. The city is a vertical labyrinth of corporate influence. Nike's kinetic energy recovery systems are the heartbeat of the resistance.",
            idea: "Cyberpunk Minimalism meets Seventies Paranoia."
          },
          update: {
            logline: "A high-octane cinematic trailer exploring a neon-drenched Seoul in 2077, where Nike's bioluminescent footwear powers the last human runners.",
            worldview: "Seoul 2077. The city is a vertical labyrinth of corporate influence. Nike's kinetic energy recovery systems are the heartbeat of the resistance.",
            idea: "Cyberpunk Minimalism meets Seventies Paranoia."
          }
        }
      }
    },
    create: {
      id: "nike-golden-sample",
      title: "Nike: Future of Motion",
      category: "Commercial",
      analysisData: {
        visualDna: {
          mood: "Atmospheric, High-Contrast, Kinetic",
          color_palette: ["Luminous Cyan", "Deep Obsidian", "Neon Ember"],
          cinematography: "Anamorphic wide-angle, low-light film grain"
        }
      },
      development: {
        create: {
          logline: "A high-octane cinematic trailer exploring a neon-drenched Seoul in 2077, where Nike's bioluminescent footwear powers the last human runners.",
          worldview: "Seoul 2077. The city is a vertical labyrinth of corporate influence. Nike's kinetic energy recovery systems are the heartbeat of the resistance.",
          idea: "Cyberpunk Minimalism meets Seventies Paranoia."
        }
      }
    }
  });

  // 2. Initialize Unified Intelligence Analysis (Risk & ROI)
  const report = await prisma.analysisReport.upsert({
    where: { projectId: "nike-golden-sample" },
    update: {
      market: "Global",
      totalElements: 120,
      predictedRoi: "3.5x",
      predictedRating: "PG-13",
      sceneCount: 45,
      characterCount: 8,
      dialogueLineCount: 156,
      actionLineCount: 342,
      dialogueToActionRatio: 0.45,
      averageWordsPerDialogue: 12.5,
      characterNetwork: { nodes: [], edges: [] },
      beatSheet: { acts: [] },
      emotionGraph: { arc: [] },
      predictions: { boxOffice: "High" }
    },
    create: {
      projectId: "nike-golden-sample",
      market: "Global",
      totalElements: 120,
      predictedRoi: "3.5x",
      predictedRating: "PG-13",
      sceneCount: 45,
      characterCount: 8,
      dialogueLineCount: 156,
      actionLineCount: 342,
      dialogueToActionRatio: 0.45,
      averageWordsPerDialogue: 12.5,
      characterNetwork: { nodes: [], edges: [] },
      beatSheet: { acts: [] },
      emotionGraph: { arc: [] },
      predictions: { boxOffice: "High" }
    }
  });

  await prisma.creativeRiskAudit.upsert({
    where: { reportId: report.id },
    update: {
      divergenceIndex: 0.12,
      commercialScore: 88,
      status: "STABLE",
      resourceAllocation: {
        vfx: 0.45,
        cast: 0.25,
        marketing: 0.2,
        contingency: 0.1
      }
    },
    create: {
      reportId: report.id,
      divergenceIndex: 0.12,
      commercialScore: 88,
      status: "STABLE",
      resourceAllocation: {
        vfx: 0.45,
        cast: 0.25,
        marketing: 0.2,
        contingency: 0.1
      }
    }
  });

  console.log(`✅ Project '${project.title}' is ready for industrialized production.`);

  // 3. Trigger 14-Agent Production Pipeline
  const steps = [
    "script-writer",
    "scripter",
    "quality-evaluator", // Gatekeeper 1
    "concept-artist",
    "quality-evaluator", // Gatekeeper 2
    "previsualizer",
    "cinematographer",
    "asset-designer",
    "generalist",
    "vfx-compositor",
    "master-editor",
    "colorist",
    "sound-designer",
    "composer"
  ];

  console.log("🚀 Launching Autonomous Production Pipeline (14 Agents)...");
  
  const run = await createRun(project.id, steps, project.idea);
  console.log(`🚀 [RUN STARTED] ID: ${run.id}`);

  // 4. Fire and Forget the execution (it runs in the background in the real app)
  executeRun(run.id, project.idea).catch(err => {
    console.error("❌ Pipeline Execution Failed:", err);
  });

  console.log("\n📡 [MONITOR] You can now watch the RiskMonitor and PipelineTracker in the Studio Hub.");
}

kickoff()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
