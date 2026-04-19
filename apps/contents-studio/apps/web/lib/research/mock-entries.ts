// Research module — Charter #6
// Mock data. Future sprints will back this with a DB.

export type ResearchStatus = "not_started" | "in_progress" | "complete";

export interface ResearchCategory {
  category: string; // "Market", "Comparable Titles", "Subject Matter", "Technical", "Location"
  status: ResearchStatus;
  findings: string;
  sources: string[];
}

export interface ResearchEntry {
  projectId: string;
  overallStatus: ResearchStatus;
  marketSize?: string;
  comparableTitles: string[];
  categories: ResearchCategory[];
  updatedAt: string;
}

export const mockResearch: ResearchEntry[] = [
  {
    projectId: "ID-001",
    overallStatus: "complete",
    marketSize: "글로벌 Sci-Fi 박스오피스 2025: $12.4B — AI 소재 영화 CAGR 28%",
    comparableTitles: ["매트릭스 부활", "엑스 마키나", "서치", "론 워리어"],
    categories: [
      {
        category: "시장 조사",
        status: "complete",
        findings: "OTT + 극장 하이브리드 배급 모델이 Sci-Fi 장르에서 최고 ROI. Netflix/Disney+가 AI 소재 오리지널에 적극 투자 중.",
        sources: ["PwC Global Entertainment Report 2025", "Box Office Mojo"],
      },
      {
        category: "유사 작품 분석",
        status: "complete",
        findings: "비교작 5편 평균 제작비 $42M, 글로벌 수익 $210M (5x ROI). 국내 AI SF는 아직 블루오션.",
        sources: ["The Numbers", "KOFIC 2025 연차보고서"],
      },
      {
        category: "기술 조사",
        status: "complete",
        findings: "실사 + LED 볼륨 촬영 + AI 생성 하이브리드. LED 볼륨 국내 스튜디오 3곳 파악 완료.",
        sources: ["Virtual Production Field Guide v2", "한국콘텐츠진흥원"],
      },
    ],
    updatedAt: "2025-12-01T11:00:00Z",
  },
  {
    projectId: "ID-002",
    overallStatus: "in_progress",
    comparableTitles: ["플로렌스 + 더 머신 다큐", "아이돌: 더 쿠폰", "블랙미러 S6"],
    categories: [
      {
        category: "시장 조사",
        status: "complete",
        findings: "K-POP 글로벌 시장 2025: $12B. AI 아이돌 관련 콘텐츠 구독자 평균 2.3배 성장.",
        sources: ["Hanteo Global", "IFPI 2025"],
      },
      {
        category: "기술 조사",
        status: "in_progress",
        findings: "실시간 AI 퍼포먼스 캡처 기술 조사 중. HoloLens + Motion Capture 파이프라인 검토.",
        sources: [],
      },
    ],
    updatedAt: "2026-02-14T16:30:00Z",
  },
];

export function findResearchByProject(projectId: string): ResearchEntry | undefined {
  return mockResearch.find((r) => r.projectId === projectId);
}
