// Rehearsals module — Sprint 4 #23
// Mock data. Later: link actors from Casting + scenes from script-writer.

export type RehearsalStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export type RehearsalType =
  | "table_read"
  | "blocking"
  | "scene_work"
  | "chemistry"
  | "stunt"
  | "dance";

export interface RehearsalSession {
  id: string;
  projectId: string; // paperclipId
  date: string; // ISO
  durationHours: number;
  type: RehearsalType;
  sceneIds: string[];
  attendees: string[]; // actor names
  venue: string;
  status: RehearsalStatus;
  note?: string;
}

export const mockRehearsals: RehearsalSession[] = [
  // ID-001 DECODE
  {
    id: "REH-001-01",
    projectId: "ID-001",
    date: "2026-04-28",
    durationHours: 3,
    type: "table_read",
    sceneIds: ["S1", "S2", "S3", "S4", "S5"],
    attendees: ["이제훈", "전종서", "박성웅"],
    venue: "강남 리허설 스튜디오 A",
    status: "completed",
    note: "전체 캐스트 테이블 리딩",
  },
  {
    id: "REH-001-02",
    projectId: "ID-001",
    date: "2026-05-01",
    durationHours: 4,
    type: "chemistry",
    sceneIds: ["S12", "S13"],
    attendees: ["이제훈", "전종서"],
    venue: "강남 리허설 스튜디오 B",
    status: "in_progress",
    note: "주인공 2인 케미스트리 리딩",
  },
  {
    id: "REH-001-03",
    projectId: "ID-001",
    date: "2026-05-03",
    durationHours: 6,
    type: "blocking",
    sceneIds: ["S7", "S8"],
    attendees: ["이제훈"],
    venue: "부산 해운대 현장 답사",
    status: "scheduled",
    note: "해변 액션 블로킹",
  },
  {
    id: "REH-001-04",
    projectId: "ID-001",
    date: "2026-05-06",
    durationHours: 5,
    type: "stunt",
    sceneIds: ["S28"],
    attendees: ["이제훈", "스턴트 팀"],
    venue: "남양주 스턴트 트레이닝 센터",
    status: "scheduled",
  },
  // ID-002
  {
    id: "REH-002-01",
    projectId: "ID-002",
    date: "2026-05-25",
    durationHours: 2,
    type: "table_read",
    sceneIds: ["S1", "S2", "S3"],
    attendees: ["김혜자"],
    venue: "FN엔터 연습실",
    status: "scheduled",
  },
];

export function findRehearsalsByProject(projectId: string): RehearsalSession[] {
  return mockRehearsals.filter((r) => r.projectId === projectId);
}

export function computeRehearsalSummary(sessions: RehearsalSession[]) {
  const total = sessions.length;
  const completed = sessions.filter((s) => s.status === "completed").length;
  const inProgress = sessions.filter((s) => s.status === "in_progress").length;
  const scheduled = sessions.filter((s) => s.status === "scheduled").length;
  const totalHours = sessions.reduce((acc, s) => acc + s.durationHours, 0);
  return { total, completed, inProgress, scheduled, totalHours };
}
