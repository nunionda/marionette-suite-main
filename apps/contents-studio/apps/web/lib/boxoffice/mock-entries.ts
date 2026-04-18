// Box Office Analytics module — Sprint 8 #71
// Mock data. Later: integrate with KOBIS (Korea) / Box Office Mojo / Comscore APIs.

export type Territory =
  | "KR" // South Korea
  | "US" // United States
  | "JP" // Japan
  | "CN" // China
  | "FR" // France
  | "UK" // United Kingdom
  | "DE" // Germany
  | "global"; // aggregated

export type ReleasePattern =
  | "wide" // 800+ screens opening
  | "platform" // limited → expansion
  | "limited" // arthouse / specialty
  | "streaming" // direct-to-streaming
  | "festival_only";

export interface BoxOfficeReport {
  id: string;
  projectId: string; // paperclipId
  territory: Territory;
  weekNumber: number; // 1-indexed
  weekStarting: string; // ISO
  admissions: number; // ticket count
  revenue: number; // in local currency (KR: KRW, else USD)
  currency: "KRW" | "USD";
  screens: number; // peak screens that week
  rank: number; // chart position
  weekOverWeekPct?: number; // e.g. -42 means dropped 42%
}

export interface ProjectReleaseMeta {
  projectId: string;
  released: boolean;
  releaseDate?: string; // ISO, KR opening
  pattern: ReleasePattern;
  budgetKRW: number; // production budget for breakeven calc
  // Breakeven rule of thumb: KR box office needs to hit ~2.5× production budget
  // (distributor/exhibitor take ~50%, P&A recoupment, etc.)
}

export const mockReleaseMeta: ProjectReleaseMeta[] = [
  {
    projectId: "ID-001",
    released: true,
    releaseDate: "2026-04-03",
    pattern: "wide",
    budgetKRW: 8_500_000_000, // ₩8.5B from Sprint 1 Budget module
  },
  {
    projectId: "ID-002",
    released: false,
    pattern: "platform",
    budgetKRW: 3_200_000_000,
  },
];

export const mockBoxOfficeReports: BoxOfficeReport[] = [
  // ID-001 DECODE — opened 2026-04-03, now week 3 (2026-04-17~)
  // Strong wide release, typical K-thriller curve
  {
    id: "BOX-001-W1-KR",
    projectId: "ID-001",
    territory: "KR",
    weekNumber: 1,
    weekStarting: "2026-04-03",
    admissions: 1_240_000,
    revenue: 13_640_000_000, // ₩13.64B (₩11,000 avg ticket)
    currency: "KRW",
    screens: 1_147,
    rank: 1,
  },
  {
    id: "BOX-001-W2-KR",
    projectId: "ID-001",
    territory: "KR",
    weekNumber: 2,
    weekStarting: "2026-04-10",
    admissions: 680_000,
    revenue: 7_480_000_000, // ₩7.48B
    currency: "KRW",
    screens: 982,
    rank: 2,
    weekOverWeekPct: -45,
  },
  {
    id: "BOX-001-W3-KR",
    projectId: "ID-001",
    territory: "KR",
    weekNumber: 3,
    weekStarting: "2026-04-17",
    admissions: 320_000,
    revenue: 3_520_000_000, // ₩3.52B
    currency: "KRW",
    screens: 654,
    rank: 4,
    weekOverWeekPct: -53,
  },
  // Japan (limited opening 2026-04-10)
  {
    id: "BOX-001-W1-JP",
    projectId: "ID-001",
    territory: "JP",
    weekNumber: 1,
    weekStarting: "2026-04-10",
    admissions: 45_000,
    revenue: 680_000, // USD
    currency: "USD",
    screens: 84,
    rank: 7,
  },
  {
    id: "BOX-001-W2-JP",
    projectId: "ID-001",
    territory: "JP",
    weekNumber: 2,
    weekStarting: "2026-04-17",
    admissions: 28_000,
    revenue: 420_000,
    currency: "USD",
    screens: 84,
    rank: 9,
    weekOverWeekPct: -38,
  },
];

export function findReleaseMeta(projectId: string): ProjectReleaseMeta | null {
  return mockReleaseMeta.find((m) => m.projectId === projectId) ?? null;
}

export function findBoxOfficeByProject(projectId: string): BoxOfficeReport[] {
  return mockBoxOfficeReports
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => {
      if (a.territory !== b.territory) return a.territory.localeCompare(b.territory);
      return a.weekNumber - b.weekNumber;
    });
}

/**
 * Aggregate KR revenue (KRW) to compare against budget for breakeven.
 * Note: distributor take ~50%, so breakeven target ≈ 2.0–2.5× budget.
 */
export function computeBoxOfficeSummary(
  reports: BoxOfficeReport[],
  meta: ProjectReleaseMeta | null,
) {
  const krReports = reports.filter((r) => r.territory === "KR");
  const krRevenue = krReports.reduce((acc, r) => acc + r.revenue, 0);
  const krAdmissions = krReports.reduce((acc, r) => acc + r.admissions, 0);
  const weeksInRelease = krReports.length;
  const peakScreens = Math.max(0, ...krReports.map((r) => r.screens));
  const peakRank = Math.min(999, ...krReports.map((r) => r.rank));
  const territoriesLive = new Set(reports.map((r) => r.territory)).size;

  // Breakeven: assume distributor take 50%, so net to producer ≈ krRevenue × 0.5
  // Target recoup ≈ budgetKRW (minimum)
  const producerNet = krRevenue * 0.5;
  const breakevenPct = meta && meta.budgetKRW > 0
    ? Math.round((producerNet / meta.budgetKRW) * 100)
    : 0;
  const breakeven = breakevenPct >= 100;

  return {
    krRevenue,
    krAdmissions,
    weeksInRelease,
    peakScreens,
    peakRank,
    territoriesLive,
    breakevenPct,
    breakeven,
  };
}
