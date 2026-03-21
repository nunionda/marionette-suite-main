import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import {
  parseFountain,
  parsePdfBuffer,
  LLMFactory,
  CharacterAnalyzer,
  BeatSheetGenerator,
  EmotionAnalyzer,
  FeatureExtractor,
  BoxOfficePredictor,
  ContentRatingClassifier,
  Benchmarker,
  ScriptCoverageEvaluator,
  ProductionAnalyzer,
  VFXEstimator,
  BudgetEstimator,
  NarrativeArcClassifier,
  env,
  resolveStrategy,
  type AnalysisStrategyName,
  type CustomStrategyInput,
  type EngineName,
  type ILLMProvider,
} from "@scenario-analysis/core";
import { AnalysisReportRepository } from "@scenario-analysis/database";

const reportRepo = new AnalysisReportRepository();

const app = new Elysia()
  .use(cors())
  .get("/", () => ({ status: "online", version: "1.0.0" }))

  // Available providers and strategies for dashboard UI
  .get("/providers", () => ({
    available: {
      gemini: !!env.GEMINI_API_KEY,
      anthropic: !!env.ANTHROPIC_API_KEY,
      openai: !!env.OPENAI_API_KEY,
      mock: true,
    },
    strategies: [
      { name: 'auto', label: 'Auto', description: 'Best available provider with fallback' },
      { name: 'fast', label: 'Fast', description: 'Gemini Flash only (low cost)', requires: ['gemini'] },
      { name: 'deep', label: 'Deep Analysis', description: 'Claude for narrative, Gemini for metrics', requires: ['anthropic'] },
      { name: 'custom', label: 'Custom', description: 'Pick provider per engine' },
    ],
  }))

  .post("/analyze", async ({ body }) => {
    const { scriptText, scriptBase64, isPdf, movieId, strategy, customProviders } = body as {
      scriptText?: string; scriptBase64?: string; isPdf?: boolean; movieId?: string;
      strategy?: AnalysisStrategyName; customProviders?: CustomStrategyInput;
    };
    const scriptId = movieId || `script-${Date.now()}`;

    console.log(`🎬 Starting analysis for: ${scriptId} (strategy: ${strategy || 'auto'})`);

    // 1. Parse (PDF or plain text)
    const elements = isPdf && scriptBase64
      ? await parsePdfBuffer(Buffer.from(scriptBase64, 'base64'))
      : parseFountain(scriptText || '');

    // 2. Initialize Core Services
    const factory = new LLMFactory();
    const characterAnalyzer = new CharacterAnalyzer();
    const featureExtractor = new FeatureExtractor();
    const benchmarker = new Benchmarker();

    // 3. Resolve strategy → per-engine provider mapping
    const resolved = resolveStrategy(strategy || 'auto', customProviders);
    const mockProvider = factory.getProvider('mock');

    function getEngineProvider(engine: EngineName): ILLMProvider {
      try {
        return factory.getProvider(resolved.engineProviders[engine]);
      } catch {
        return mockProvider;
      }
    }

    // Helper: run engine with its assigned provider, fallback to mock on failure
    async function withFallback<T>(
      engine: EngineName,
      label: string,
      fn: (p: ILLMProvider) => Promise<T>,
    ): Promise<{ data: T; fallback: boolean; provider: string }> {
      const provider = getEngineProvider(engine);
      try {
        return { data: await fn(provider), fallback: false, provider: provider.name };
      } catch (err: any) {
        if (provider.name !== 'mock') {
          console.warn(`⚠️ ${label} failed with ${provider.name} (${err.message?.slice(0, 80)}), using mock fallback`);
          return { data: await fn(mockProvider), fallback: true, provider: 'mock' };
        }
        throw err;
      }
    }

    // 4. Run Pipeline
    const network = characterAnalyzer.analyze(scriptId, elements);

    const [beatsResult, emotionResult, ratingResult] = await Promise.all([
      withFallback('beatSheet', 'BeatSheet', (p) => new BeatSheetGenerator(p).generate(scriptId, elements)),
      withFallback('emotion', 'Emotion', (p) => new EmotionAnalyzer(p).analyze(scriptId, elements)),
      withFallback('rating', 'Rating', (p) => new ContentRatingClassifier(p).classify(scriptId, elements)),
    ]);

    const beats = beatsResult.data;
    const emotion = emotionResult.data;
    const mpaaRating = ratingResult.data;

    // Mock Market data for now
    const mockMarket = { budget: 50000000, revenue: 0, genres: ["Action", "Sci-Fi"], topCast: [] };

    const features = featureExtractor.extract(scriptId, elements, {
      characterNetwork: network,
      beatSheet: beats,
      emotionGraph: emotion
    }, mockMarket as any);

    const roiResult = await withFallback('roi', 'ROI', (p) => new BoxOfficePredictor(p).predictROI(features));
    const roiPrediction = roiResult.data;
    const similarity = benchmarker.findComps(features);

    // 5. Script Coverage Evaluation (comprehensive scoring)
    const coverageResult = await withFallback('coverage', 'Coverage', (p) =>
      new ScriptCoverageEvaluator(p).evaluate(scriptId, elements, {
        beats: beats.beats,
        emotions: emotion.scenes,
        characters: network.characters,
        roi: roiPrediction,
        rating: mpaaRating,
        comps: similarity.topComps,
      })
    );
    const coverage = coverageResult.data;

    // 6. Narrative Arc Classification (uses emotion data)
    const emotionProvider = getEngineProvider('emotion');
    const narrativeArcClassifier = new NarrativeArcClassifier(emotionProvider);
    let narrativeArc;
    try {
      narrativeArc = await narrativeArcClassifier.classify(
        scriptId, emotion.scenes, coverage?.genre
      );
    } catch (err: any) {
      console.warn(`⚠️ NarrativeArc failed (${err.message?.slice(0, 80)}), using mock fallback`);
      const mockArcClassifier = new NarrativeArcClassifier(mockProvider);
      narrativeArc = await mockArcClassifier.classify(scriptId, emotion.scenes, coverage?.genre);
    }

    // 7. Production Feasibility Analysis
    const productionAnalyzer = new ProductionAnalyzer();
    const locations = productionAnalyzer.analyzeLocations(elements);
    const cast = productionAnalyzer.analyzeCast(elements, network.characters);
    const intExtRatio = productionAnalyzer.computeIntExtRatio(locations);
    const sceneCount = elements.filter(e => e.type === 'scene_heading').length;
    const estimatedShootingDays = productionAnalyzer.estimateShootingDays(sceneCount);

    const vfxResult = await withFallback('vfx', 'VFX', (p) =>
      new VFXEstimator(p).estimate(scriptId, elements)
    );
    const vfx = vfxResult.data;

    const budgetEstimator = new BudgetEstimator();
    const budgetEstimate = budgetEstimator.estimate(locations, cast, vfx.requirements, estimatedShootingDays);

    const production = {
      scriptId,
      locations,
      uniqueLocationCount: locations.length,
      intExtRatio,
      cast,
      totalSpeakingRoles: cast.length,
      estimatedShootingDays,
      vfxRequirements: vfx.requirements,
      vfxComplexityScore: vfx.complexityScore,
      budgetEstimate,
    };

    const usedFallback = beatsResult.fallback || emotionResult.fallback || ratingResult.fallback || roiResult.fallback || coverageResult.fallback || vfxResult.fallback;

    const result = {
      scriptId,
      summary: {
        totalElements: elements.length,
        protagonist: network.characters[0]?.name,
        predictedRoi: roiPrediction.tier,
        predictedRating: mpaaRating.rating
      },
      characterNetwork: {
        characters: network.characters,
        edges: network.edges,
        diversityMetrics: network.diversityMetrics,
      },
      beatSheet: beats.beats,
      emotionGraph: emotion.scenes,
      features: features.metrics,
      predictions: {
        roi: roiPrediction,
        rating: mpaaRating,
        comps: similarity.topComps
      },
      coverage,
      narrativeArc,
      production,
      strategy: resolved.name,
      providers: {
        beatSheet: beatsResult.provider,
        emotion: emotionResult.provider,
        rating: ratingResult.provider,
        roi: roiResult.provider,
        coverage: coverageResult.provider,
        vfx: vfxResult.provider,
      },
      ...(usedFallback && { warning: 'Some results used mock fallback due to LLM rate limits' }),
    };

    await reportRepo.save(result);
    return result;
  }, {
    body: t.Object({
      scriptText: t.Optional(t.String()),
      scriptBase64: t.Optional(t.String()),
      isPdf: t.Optional(t.Boolean()),
      movieId: t.Optional(t.String()),
      strategy: t.Optional(t.Union([
        t.Literal('auto'), t.Literal('fast'), t.Literal('deep'), t.Literal('custom')
      ])),
      customProviders: t.Optional(t.Object({
        beatSheet: t.Optional(t.Union([t.Literal('gemini'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('mock')])),
        emotion: t.Optional(t.Union([t.Literal('gemini'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('mock')])),
        rating: t.Optional(t.Union([t.Literal('gemini'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('mock')])),
        roi: t.Optional(t.Union([t.Literal('gemini'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('mock')])),
        coverage: t.Optional(t.Union([t.Literal('gemini'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('mock')])),
        vfx: t.Optional(t.Union([t.Literal('gemini'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('mock')])),
      })),
    })
  })

  .get("/report/:id", async ({ params: { id } }) => {
    const report = await reportRepo.findByScriptId(id);
    if (!report) return { error: "Report not found" };
    return report;
  })

  .get("/reports", async ({ query }) => {
    const page = Number(query.page) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    return reportRepo.findAll(page, pageSize);
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      pageSize: t.Optional(t.String())
    })
  })

  .listen(4005);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
