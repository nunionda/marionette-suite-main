// Theatrical Release — Sprint 11 #64 + #68
// 극장 개봉 계획 및 실행 현황

export type ReleasePhase = "planning" | "confirmed" | "in-release" | "completed";
export type TheaterChain = "CGV" | "Lotte Cinema" | "Megabox" | "Art House" | "International";

export interface TheaterBooking {
  chain: TheaterChain;
  screenCount: number;
  openingWeekend?: number; // admissions
}

export interface TheatricalRelease {
  id: string;
  projectId: string;
  releaseTitle: string;
  targetReleaseDate?: string;
  actualReleaseDate?: string;
  territory: string;
  ratingCode?: string; // e.g. "15세이상관람가"
  phase: ReleasePhase;
  openingScreens?: number;
  totalAdmissions?: number;
  boxOfficeTotalKRW?: number;
  theaters?: TheaterBooking[];
  distributorKR?: string;
  note?: string;
}

export const mockTheatricalReleases: TheatricalRelease[] = [
  // ID-001 DECODE
  {
    id: "TR-001-KR",
    projectId: "ID-001",
    releaseTitle: "DECODE",
    targetReleaseDate: "2027-03-10",
    territory: "KR",
    ratingCode: "15세이상관람가",
    phase: "planning",
    distributorKR: "CGV Arthouse",
    theaters: [
      { chain: "CGV", screenCount: 280 },
      { chain: "Lotte Cinema", screenCount: 90 },
      { chain: "Megabox", screenCount: 70 },
    ],
    note: "봄 시즌 선점 — 3월 첫째 주 목표",
  },
  {
    id: "TR-001-US",
    projectId: "ID-001",
    releaseTitle: "DECODE",
    targetReleaseDate: "2027-04-18",
    territory: "US",
    phase: "planning",
    openingScreens: 12,
    note: "뉴욕/LA 플랫폼 릴리즈 후 확장",
  },
  // ID-002
  {
    id: "TR-002-KR",
    projectId: "ID-002",
    releaseTitle: "ID-002 TITLE TBD",
    targetReleaseDate: "2027-06-20",
    territory: "KR",
    phase: "planning",
    note: "여름 시즌 개봉 목표",
  },
];

export function findTheatricalByProject(projectId: string): TheatricalRelease[] {
  return mockTheatricalReleases.filter((t) => t.projectId === projectId);
}

export const PHASE_COLOR: Record<ReleasePhase, string> = {
  planning: "#707070",
  confirmed: "#facc15",
  "in-release": "#60a5fa",
  completed: "#00FF41",
};

export const PHASE_LABEL: Record<ReleasePhase, string> = {
  planning: "기획",
  confirmed: "확정",
  "in-release": "개봉 중",
  completed: "종료",
};
