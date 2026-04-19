// Crew Hiring — Sprint 10 #22
// Key crew positions + hiring status for each project.

export type CrewDepartment =
  | "direction"
  | "cinematography"
  | "production"
  | "art"
  | "sound"
  | "costume"
  | "makeup"
  | "vfx"
  | "editing";

export type HireStatus =
  | "searching"
  | "interviewing"
  | "offered"
  | "hired";

export interface CrewMember {
  id: string;
  projectId: string;
  position: string;
  department: CrewDepartment;
  name?: string;
  agencyOrUnion?: string;
  dailyRateKRW?: number;
  status: HireStatus;
  startDate?: string;
  note?: string;
}

export const mockCrew: CrewMember[] = [
  // ID-001 DECODE
  {
    id: "CR-001-01",
    projectId: "ID-001",
    position: "감독",
    department: "direction",
    name: "김현수",
    dailyRateKRW: 3_000_000,
    status: "hired",
    startDate: "2026-04-01",
  },
  {
    id: "CR-001-02",
    projectId: "ID-001",
    position: "조감독 (1st AD)",
    department: "direction",
    name: "신유진",
    dailyRateKRW: 1_200_000,
    status: "hired",
    startDate: "2026-04-15",
  },
  {
    id: "CR-001-03",
    projectId: "ID-001",
    position: "촬영감독 (DP)",
    department: "cinematography",
    name: "이호준",
    agencyOrUnion: "한국영화촬영감독조합",
    dailyRateKRW: 2_500_000,
    status: "hired",
    startDate: "2026-05-01",
  },
  {
    id: "CR-001-04",
    projectId: "ID-001",
    position: "1st AC",
    department: "cinematography",
    dailyRateKRW: 800_000,
    status: "searching",
    note: "DP 추천 대기 중",
  },
  {
    id: "CR-001-05",
    projectId: "ID-001",
    position: "제작부장 (UPM)",
    department: "production",
    name: "오혜진",
    dailyRateKRW: 1_800_000,
    status: "hired",
    startDate: "2026-03-15",
  },
  {
    id: "CR-001-06",
    projectId: "ID-001",
    position: "미술감독 (PD)",
    department: "art",
    name: "박상민",
    dailyRateKRW: 1_600_000,
    status: "hired",
    startDate: "2026-04-20",
  },
  {
    id: "CR-001-07",
    projectId: "ID-001",
    position: "녹음감독",
    department: "sound",
    agencyOrUnion: "한국영화녹음협회",
    dailyRateKRW: 1_200_000,
    status: "offered",
    note: "2인 후보 최종 심사",
  },
  {
    id: "CR-001-08",
    projectId: "ID-001",
    position: "의상감독",
    department: "costume",
    name: "최수진",
    dailyRateKRW: 900_000,
    status: "hired",
    startDate: "2026-05-10",
  },
  {
    id: "CR-001-09",
    projectId: "ID-001",
    position: "편집",
    department: "editing",
    dailyRateKRW: 1_500_000,
    status: "searching",
    note: "국제 수상작 경력 선호",
  },
  {
    id: "CR-001-10",
    projectId: "ID-001",
    position: "VFX 슈퍼바이저",
    department: "vfx",
    dailyRateKRW: 2_000_000,
    status: "interviewing",
    note: "3개 스튜디오 미팅 진행 중",
  },
  // ID-002
  {
    id: "CR-002-01",
    projectId: "ID-002",
    position: "감독",
    department: "direction",
    name: "정아름",
    dailyRateKRW: 2_200_000,
    status: "hired",
    startDate: "2026-04-01",
  },
  {
    id: "CR-002-02",
    projectId: "ID-002",
    position: "촬영감독 (DP)",
    department: "cinematography",
    name: "서동준",
    dailyRateKRW: 1_800_000,
    status: "hired",
    startDate: "2026-05-01",
  },
  {
    id: "CR-002-03",
    projectId: "ID-002",
    position: "제작부장 (UPM)",
    department: "production",
    dailyRateKRW: 1_400_000,
    status: "searching",
  },
];

export function findCrewByProject(projectId: string): CrewMember[] {
  return mockCrew.filter((c) => c.projectId === projectId);
}

export function summarizeCrew(crew: CrewMember[]) {
  const total = crew.length;
  const hired = crew.filter((c) => c.status === "hired").length;
  const pending = crew.filter(
    (c) => c.status === "offered" || c.status === "interviewing",
  ).length;
  const searching = crew.filter((c) => c.status === "searching").length;
  const keyRoles = ["감독", "촬영감독 (DP)", "제작부장 (UPM)"];
  const keyHired = crew.filter(
    (c) => keyRoles.some((r) => c.position.includes(r.split(" ")[0] ?? r)) && c.status === "hired",
  ).length;
  return { total, hired, pending, searching, keyHired };
}

export const DEPT_LABEL: Record<CrewDepartment, string> = {
  direction: "연출",
  cinematography: "촬영",
  production: "제작",
  art: "미술",
  sound: "사운드",
  costume: "의상",
  makeup: "분장",
  vfx: "VFX",
  editing: "편집",
};

export const DEPT_COLOR: Record<CrewDepartment, string> = {
  direction: "#00FF41",
  cinematography: "#facc15",
  production: "#60a5fa",
  art: "#f472b6",
  sound: "#a78bfa",
  costume: "#fb923c",
  makeup: "#34d399",
  vfx: "#38bdf8",
  editing: "#e879f9",
};
