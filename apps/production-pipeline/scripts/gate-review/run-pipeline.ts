#!/usr/bin/env bun
/**
 * BitSavior Gate Review Pipeline Runner
 *
 * Runs a screenplay through the 4-gate review system:
 *   Gate 1 (Concept) → Gate 2 (Structure) → Gate 3 (Draft) → Gate 4 (Production)
 *
 * Usage:
 *   bun run scripts/gate-review/run-pipeline.ts <script-file> [--gate 1-4] [--project-id bitsavior]
 *
 * Integration points:
 *   - Input: Fountain-format screenplay from cine-script-writer output
 *   - Analysis: scenario-core engines (beat sheet, emotion, character, coverage)
 *   - Output: Gate review results + writer scorecard JSON
 */

import * as fs from 'fs';
import * as path from 'path';
import { LLMFactory } from '@marionette/scenario-core';
import {
  GateReviewOrchestrator,
  RevisionLoop,
  WriterScorecard,
} from '@marionette/gate-review';
import type { GateNumber, GateReviewInput } from '@marionette/gate-review';

function parseArgs() {
  const args = process.argv.slice(2);
  let scriptFile = '';
  let gate: GateNumber | undefined;
  let projectId = 'bitsavior';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--gate' && args[i + 1]) {
      gate = parseInt(args[i + 1]!, 10) as GateNumber;
      i++;
    } else if (arg === '--project-id' && args[i + 1]) {
      projectId = args[i + 1]!;
      i++;
    } else if (!arg?.startsWith('--')) {
      scriptFile = arg!;
    }
  }

  return { scriptFile, gate, projectId };
}

async function main() {
  const { scriptFile, gate, projectId } = parseArgs();

  if (!scriptFile) {
    console.log('Usage: bun run scripts/gate-review/run-pipeline.ts <script.fountain> [--gate 1-4] [--project-id id]');
    process.exit(1);
  }

  const scriptPath = path.resolve(scriptFile);
  if (!fs.existsSync(scriptPath)) {
    console.error(`Script file not found: ${scriptPath}`);
    process.exit(1);
  }

  const scriptText = fs.readFileSync(scriptPath, 'utf8');
  console.log(`Loading script: ${scriptPath} (${scriptText.length} chars)`);

  // Initialize LLM with free-tier provider chain
  const factory = new LLMFactory();
  const llm = factory.getProvider('gemini') ?? factory.getProvider('mock');

  if (!llm) {
    console.error('No LLM provider available. Set GEMINI_API_KEY or run with mock provider.');
    process.exit(1);
  }

  console.log(`Using LLM provider: ${llm.name}`);

  const orchestrator = new GateReviewOrchestrator(llm);
  const scorecard = new WriterScorecard();

  const gatesToRun: GateNumber[] = gate ? [gate] : [1, 2, 3, 4];

  for (const currentGate of gatesToRun) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`GATE ${currentGate} REVIEW`);
    console.log('='.repeat(60));

    const input: GateReviewInput = {
      projectId,
      gate: currentGate,
      scriptText,
    };

    const loop = new RevisionLoop(orchestrator);
    const result = await loop.run(input, async (revisionRequest) => {
      console.log(`\nRevision ${revisionRequest.revisionNumber} requested:`);
      console.log(`  Current score: ${revisionRequest.currentScore}`);
      console.log(`  Target score: ${revisionRequest.targetScore}`);
      console.log(`  Feedback:`);
      for (const weakness of revisionRequest.weaknesses) {
        console.log(`    - ${weakness}`);
      }
      // In production, this would call cine-script-writer to revise
      // For now, return the same script (mock revision)
      return scriptText;
    });

    scorecard.record(result);

    console.log(`\nResult:`);
    console.log(`  Decision: ${result.decision.toUpperCase()}`);
    console.log(`  Score: ${result.score}/100`);
    console.log(`  Revisions: ${result.revisionCount}`);

    if (result.decision === 'pass') {
      console.log(`  Gate ${currentGate} PASSED`);
    } else if (result.decision === 'escalate') {
      console.log(`  Gate ${currentGate} ESCALATED — human review required`);
      break;
    } else {
      console.log(`  Gate ${currentGate} needs REVISION`);
    }

    if (result.feedback.length > 0) {
      console.log(`  Feedback:`);
      for (const item of result.feedback.slice(0, 5)) {
        console.log(`    - ${item}`);
      }
    }
  }

  // Output scorecard
  const finalScore = scorecard.getScore(projectId);
  const outDir = path.join(process.cwd(), 'output', 'gate-reviews');
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, `${projectId}-scorecard.json`);
  fs.writeFileSync(outPath, scorecard.toJSON(projectId));

  console.log(`\n${'='.repeat(60)}`);
  console.log('WRITER SCORECARD');
  console.log('='.repeat(60));
  console.log(`  Coverage Score: ${finalScore.overallCoverageScore}/100`);
  console.log(`  Gate Pass Rate: ${finalScore.gatePassRate}%`);
  console.log(`  Total Revisions: ${finalScore.totalRevisions}`);
  console.log(`  Production Ready: ${finalScore.productionReady ? 'YES' : 'NO'}`);
  console.log(`\nScorecard saved to: ${outPath}`);
}

main().catch(console.error);
