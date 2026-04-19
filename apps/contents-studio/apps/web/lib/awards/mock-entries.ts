// Awards Campaign — Sprint 11 #73
// 시상식 캠페인 계획 및 현황

export type AwardStatus = "tracking" | "submitted" | "shortlisted" | "nominated" | "won" | "not-won";
export type AwardCategory =
  | "best-film"
  | "best-director"
  | "best-screenplay"
  | "best-actor"
  | "best-actress"
  | "best-supporting"
  | "best-cinematography"
  | "best-editing"
  | "best-score"
  | "best-vfx"
  | "best-international";

export interface AwardEntry {
  id: string;
  projectId: string;
  ceremony: string; // e.g. "대종상", "청룡영화상", "Academy Awards"
  year: number;
  category: AwardCategory;
  campaignBudgetKRW?: number;
  status: AwardStatus;
  screeningDate?: string;
  resultDate?: string;
  note?: string;
}

export const mockAwardEntries: AwardEntry[] = [
  // ID-001 DECODE
  {
    id: "AW-001-01",
    projectId: "ID-001",
    ceremony: "청룡영화상",
    year: 2027,
    category: "best-film",
    campaignBudgetKRW: 50_000_000,
    status: "submitted",
    screeningDate: "2027-09-15",
  },
  {
    id: "AW-001-02",
    projectId: "ID-001",
    ceremony: "청룡영화상",
    year: 2027,
    category: "best-director",
    status: "submitted",
  },
  {
    id: "AW-001-03",
    projectId: "ID-001",
    ceremony: "청룡영화상",
    year: 2027,
    category: "best-cinematography",
    status: "submitted",
  },
  {
    id: "AW-001-04",
    projectId: "ID-001",
    ceremony: "대종상",
    year: 2027,
    category: "best-film",
    campaignBudgetKRW: 30_000_000,
    status: "tracking",
    note: "제출 마감 2027-10-31",
  },
  {
    id: "AW-001-05",
    projectId: "ID-001",
    ceremony: "Academy Awards (Oscars)",
    year: 2028,
    category: "best-international",
    campaignBudgetKRW: 200_000_000,
    status: "tracking",
    note: "한국 대표작 선정 위원회 제출 예정",
  },
  {
    id: "AW-001-06",
    projectId: "ID-001",
    ceremony: "BAFTA",
    year: 2028,
    category: "best-film",
    status: "tracking",
  },
  // ID-002
  {
    id: "AW-002-01",
    projectId: "ID-002",
    ceremony: "부일영화상",
    year: 2027,
    category: "best-film",
    status: "tracking",
  },
];

export function findAwardsByProject(projectId: string): AwardEntry[] {
  return mockAwardEntries.filter((a) => a.projectId === projectId);
}

export function summarizeAwards(entries: AwardEntry[]) {
  const total = entries.length;
  const nominated = entries.filter(
    (e) => e.status === "nominated" || e.status === "shortlisted",
  ).length;
  const won = entries.filter((e) => e.status === "won").length;
  const totalBudget = entries.reduce((s, e) => s + (e.campaignBudgetKRW ?? 0), 0);
  return { total, nominated, won, totalBudget };
}

export const CATEGORY_LABEL: Record<AwardCategory, string> = {
  "best-film": "작품상",
  "best-director": "감독상",
  "best-screenplay": "각본상",
  "best-actor": "남우주연상",
  "best-actress": "여우주연상",
  "best-supporting": "조연상",
  "best-cinematography": "촬영상",
  "best-editing": "편집상",
  "best-score": "음악상",
  "best-vfx": "VFX상",
  "best-international": "국제영화상",
};

export const STATUS_COLOR: Record<AwardStatus, string> = {
  tracking: "#707070",
  submitted: "#facc15",
  shortlisted: "#a78bfa",
  nominated: "#60a5fa",
  won: "#00FF41",
  "not-won": "#505050",
};

export const STATUS_LABEL: Record<AwardStatus, string> = {
  tracking: "추적 중",
  submitted: "제출",
  shortlisted: "숏리스트",
  nominated: "노미네이트",
  won: "수상",
  "not-won": "미수상",
};
