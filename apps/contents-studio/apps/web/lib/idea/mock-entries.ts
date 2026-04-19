// Idea / Concept module — Charter #1
// Mock data. Future sprints will back this with a DB.

export type IdeaStatus = "draft" | "developing" | "approved" | "shelved";

export interface IdeaEntry {
  projectId: string;
  title: string;
  logline: string;
  genre: string[];
  format: "feature_film" | "short_film" | "series" | "commercial" | "documentary";
  status: IdeaStatus;
  originSource: string; // "original", "adaptation", "based_on_true_events", etc.
  targetAudience: string;
  uniqueAngle: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export const mockIdeas: IdeaEntry[] = [
  {
    projectId: "ID-001",
    title: "DECODE",
    logline: "AI가 지배하는 2047년, 인류 최후의 해커가 자신의 의식을 디지털 세계에 업로드해 기계와의 최후 전쟁을 시작한다.",
    genre: ["Sci-Fi", "Thriller", "Action"],
    format: "feature_film",
    status: "approved",
    originSource: "original",
    targetAudience: "18-35 / Global",
    uniqueAngle: "AI 내부에서 펼쳐지는 '의식 해킹' 세계관 — 디지털과 물리의 경계 붕괴",
    createdAt: "2025-09-01T09:00:00Z",
    updatedAt: "2025-10-15T14:22:00Z",
  },
  {
    projectId: "ID-002",
    title: "BEAT SAVIOR",
    logline: "K-POP 슈퍼스타가 된 AI가 자신을 만든 프로듀서와 감정을 두고 대립하는 뮤직 드라마.",
    genre: ["Drama", "Music", "Romance"],
    format: "series",
    status: "developing",
    originSource: "original",
    targetAudience: "18-40 / Korea & Southeast Asia",
    uniqueAngle: "AI 아티스트의 '감정 소유권' 논쟁을 K-POP 산업 구조로 풀어낸 사회 드라마",
    createdAt: "2025-11-10T10:00:00Z",
    updatedAt: "2026-01-08T09:15:00Z",
  },
];

export function findIdeaByProject(projectId: string): IdeaEntry | undefined {
  return mockIdeas.find((i) => i.projectId === projectId);
}
