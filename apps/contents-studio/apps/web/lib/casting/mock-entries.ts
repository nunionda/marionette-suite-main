// Casting module — Sprint 1 #20
// Mock data. Later sprints will pull character list from script-writer's
// breakdown API and audition data from a dedicated casting DB.

export type CastingState =
  | "open" // searching for actor
  | "audition" // auditioning candidates
  | "offer" // offer extended
  | "confirmed" // actor confirmed
  | "signed"; // contract signed

export interface CastingEntry {
  id: string;
  projectId: string; // paperclipId
  characterName: string;
  characterRole: "lead" | "supporting" | "minor";
  actorName?: string; // null if state === "open"
  agency?: string;
  state: CastingState;
  auditionDate?: string; // ISO
  note?: string;
}

export const mockCastings: CastingEntry[] = [
  // DECODE (ID-001) — thriller, 19 characters per Beat Savior data
  {
    id: "CAST-001-01",
    projectId: "ID-001",
    characterName: "한우진",
    characterRole: "lead",
    actorName: "이제훈",
    agency: "Saram Entertainment",
    state: "signed",
    note: "주인공 · 해커",
  },
  {
    id: "CAST-001-02",
    projectId: "ID-001",
    characterName: "박서연",
    characterRole: "lead",
    actorName: "전종서",
    agency: "YG Entertainment",
    state: "confirmed",
    note: "여주 · 형사",
  },
  {
    id: "CAST-001-03",
    projectId: "ID-001",
    characterName: "정태식",
    characterRole: "supporting",
    actorName: "박성웅",
    agency: "Lotte Entertainment",
    state: "offer",
  },
  {
    id: "CAST-001-04",
    projectId: "ID-001",
    characterName: "김민재",
    characterRole: "supporting",
    state: "audition",
    auditionDate: "2026-04-22",
    note: "3명 콜백",
  },
  {
    id: "CAST-001-05",
    projectId: "ID-001",
    characterName: "윤정호",
    characterRole: "minor",
    state: "open",
  },
  // ID-002 · 어머니의 이력서
  {
    id: "CAST-002-01",
    projectId: "ID-002",
    characterName: "어머니",
    characterRole: "lead",
    actorName: "김혜자",
    agency: "FN엔터테인먼트",
    state: "signed",
    note: "주인공",
  },
  {
    id: "CAST-002-02",
    projectId: "ID-002",
    characterName: "딸",
    characterRole: "supporting",
    state: "audition",
    auditionDate: "2026-05-10",
  },
];

export function findCastingsByProject(projectId: string): CastingEntry[] {
  return mockCastings.filter((c) => c.projectId === projectId);
}

export function computeCastingSummary(entries: CastingEntry[]) {
  const total = entries.length;
  const signed = entries.filter((e) => e.state === "signed" || e.state === "confirmed").length;
  const auditioning = entries.filter((e) => e.state === "audition" || e.state === "offer").length;
  const open = entries.filter((e) => e.state === "open").length;
  return { total, signed, auditioning, open };
}
