// Schedule module — Sprint 1 #16
// Mock data. Later sprints will back this with script-writer scene breakdown
// (GET :3006/api/projects/:id/scenes) or a dedicated schedule DB.

export type ShootDayStatus = "scheduled" | "in_progress" | "wrapped" | "cancelled";

export interface ShootDay {
  id: string;
  projectId: string; // paperclipId (ID-XXX)
  day: number; // 1-indexed shoot-day number
  date: string; // ISO yyyy-mm-dd
  location: string;
  interior: boolean; // INT=true, EXT=false
  sceneIds: string[]; // scene identifiers (string form, e.g. "S12", "S13")
  callTime: string; // "07:00"
  wrapTime: string; // "19:00"
  status: ShootDayStatus;
  notes?: string;
}

// DECODE (ID-001) — thriller, 122 scenes distributed across 18 shoot days
export const mockShootDays: ShootDay[] = [
  // ID-001 · DECODE (Beat Savior surrogate)
  {
    id: "SD-001-01",
    projectId: "ID-001",
    day: 1,
    date: "2026-05-04",
    location: "서울 강남 오피스 (INT)",
    interior: true,
    sceneIds: ["S1", "S2", "S3"],
    callTime: "06:30",
    wrapTime: "19:00",
    status: "wrapped",
    notes: "오프닝 시퀀스",
  },
  {
    id: "SD-001-02",
    projectId: "ID-001",
    day: 2,
    date: "2026-05-05",
    location: "서울 강남 오피스 (INT)",
    interior: true,
    sceneIds: ["S4", "S5", "S6"],
    callTime: "07:00",
    wrapTime: "19:30",
    status: "wrapped",
  },
  {
    id: "SD-001-03",
    projectId: "ID-001",
    day: 3,
    date: "2026-05-07",
    location: "부산 해운대 (EXT)",
    interior: false,
    sceneIds: ["S7", "S8"],
    callTime: "05:00",
    wrapTime: "21:00",
    status: "in_progress",
    notes: "선셋 시퀀스 · magic hour",
  },
  {
    id: "SD-001-04",
    projectId: "ID-001",
    day: 4,
    date: "2026-05-08",
    location: "부산 해운대 (EXT)",
    interior: false,
    sceneIds: ["S9", "S10", "S11"],
    callTime: "05:30",
    wrapTime: "20:00",
    status: "scheduled",
  },
  {
    id: "SD-001-05",
    projectId: "ID-001",
    day: 5,
    date: "2026-05-11",
    location: "서울 한남동 주택 (INT)",
    interior: true,
    sceneIds: ["S12", "S13", "S14"],
    callTime: "07:00",
    wrapTime: "19:00",
    status: "scheduled",
  },
  // ID-002 · 어머니의 이력서
  {
    id: "SD-002-01",
    projectId: "ID-002",
    day: 1,
    date: "2026-06-01",
    location: "대구 동성로 카페 (INT)",
    interior: true,
    sceneIds: ["S1", "S2"],
    callTime: "08:00",
    wrapTime: "18:00",
    status: "scheduled",
  },
  {
    id: "SD-002-02",
    projectId: "ID-002",
    day: 2,
    date: "2026-06-02",
    location: "대구 집 (INT)",
    interior: true,
    sceneIds: ["S3", "S4", "S5"],
    callTime: "08:00",
    wrapTime: "19:00",
    status: "scheduled",
  },
];

export function findShootDaysByProject(projectId: string): ShootDay[] {
  return mockShootDays.filter((d) => d.projectId === projectId);
}
