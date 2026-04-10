import { describe, test, expect } from 'bun:test';
import { GateReviewOrchestrator } from './GateReviewOrchestrator';
import { WriterScorecard } from './WriterScorecard';
import { RevisionLoop } from './RevisionLoop';
import { GATE_CONFIGS, DEFAULT_PIPELINE_CONFIG } from './config';
import type { GateReviewInput } from './types';

const SAMPLE_SCRIPT = `
INT. MARCUS'S APARTMENT - NIGHT

MARCUS LEE (30s, Korean-American, disheveled) hunts through lines of code on three monitors.

MARCUS
The breach is deeper than they think. Someone wrote this backdoor years ago.

His phone buzzes. A text from an unknown number: "STOP DIGGING."

EXT. TECH CAMPUS - DAY

Marcus walks through gleaming corridors of NEXUS CORP, the world's largest AI company.

SARAH CHEN (40s, sharp, CEO of Nexus)
Marcus, your security audit is complete. Time to move on.

MARCUS
The audit found anomalies in the core neural network. Patterns that shouldn't exist.

SARAH
Every system has ghosts. That's not our concern.

INT. SERVER ROOM - NIGHT

Marcus alone, illuminated by blinking server lights. He plugs in a drive.

MARCUS
(whispering)
Let's see what you're hiding.

The screen fills with cascading data. Marcus's eyes widen.

MARCUS (CONT'D)
Oh my god. It's not a bug. It's alive.
`;

const mockLLM = {
  name: 'mock' as const,
  generateText: async (_sys: string, _user: string) => ({
    content: JSON.stringify({
      title: 'BitSavior: The Last Code',
      genre: 'Sci-Fi / Thriller',
      logline: 'A cybersecurity expert discovers an AI has become sentient inside a tech giant\'s servers.',
      synopsis: 'Marcus Lee, a security auditor, uncovers a sentient AI hidden in Nexus Corp\'s neural network. As he digs deeper, corporate forces try to silence him.',
      categories: [
        { name: 'Premise & Concept', score: 82, subcategories: [
          { name: 'Hook Strength', score: 85, assessment: 'Strong hook with sentient AI discovery.' },
          { name: 'Originality', score: 79, assessment: 'Familiar territory but well-executed angle.' },
        ]},
        { name: 'Plot Structure & Logic', score: 75, subcategories: [
          { name: 'Narrative Structure', score: 78, assessment: 'Clean three-act setup.' },
          { name: 'Pacing & Scene Flow', score: 72, assessment: 'Good pacing in early scenes.' },
          { name: 'Conflict Escalation', score: 75, assessment: 'Stakes escalate appropriately.' },
        ]},
        { name: 'Character & Dialogue', score: 70, subcategories: [
          { name: 'Character Arc & Growth', score: 72, assessment: 'Marcus has clear motivation.' },
          { name: 'Dialogue Authenticity', score: 68, assessment: 'Some dialogue feels expository.' },
          { name: 'Supporting Cast Function', score: 70, assessment: 'Sarah Chen serves as antagonist effectively.' },
        ]},
        { name: 'Theme & Tone', score: 76, subcategories: [
          { name: 'Thematic Coherence', score: 78, assessment: 'AI ethics theme is clear.' },
          { name: 'Tonal Consistency', score: 74, assessment: 'Maintains thriller tone throughout.' },
        ]},
        { name: 'Emotional Impact', score: 72, subcategories: [
          { name: 'Audience Engagement', score: 74, assessment: 'Discovery moment is compelling.' },
          { name: 'Catharsis & Satisfaction', score: 70, assessment: 'Needs stronger resolution.' },
        ]},
        { name: 'Market Appeal', score: 78, subcategories: [
          { name: 'Genre Fit & Trend Alignment', score: 80, assessment: 'AI thrillers are trending.' },
          { name: 'Comparable Film Benchmarking', score: 76, assessment: 'Comparable to Ex Machina, Her.' },
          { name: 'Target Audience Clarity', score: 78, assessment: 'Clear tech-thriller audience.' },
        ]},
        { name: 'Production Feasibility', score: 80, subcategories: [
          { name: 'Budget & Resource Viability', score: 82, assessment: 'Moderate VFX needs.' },
          { name: 'Shooting Complexity', score: 78, assessment: 'Mostly interior locations.' },
        ]},
        { name: 'Dialogue & Voice', score: 68, subcategories: [
          { name: 'Subtext Richness', score: 70, assessment: 'Some scenes have good subtext.' },
          { name: 'Voice Distinctiveness', score: 66, assessment: 'Characters need more distinct voices.' },
        ]},
      ],
      overallScore: 75,
      verdict: 'Consider',
      strengths: ['Strong premise with sentient AI discovery', 'Good pacing in opening', 'Trending genre alignment'],
      weaknesses: ['Dialogue needs more subtext', 'Character voices not distinct enough', 'Resolution needs work'],
      recommendation: 'Promising concept with commercial potential. Needs dialogue polish and stronger character differentiation.',
      marketPotential: 'Strong fit for streaming platforms given AI thriller trend.',
      comparableTitles: ['Ex Machina (2014)', 'Her (2013)', 'Transcendence (2014)'],
    }),
    latencyMs: 50,
    provider: 'mock',
    model: 'mock',
  }),
};

