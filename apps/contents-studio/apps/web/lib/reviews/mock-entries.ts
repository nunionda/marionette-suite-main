// Reviews & Reception module — Sprint 8 #72
// Mock data. Later: scrape/integrate with Naver/Watcha/Rotten Tomatoes/MetaCritic.

export type ReviewSource =
  | "critic_press" // 전문 평론지 (Cine21, Hollywood Reporter)
  | "critic_aggregator" // Rotten Tomatoes, MetaCritic
  | "audience_portal" // Naver, Watcha, Daum
  | "social" // Twitter/Threads/Letterboxd
  | "festival_jury"; // 영화제 심사위원 코멘트

export type Sentiment = "positive" | "mixed" | "negative";

export interface ReviewEntry {
  id: string;
  projectId: string; // paperclipId
  source: ReviewSource;
  outlet: string; // "Cine21", "Naver Movie", etc.
  reviewer?: string;
  score: number | null; // normalized to 0-10 scale
  maxScore: number; // original scale (e.g. 5 for Naver, 100 for MetaCritic)
  publishedAt: string; // ISO
  sentiment: Sentiment;
  headline?: string;
  excerpt?: string;
  url?: string;
}

export const mockReviewEntries: ReviewEntry[] = [
  // ID-001 DECODE — post-release, strong critical reception
  {
    id: "REV-001-01",
    projectId: "ID-001",
    source: "critic_press",
    outlet: "Cine21",
    reviewer: "이동진",
    score: 8.0,
    maxScore: 10,
    publishedAt: "2026-04-04",
    sentiment: "positive",
    headline: "코드의 공포를 인간의 얼굴로 환원하다",
    excerpt:
      "치밀한 구조와 절제된 연출이 돋보이는 수작. 마지막 20분의 긴장감은 올해 최고.",
  },
  {
    id: "REV-001-02",
    projectId: "ID-001",
    source: "critic_press",
    outlet: "씨네21",
    reviewer: "김혜리",
    score: 7.5,
    maxScore: 10,
    publishedAt: "2026-04-05",
    sentiment: "positive",
    headline: "한국형 테크노-스릴러의 새로운 가능성",
    excerpt: "시나리오의 정교함이 배우들의 앙상블을 받쳐준다.",
  },
  {
    id: "REV-001-03",
    projectId: "ID-001",
    source: "critic_aggregator",
    outlet: "Rotten Tomatoes",
    score: 8.2,
    maxScore: 10,
    publishedAt: "2026-04-10",
    sentiment: "positive",
    headline: "Certified Fresh · 87% · 34 reviews",
  },
  {
    id: "REV-001-04",
    projectId: "ID-001",
    source: "audience_portal",
    outlet: "Naver Movie",
    score: 8.6, // Naver 4.3/5 → 8.6/10
    maxScore: 10,
    publishedAt: "2026-04-15",
    sentiment: "positive",
    headline: "관객 평점 4.3/5 (18,420명)",
  },
  {
    id: "REV-001-05",
    projectId: "ID-001",
    source: "audience_portal",
    outlet: "Watcha",
    score: 8.0,
    maxScore: 10,
    publishedAt: "2026-04-15",
    sentiment: "positive",
    headline: "왓챠 평점 4.0/5 (2,341명)",
  },
  {
    id: "REV-001-06",
    projectId: "ID-001",
    source: "social",
    outlet: "Letterboxd",
    score: 7.4,
    maxScore: 10,
    publishedAt: "2026-04-16",
    sentiment: "positive",
    headline: "3.7/5 avg from 1,240 logs",
  },
  {
    id: "REV-001-07",
    projectId: "ID-001",
    source: "critic_press",
    outlet: "The Hollywood Reporter",
    reviewer: "David Rooney",
    score: 7.0,
    maxScore: 10,
    publishedAt: "2026-04-12",
    sentiment: "mixed",
    headline: "A stylish thriller that occasionally outsmarts itself",
    excerpt:
      "Technically impressive but the emotional core sometimes gets lost in the plot's intricate wiring.",
  },
  {
    id: "REV-001-08",
    projectId: "ID-001",
    source: "critic_press",
    outlet: "Variety",
    reviewer: "Peter Debruge",
    score: 6.5,
    maxScore: 10,
    publishedAt: "2026-04-13",
    sentiment: "mixed",
    headline: "Compelling setup, uneven payoff",
  },
  // ID-002 — not yet released, festival jury preview only
  {
    id: "REV-002-01",
    projectId: "ID-002",
    source: "festival_jury",
    outlet: "Busan IFF 심사위원단 코멘트",
    score: null,
    maxScore: 10,
    publishedAt: "2026-04-10",
    sentiment: "positive",
    headline: "깊이 있는 서사와 섬세한 연기",
    excerpt: "뉴 커런츠 부문 유력 후보작.",
  },
];

export function findReviewsByProject(projectId: string): ReviewEntry[] {
  return mockReviewEntries
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function computeReviewSummary(entries: ReviewEntry[]) {
  const total = entries.length;
  const scored = entries.filter((e): e is ReviewEntry & { score: number } => e.score !== null);
  const avgScore = scored.length > 0
    ? scored.reduce((acc, e) => acc + e.score, 0) / scored.length
    : null;

  const critics = entries.filter(
    (e) => e.source === "critic_press" || e.source === "critic_aggregator",
  );
  const criticsScored = critics.filter((e): e is ReviewEntry & { score: number } => e.score !== null);
  const criticsAvg = criticsScored.length > 0
    ? criticsScored.reduce((acc, e) => acc + e.score, 0) / criticsScored.length
    : null;

  const audience = entries.filter((e) => e.source === "audience_portal");
  const audienceScored = audience.filter((e): e is ReviewEntry & { score: number } => e.score !== null);
  const audienceAvg = audienceScored.length > 0
    ? audienceScored.reduce((acc, e) => acc + e.score, 0) / audienceScored.length
    : null;

  const positive = entries.filter((e) => e.sentiment === "positive").length;
  const mixed = entries.filter((e) => e.sentiment === "mixed").length;
  const negative = entries.filter((e) => e.sentiment === "negative").length;
  const positivePct = total > 0 ? Math.round((positive / total) * 100) : 0;

  return {
    total,
    avgScore: avgScore != null ? Math.round(avgScore * 10) / 10 : null,
    criticsAvg: criticsAvg != null ? Math.round(criticsAvg * 10) / 10 : null,
    audienceAvg: audienceAvg != null ? Math.round(audienceAvg * 10) / 10 : null,
    criticsCount: critics.length,
    audienceCount: audience.length,
    positive,
    mixed,
    negative,
    positivePct,
  };
}
