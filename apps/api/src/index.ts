import { Elysia, t } from "elysia";
import { 
  parseFountain, 
  LLMFactory, 
  CharacterAnalyzer, 
  BeatSheetGenerator, 
  EmotionAnalyzer, 
  FeatureExtractor, 
  BoxOfficePredictor, 
  ContentRatingClassifier, 
  Benchmarker,
  env
} from "@scenario-analysis/core";

// In-memory store for analysis results (Phase 4 MVP)
const analysisStore = new Map<string, any>();

const app = new Elysia()
  .get("/", () => ({ status: "online", version: "1.0.0" }))
  
  .post("/analyze", async ({ body }) => {
    const { scriptText, movieId } = body as { scriptText: string, movieId?: string };
    const scriptId = movieId || `script-${Date.now()}`;
    
    console.log(`🎬 Starting API Orchestration for: ${scriptId}`);

    // 1. Parse
    const elements = parseFountain(scriptText);
    
    // 2. Initialize Core Services
    const factory = new LLMFactory();
    const characterAnalyzer = new CharacterAnalyzer();
    const featureExtractor = new FeatureExtractor();
    const benchmarker = new Benchmarker();

    // Provider selection (using Gemini as default for this run if available)
    const provider = env.GEMINI_API_KEY ? factory.getProvider('gemini') : factory.getProvider('anthropic');
    
    const beatGenerator = new BeatSheetGenerator(provider);
    const emotionAnalyzer = new EmotionAnalyzer(provider);
    const boxOfficePredictor = new BoxOfficePredictor(provider);
    const ratingClassifier = new ContentRatingClassifier(provider);

    // 3. Run Pipeline
    const network = characterAnalyzer.analyze(scriptId, elements);
    const [beats, emotion, mpaaRating] = await Promise.all([
      beatGenerator.generate(scriptId, elements),
      emotionAnalyzer.analyze(scriptId, elements),
      ratingClassifier.classify(scriptId, elements)
    ]);

    // Mock Market data for now (In Phase 4 we'd fetch this from DB/TMDB)
    const mockMarket = { budget: 50000000, revenue: 0, genres: ["Action", "Sci-Fi"], topCast: [] };

    const features = featureExtractor.extract(scriptId, elements, { 
      characterNetwork: network, 
      beatSheet: beats, 
      emotionGraph: emotion 
    }, mockMarket as any);

    const roiPrediction = await boxOfficePredictor.predictROI(features);
    const similarity = benchmarker.findComps(features);

    const result = {
      scriptId,
      summary: {
        totalElements: elements.length,
        protagonist: network.characters[0]?.name,
        predictedRoi: roiPrediction.tier,
        predictedRating: mpaaRating.rating
      },
      characterNetwork: network.characters,
      beatSheet: beats.beats,
      emotionGraph: emotion.scenes,
      features: features.metrics,
      predictions: {
        roi: roiPrediction,
        rating: mpaaRating,
        comps: similarity.topComps
      }
    };

    analysisStore.set(scriptId, result);
    return result;
  }, {
    body: t.Object({
      scriptText: t.String(),
      movieId: t.Optional(t.String())
    })
  })
  
  .get("/report/:id", ({ params: { id } }) => {
    const report = analysisStore.get(id);
    if (!report) return { error: "Report not found" };
    return report;
  })

  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
