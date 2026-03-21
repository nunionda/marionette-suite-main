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
  TropeAnalyzer,
  env,
  resolveStrategy,
  type AnalysisStrategyName,
  type CustomStrategyInput,
  type EngineName,
  type ILLMProvider,
} from "@scenario-analysis/core";
import { AnalysisReportRepository } from "@scenario-analysis/database";

/* ─── Korean → Revised Romanization ─── */
const CHO  = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const JUNG = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const JONG = ['','k','k','k','n','n','n','t','l','l','l','l','l','l','l','l','m','p','p','t','t','ng','t','t','k','t','p','t'];

function romanizeKorean(text: string): string {
  let result = '';
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const off = code - 0xAC00;
      result += CHO[Math.floor(off / 588)] + JUNG[Math.floor((off % 588) / 28)] + JONG[off % 28];
    } else {
      result += ch;
    }
  }
  return result;
}

function hasKorean(text: string): boolean {
  return /[\uAC00-\uD7A3]/.test(text);
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const reportRepo = new AnalysisReportRepository();

const app = new Elysia()
  .use(cors())
  .get("/", () => ({ status: "online", version: "1.0.0" }))

  // Available providers and strategies for dashboard UI
  .get("/providers", () => ({
    available: {
      gemini: !!env.GEMINI_API_KEY,
      'gemini-pro': !!env.GEMINI_API_KEY,
      'gemini-long': !!env.GEMINI_API_KEY,
      anthropic: !!env.ANTHROPIC_API_KEY,
      openai: !!env.OPENAI_API_KEY,
      deepseek: !!env.DEEPSEEK_API_KEY,
      groq: !!env.GROQ_API_KEY,
      mock: true,
    },
    strategies: [
      { name: 'auto', label: 'Auto', description: 'Best available provider with fallback' },
      { name: 'fast', label: 'Fast', description: 'Gemini Flash only (low cost)', requires: ['gemini'] },
      { name: 'budget', label: 'Budget', description: 'Groq (free) + DeepSeek (cheapest)', requires: [] },
      { name: 'deep', label: 'Deep Analysis', description: 'Claude for narrative, Gemini for metrics', requires: ['anthropic'] },
      { name: 'premium', label: 'Premium', description: 'Claude Sonnet 4.6 for highest quality', requires: ['anthropic'] },
      { name: 'long-context', label: 'Long Context', description: 'Gemini 1.5 Pro (2M context) for long scripts', requires: ['gemini'] },
      { name: 'custom', label: 'Custom', description: 'Pick provider per engine' },
    ],
    markets: ['hollywood', 'korean'],
  }))

  .post("/analyze", async ({ body }) => {
    const { scriptText, scriptBase64, isPdf, movieId, fileName, strategy, customProviders, market: marketInput } = body as {
      scriptText?: string; scriptBase64?: string; isPdf?: boolean; movieId?: string;
      fileName?: string; strategy?: AnalysisStrategyName; customProviders?: CustomStrategyInput;
      market?: 'hollywood' | 'korean';
    };
    const market = marketInput || 'hollywood';
    const baseName = fileName ? fileName.replace(/\.[^.]+$/, '') : null;
    let scriptId: string;
    if (baseName) {
      if (hasKorean(baseName)) {
        const romanized = capitalizeFirst(romanizeKorean(baseName).replace(/[^a-zA-Z0-9]/g, ''));
        scriptId = `[${romanized}]${baseName}$`;
      } else {
        scriptId = `${baseName}$`;
      }
    } else {
      scriptId = movieId || `script-${Date.now()}`;
    }

    console.log(`🎬 Starting analysis for: ${scriptId} (strategy: ${strategy || 'auto'}, market: ${market})`);

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

    // Run LLM engines sequentially to avoid Gemini rate-limit exhaustion
    const beatsResult = await withFallback('beatSheet', 'BeatSheet', (p) => new BeatSheetGenerator(p).generate(scriptId, elements, market));
    const emotionResult = await withFallback('emotion', 'Emotion', (p) => new EmotionAnalyzer(p).analyze(scriptId, elements));
    const ratingResult = await withFallback('rating', 'Rating', (p) => new ContentRatingClassifier(p).classify(scriptId, elements, market));

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

    const roiResult = await withFallback('roi', 'ROI', (p) => new BoxOfficePredictor(p).predictROI(features, market));
    const roiPrediction = roiResult.data;

    // Trope Analysis (LLM)
    const tropeResult = await withFallback('trope', 'Trope', (p) =>
      new TropeAnalyzer(p).analyze(scriptId, elements, market)
    );
    const tropes = tropeResult.data.tropes;

    const similarity = benchmarker.findComps(features, tropes, market);

    // 5. Script Coverage Evaluation (comprehensive scoring)
    const coverageResult = await withFallback('coverage', 'Coverage', (p) =>
      new ScriptCoverageEvaluator(p).evaluate(scriptId, elements, {
        beats: beats.beats,
        emotions: emotion.scenes,
        characters: network.characters,
        roi: roiPrediction,
        rating: mpaaRating,
        comps: similarity.topComps,
      }, market)
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
      new VFXEstimator(p).estimate(scriptId, elements, market)
    );
    const vfx = vfxResult.data;

    const budgetEstimator = new BudgetEstimator();
    const budgetEstimate = budgetEstimator.estimate(locations, cast, vfx.requirements, estimatedShootingDays, market);

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

    const mockEngines = [
      beatsResult.fallback && 'Beat Sheet',
      emotionResult.fallback && 'Emotion',
      ratingResult.fallback && 'Rating',
      roiResult.fallback && 'ROI',
      coverageResult.fallback && 'Coverage',
      vfxResult.fallback && 'VFX',
      tropeResult.fallback && 'Trope',
    ].filter(Boolean) as string[];

    const result = {
      scriptId,
      market,
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
      tropes,
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
        trope: tropeResult.provider,
      },
      ...(mockEngines.length > 0 && {
        warning: `Mock placeholder data used for: ${mockEngines.join(', ')}. These results are not actual AI analysis.`,
        mockEngines,
      }),
    };

    await reportRepo.save(result);
    return result;
  }, {
    body: t.Object({
      scriptText: t.Optional(t.String()),
      scriptBase64: t.Optional(t.String()),
      isPdf: t.Optional(t.Boolean()),
      movieId: t.Optional(t.String()),
      fileName: t.Optional(t.String()),
      market: t.Optional(t.Union([t.Literal('hollywood'), t.Literal('korean')])),
      strategy: t.Optional(t.Union([
        t.Literal('auto'), t.Literal('fast'), t.Literal('deep'), t.Literal('custom'),
        t.Literal('budget'), t.Literal('premium'), t.Literal('long-context')
      ])),
      customProviders: t.Optional(t.Object({
        beatSheet: t.Optional(t.Union([t.Literal('gemini'), t.Literal('gemini-pro'), t.Literal('gemini-long'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('deepseek'), t.Literal('groq'), t.Literal('mock')])),
        emotion: t.Optional(t.Union([t.Literal('gemini'), t.Literal('gemini-pro'), t.Literal('gemini-long'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('deepseek'), t.Literal('groq'), t.Literal('mock')])),
        rating: t.Optional(t.Union([t.Literal('gemini'), t.Literal('gemini-pro'), t.Literal('gemini-long'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('deepseek'), t.Literal('groq'), t.Literal('mock')])),
        roi: t.Optional(t.Union([t.Literal('gemini'), t.Literal('gemini-pro'), t.Literal('gemini-long'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('deepseek'), t.Literal('groq'), t.Literal('mock')])),
        coverage: t.Optional(t.Union([t.Literal('gemini'), t.Literal('gemini-pro'), t.Literal('gemini-long'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('deepseek'), t.Literal('groq'), t.Literal('mock')])),
        vfx: t.Optional(t.Union([t.Literal('gemini'), t.Literal('gemini-pro'), t.Literal('gemini-long'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('deepseek'), t.Literal('groq'), t.Literal('mock')])),
        trope: t.Optional(t.Union([t.Literal('gemini'), t.Literal('gemini-pro'), t.Literal('gemini-long'), t.Literal('anthropic'), t.Literal('openai'), t.Literal('deepseek'), t.Literal('groq'), t.Literal('mock')])),
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

  .post("/translate", async ({ body }) => {
    const { report, targetLanguage, strategy: strat } = body as {
      report: any; targetLanguage: string; strategy?: AnalysisStrategyName;
    };

    if (targetLanguage !== 'ko') {
      return report; // only Korean translation supported for now
    }

    console.log(`🌐 Translating report ${report.scriptId} → ${targetLanguage}`);

    // Extract translatable text fields into a structured object
    const translatable: Record<string, any> = {};

    if (report.coverage) {
      translatable.coverage = {
        synopsis: report.coverage.synopsis || '',
        logline: report.coverage.logline || '',
        strengths: report.coverage.strengths || [],
        weaknesses: report.coverage.weaknesses || [],
        recommendation: report.coverage.recommendation || '',
        categories: (report.coverage.categories || []).map((cat: any) => ({
          name: cat.name,
          subcategories: (cat.subcategories || []).map((sub: any) => ({
            name: sub.name,
            assessment: sub.assessment || '',
          })),
        })),
      };
    }

    if (report.beatSheet) {
      translatable.beatSheet = (report.beatSheet || []).map((b: any) => ({
        name: b.name,
        description: b.description || '',
      }));
    }

    if (report.emotionGraph) {
      translatable.emotionGraph = (report.emotionGraph || []).map((e: any) => ({
        dominantEmotion: e.dominantEmotion || '',
        explanation: e.explanation || '',
      }));
    }

    if (report.narrativeArc) {
      translatable.narrativeArc = {
        arcDescription: report.narrativeArc.arcDescription || '',
        pacingIssues: (report.narrativeArc.pacingIssues || []).map((p: any) => ({
          description: p.description || '',
        })),
        genreFitDeviation: report.narrativeArc.genreFit?.deviation || '',
      };
    }

    if (report.predictions) {
      translatable.predictions = {
        roiReasoning: report.predictions.roi?.reasoning || '',
        ratingReasons: report.predictions.rating?.reasons || [],
      };
    }

    if (report.tropes) {
      translatable.tropes = report.tropes || [];
    }

    // Single LLM call for all translations
    const factory = new LLMFactory();
    const resolved = resolveStrategy(strat || 'auto');
    let provider: ILLMProvider;
    try {
      provider = factory.getProvider(resolved.engineProviders.coverage);
    } catch {
      provider = factory.getProvider('mock');
    }

    const systemPrompt = `You are a professional Korean translator specializing in the film and entertainment industry.
Translate ALL string values in the provided JSON to Korean.
Rules:
- Preserve the JSON structure and keys EXACTLY as-is (do not translate keys).
- Keep proper nouns (character names, movie titles) in their original form.
- Keep technical abbreviations (VFX, CGI, SFX) unchanged.
- Keep numbers unchanged.
- Translate film industry terms naturally: e.g., "Inciting Incident" → "사건의 발단", "Climax" → "클라이맥스", "Rising Action" → "상승 액션".
- For emotion names: "Tension" → "긴장", "Fear" → "공포", "Joy" → "기쁨", "Sadness" → "슬픔", "Anger" → "분노", "Hope" → "희망", "Surprise" → "놀라움", etc.
- Return ONLY the translated JSON object, no markdown or explanation.`;

    const userPrompt = JSON.stringify(translatable, null, 2);

    try {
      const response = await provider.generateText(systemPrompt, userPrompt);
      // Strip markdown code fences if LLM wraps response (common with Gemini)
      let content = response.content.trim();
      if (content.startsWith('```')) {
        content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      const translated = JSON.parse(content);

      // Merge translated fields back into report
      const result = JSON.parse(JSON.stringify(report)); // deep clone

      if (translated.coverage && result.coverage) {
        result.coverage.synopsis = translated.coverage.synopsis;
        result.coverage.logline = translated.coverage.logline;
        result.coverage.strengths = translated.coverage.strengths;
        result.coverage.weaknesses = translated.coverage.weaknesses;
        result.coverage.recommendation = translated.coverage.recommendation;
        if (translated.coverage.categories) {
          translated.coverage.categories.forEach((tCat: any, ci: number) => {
            if (result.coverage.categories?.[ci]?.subcategories) {
              tCat.subcategories?.forEach((tSub: any, si: number) => {
                if (result.coverage.categories[ci].subcategories[si]) {
                  result.coverage.categories[ci].subcategories[si].assessment = tSub.assessment;
                }
              });
            }
          });
        }
      }

      if (translated.beatSheet && result.beatSheet) {
        translated.beatSheet.forEach((tBeat: any, i: number) => {
          if (result.beatSheet[i]) {
            result.beatSheet[i].description = tBeat.description;
          }
        });
      }

      if (translated.emotionGraph && result.emotionGraph) {
        translated.emotionGraph.forEach((tEmo: any, i: number) => {
          if (result.emotionGraph[i]) {
            result.emotionGraph[i].dominantEmotion = tEmo.dominantEmotion;
            result.emotionGraph[i].explanation = tEmo.explanation;
          }
        });
      }

      if (translated.narrativeArc && result.narrativeArc) {
        result.narrativeArc.arcDescription = translated.narrativeArc.arcDescription;
        if (translated.narrativeArc.pacingIssues) {
          translated.narrativeArc.pacingIssues.forEach((tP: any, i: number) => {
            if (result.narrativeArc.pacingIssues?.[i]) {
              result.narrativeArc.pacingIssues[i].description = tP.description;
            }
          });
        }
        if (result.narrativeArc.genreFit) {
          result.narrativeArc.genreFit.deviation = translated.narrativeArc.genreFitDeviation;
        }
      }

      if (translated.predictions && result.predictions) {
        if (result.predictions.roi) {
          result.predictions.roi.reasoning = translated.predictions.roiReasoning;
        }
        if (result.predictions.rating) {
          result.predictions.rating.reasons = translated.predictions.ratingReasons;
        }
      }

      if (translated.tropes) {
        result.tropes = translated.tropes;
      }

      console.log(`✅ Translation complete (${provider.name})`);
      return result;
    } catch (err: any) {
      console.warn(`⚠️ Translation failed (${err.message?.slice(0, 80)}), returning original`);
      return report;
    }
  }, {
    body: t.Object({
      report: t.Any(),
      targetLanguage: t.String(),
      strategy: t.Optional(t.Union([
        t.Literal('auto'), t.Literal('fast'), t.Literal('deep'), t.Literal('custom')
      ])),
    })
  })

  .listen(4005);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
