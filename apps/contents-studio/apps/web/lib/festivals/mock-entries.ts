// Festival Strategy module — Sprint 7 #62
// Mock data. Later: link to FilmFreeway / Withoutabox submission APIs.

export type FestivalTier = "A" | "B" | "specialty" | "regional";

export type SubmissionStatus =
  | "pending" // deadline upcoming, not submitted
  | "submitted" // entry received by festival
  | "selected" // officially selected
  | "rejected"
  | "screened" // actually screened at festival
  | "awarded";

export type Category =
  | "competition" // 공식 경쟁
  | "out_of_competition"
  | "showcase"
  | "market"
  | "special_screening";

export interface FestivalEntry {
  id: string;
  projectId: string; // paperclipId
  festivalName: string;
  country: string;
  tier: FestivalTier;
  edition: number;
  category: Category;
  deadline: string; // ISO
  festivalDate?: string; // ISO
  submissionFee?: number; // USD
  status: SubmissionStatus;
  award?: string;
  note?: string;
}

export const mockFestivalEntries: FestivalEntry[] = [
  // ID-001 DECODE — thriller, high-ambition strategy
  {
    id: "FEST-001-01",
    projectId: "ID-001",
    festivalName: "Cannes Film Festival",
    country: "France",
    tier: "A",
    edition: 79,
    category: "competition",
    deadline: "2026-03-01",
    festivalDate: "2026-05-13",
    submissionFee: 0, // invite-only
    status: "submitted",
    note: "Un Certain Regard 노림",
  },
  {
    id: "FEST-001-02",
    projectId: "ID-001",
    festivalName: "Venice Film Festival",
    country: "Italy",
    tier: "A",
    edition: 83,
    category: "competition",
    deadline: "2026-06-20",
    festivalDate: "2026-08-27",
    submissionFee: 100,
    status: "pending",
  },
  {
    id: "FEST-001-03",
    projectId: "ID-001",
    festivalName: "Toronto International Film Festival",
    country: "Canada",
    tier: "A",
    edition: 51,
    category: "special_screening",
    deadline: "2026-06-15",
    festivalDate: "2026-09-10",
    submissionFee: 125,
    status: "pending",
  },
  {
    id: "FEST-001-04",
    projectId: "ID-001",
    festivalName: "Busan International Film Festival",
    country: "South Korea",
    tier: "A",
    edition: 31,
    category: "competition",
    deadline: "2026-07-31",
    festivalDate: "2026-10-03",
    submissionFee: 0,
    status: "pending",
    note: "뉴 커런츠 부문",
  },
  {
    id: "FEST-001-05",
    projectId: "ID-001",
    festivalName: "Sitges Fantastic Film Festival",
    country: "Spain",
    tier: "specialty",
    edition: 59,
    category: "competition",
    deadline: "2026-08-10",
    festivalDate: "2026-10-08",
    submissionFee: 75,
    status: "pending",
    note: "장르 특화 — 스릴러 적합",
  },
  // ID-002 어머니의 이력서
  {
    id: "FEST-002-01",
    projectId: "ID-002",
    festivalName: "Busan International Film Festival",
    country: "South Korea",
    tier: "A",
    edition: 31,
    category: "competition",
    deadline: "2026-07-31",
    festivalDate: "2026-10-03",
    submissionFee: 0,
    status: "pending",
    note: "한국 영화의 오늘 부문",
  },
];

export function findFestivalsByProject(projectId: string): FestivalEntry[] {
  return mockFestivalEntries.filter((f) => f.projectId === projectId);
}

export function computeFestivalSummary(entries: FestivalEntry[]) {
  const total = entries.length;
  const submitted = entries.filter(
    (e) => e.status !== "pending" && e.status !== "rejected",
  ).length;
  const selected = entries.filter(
    (e) => e.status === "selected" || e.status === "screened" || e.status === "awarded",
  ).length;
  const awarded = entries.filter((e) => e.status === "awarded").length;
  const pending = entries.filter((e) => e.status === "pending").length;
  return { total, submitted, selected, awarded, pending };
}