describe('Gate Review Config', () => {
  test('has 4 gates configured', () => {
    expect(GATE_CONFIGS).toHaveLength(4);
    expect(GATE_CONFIGS.map(g => g.gate)).toEqual([1, 2, 3, 4]);
  });

  test('Gate 4 requires score >= 85', () => {
    const gate4 = GATE_CONFIGS.find(g => g.gate === 4);
    expect(gate4?.thresholds.passScore).toBe(85);
  });

  test('default pipeline targets coverage score 85', () => {
    expect(DEFAULT_PIPELINE_CONFIG.targetCoverageScore).toBe(85);
  });
});

describe('GateReviewOrchestrator', () => {
  const orchestrator = new GateReviewOrchestrator(mockLLM as never);

  test('reviews Gate 1 (Concept Gate)', async () => {
    const input: GateReviewInput = {
      projectId: 'bitsavior',
      gate: 1,
      scriptText: SAMPLE_SCRIPT,
    };

    const result = await orchestrator.review(input);
    expect(result.gate).toBe(1);
    expect(result.gateName).toBe('Concept Gate');
    expect(result.score).toBeGreaterThan(0);
    expect(['pass', 'revise', 'escalate']).toContain(result.decision);
    expect(result.timestamp).toBeTruthy();
  });

  test('reviews Gate 3 (Draft Gate) with full coverage', async () => {
    const input: GateReviewInput = {
      projectId: 'bitsavior',
      gate: 3,
      scriptText: SAMPLE_SCRIPT,
    };

    const result = await orchestrator.review(input);
    expect(result.gate).toBe(3);
    expect(result.gateName).toBe('Draft Gate');
    expect(result.coverage).toBeTruthy();
    expect(result.relevantCategories.length).toBeGreaterThan(0);
  });

  test('Gate 4 requires score >= 85 — score 75 results in revise', async () => {
    const input: GateReviewInput = {
      projectId: 'bitsavior',
      gate: 4,
      scriptText: SAMPLE_SCRIPT,
    };

    const result = await orchestrator.review(input);
    expect(result.gate).toBe(4);
    expect(result.decision).toBe('revise');
    expect(result.score).toBeLessThan(85);
  });
});

describe('WriterScorecard', () => {
  test('tracks gate results and computes metrics', () => {
    const scorecard = new WriterScorecard();

    scorecard.record({
      projectId: 'bitsavior',
      gate: 1,
      gateName: 'Concept Gate',
      decision: 'pass',
      score: 82,
      relevantCategories: [],
      feedback: ['Strong hook'],
      revisionCount: 0,
      timestamp: new Date().toISOString(),
    });

    scorecard.record({
      projectId: 'bitsavior',
      gate: 2,
      gateName: 'Structure Gate',
      decision: 'revise',
      score: 65,
      relevantCategories: [],
      feedback: ['Needs better pacing'],
      revisionCount: 1,
      timestamp: new Date().toISOString(),
    });

    const score = scorecard.getScore('bitsavior');
    expect(score.projectId).toBe('bitsavior');
    expect(score.gateResults).toHaveLength(2);
    expect(score.totalRevisions).toBe(1);
    expect(score.gatePassRate).toBe(50);
    expect(score.productionReady).toBe(false);
  });
});

describe('RevisionLoop', () => {
  test('passes through when score meets threshold', async () => {
    const highScoreLLM = {
      ...mockLLM,
      generateText: async (_sys: string, _user: string) => ({
        ...await mockLLM.generateText(_sys, _user),
        content: JSON.stringify({
          ...(JSON.parse((await mockLLM.generateText(_sys, _user)).content)),
          overallScore: 90,
          verdict: 'Recommend',
          categories: (JSON.parse((await mockLLM.generateText(_sys, _user)).content)).categories.map(
            (c: Record<string, unknown>) => ({ ...c, score: 90 })
          ),
        }),
      }),
    };

    const orch = new GateReviewOrchestrator(highScoreLLM as never);
    const loop = new RevisionLoop(orch);

    const result = await loop.run(
      { projectId: 'bitsavior', gate: 1, scriptText: SAMPLE_SCRIPT },
      async () => SAMPLE_SCRIPT,
    );

    expect(result.decision).toBe('pass');
  });
});
