import type { ILLMProvider } from '@marionette/scenario-core';
import {
  parseFountain,
  CharacterAnalyzer,
  BeatSheetGenerator,
  EmotionAnalyzer,
  ScriptCoverageEvaluator,
  BoxOfficePredictor,
  ContentRatingClassifier,
  Benchmarker,
  FeatureExtractor,
} from '@marionette/scenario-core';
import type {
  GateNumber,
  GateConfig,
  GateReviewInput,
  GateReviewResult,
  GateDecision,
  PipelineConfig,
} from './types';
import { DEFAULT_PIPELINE_CONFIG } from './config';

export class GateReviewOrchestrator {
  private readonly coverageEvaluator: ScriptCoverageEvaluator;
  private readonly beatGenerator: BeatSheetGenerator;
  private readonly emotionAnalyzer: EmotionAnalyzer;
  private readonly characterAnalyzer: CharacterAnalyzer;
  private readonly boxOfficePredictor: BoxOfficePredictor;
  private readonly ratingClassifier: ContentRatingClassifier;
  private readonly featureExtractor: FeatureExtractor;
  private readonly benchmarker: Benchmarker;
  private readonly config: PipelineConfig;

  constructor(llm: ILLMProvider, config?: Partial<PipelineConfig>) {
    this.config = { ...DEFAULT_PIPELINE_CONFIG, ...config };
    this.coverageEvaluator = new ScriptCoverageEvaluator(llm);
    this.beatGenerator = new BeatSheetGenerator(llm);
    this.emotionAnalyzer = new EmotionAnalyzer(llm);
    this.characterAnalyzer = new CharacterAnalyzer();
    this.boxOfficePredictor = new BoxOfficePredictor(llm);
    this.ratingClassifier = new ContentRatingClassifier();
    this.featureExtractor = new FeatureExtractor();
    this.benchmarker = new Benchmarker();
  }

  async review(input: GateReviewInput, revisionCount = 0): Promise<GateReviewResult> {
    const gateConfig = this.getGateConfig(input.gate);
    const elements = parseFountain(input.scriptText);

    if (input.gate <= 2) {
      return this.reviewEarlyGate(input, gateConfig, elements, revisionCount);
    }

    return this.reviewFullGate(input, gateConfig, elements, revisionCount);
  }

  private async reviewEarlyGate(
    input: GateReviewInput,
    gateConfig: GateConfig,
    elements: ReturnType<typeof parseFountain>,
    revisionCount: number,
  ): Promise<GateReviewResult> {
    const network = this.characterAnalyzer.analyze(input.projectId, elements);
    const beats = await this.beatGenerator.generate(input.projectId, elements);
    const emotions = await this.emotionAnalyzer.analyze(input.projectId, elements);

    const mockRoi = { tier: 'Unknown', predictedMultiplier: 1, confidence: 0, reasoning: 'Early gate — no ROI data' };
    const mockRating = { rating: 'NR', reasons: ['Early gate'], confidence: 0 };
    const mockComps: { title: string; similarityScore: number; sharedTraits: string[] }[] = [];

    const coverage = await this.coverageEvaluator.evaluate(
      input.projectId,
      elements,
      {
        beats: beats.beats,
        emotions: emotions.scenes,
        characters: network.characters,
        roi: mockRoi,
        rating: mockRating,
        comps: mockComps,
      },
    );

    const requiredCategories = gateConfig.thresholds.requiredCategories ?? [];
    const relevantCategories = requiredCategories.length > 0
      ? coverage.categories.filter(c => requiredCategories.includes(c.name))
      : coverage.categories;

    const score = relevantCategories.length > 0
      ? relevantCategories.reduce((sum, c) => sum + c.score, 0) / relevantCategories.length
      : coverage.overallScore;

    const decision = this.decide(score, gateConfig, revisionCount);

    return {
      projectId: input.projectId,
      gate: input.gate,
      gateName: gateConfig.name,
      decision,
      score: Math.round(score),
      coverage,
      relevantCategories,
      feedback: decision === 'pass' ? coverage.strengths : coverage.weaknesses,
      revisionCount,
      timestamp: new Date().toISOString(),
    };
  }

  private async reviewFullGate(
    input: GateReviewInput,
    gateConfig: GateConfig,
    elements: ReturnType<typeof parseFountain>,
    revisionCount: number,
  ): Promise<GateReviewResult> {
    const network = this.characterAnalyzer.analyze(input.projectId, elements);
    const beats = await this.beatGenerator.generate(input.projectId, elements);
    const emotions = await this.emotionAnalyzer.analyze(input.projectId, elements);

    const mockMarket = { budget: 50000000, revenue: 0, genres: ['Thriller', 'Sci-Fi'] };
    const features = this.featureExtractor.extract(
      input.projectId,
      elements,
      { characterNetwork: network, beatSheet: beats, emotionGraph: emotions },
      mockMarket as never,
    );

    const roi = await this.boxOfficePredictor.predictROI(features);
    const rating = await this.ratingClassifier.classify(input.projectId, elements);
    const similarity = this.benchmarker.findComps(features);

    const coverage = await this.coverageEvaluator.evaluate(
      input.projectId,
      elements,
      {
        beats: beats.beats,
        emotions: emotions.scenes,
        characters: network.characters,
        roi,
        rating,
        comps: similarity.topComps,
      },
    );

    const decision = this.decide(coverage.overallScore, gateConfig, revisionCount);

    return {
      projectId: input.projectId,
      gate: input.gate,
      gateName: gateConfig.name,
      decision,
      score: coverage.overallScore,
      coverage,
      relevantCategories: coverage.categories,
      feedback: decision === 'pass' ? coverage.strengths : coverage.weaknesses,
      revisionCount,
      timestamp: new Date().toISOString(),
    };
  }

  private decide(score: number, gateConfig: GateConfig, revisionCount: number): GateDecision {
    if (score >= gateConfig.thresholds.passScore) {
      return 'pass';
    }
    if (revisionCount >= gateConfig.thresholds.escalateAfterRevisions) {
      return 'escalate';
    }
    return 'revise';
  }

  private getGateConfig(gate: GateNumber): GateConfig {
    const config = this.config.gates.find(g => g.gate === gate);
    if (!config) {
      throw new Error(`No configuration found for Gate ${gate}`);
    }
    return config;
  }
}
