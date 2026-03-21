import type { AnalysisReport } from "@prisma/client";

export interface AnalysisResultInput {
  scriptId: string;
  summary: {
    totalElements: number;
    protagonist: string;
    predictedRoi: string;
    predictedRating: string;
  };
  characterNetwork: Array<{
    name: string;
    totalLines: number;
    totalWords: number;
    role: string;
  }>;
  beatSheet: Array<{
    act: number;
    name: string;
    sceneStart: number;
    sceneEnd: number;
    description: string;
  }>;
  emotionGraph: Array<{
    sceneNumber: number;
    score: number;
    dominantEmotion: string;
    explanation: string;
  }>;
  features: {
    sceneCount: number;
    characterCount: number;
    dialogueLineCount: number;
    actionLineCount: number;
    dialogueToActionRatio: number;
    averageWordsPerDialogue: number;
  };
  predictions: {
    roi: {
      tier: string;
      predictedMultiplier: number;
      confidence: number;
      reasoning: string;
    };
    rating: { rating: string; reasons: string[]; confidence: number };
    comps: Array<{
      title: string;
      similarityScore: number;
      sharedTraits: string[];
      marketPerformance: { budget: number; revenue: number; roi: number };
    }>;
  };
  coverage?: any;
  production?: any;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type { AnalysisReport };
