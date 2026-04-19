export interface ShootDay {
  id: string;
  projectId: string;
  shootDay: number;
  date: string;
  location: string;
  scenes: string[];
  director: string;
  dp: string;
  callTime: string;
  wrapTime?: string;
  pageCount: number;
  setups: number;
  status: "scheduled" | "in-progress" | "completed" | "postponed";
  notes?: string;
}

export const STATUS_COLOR: Record<ShootDay["status"], string> = {
  scheduled: "#707070",
  "in-progress": "#60a5fa",
  completed: "#00FF41",
  postponed: "#ef4444",
};

export const STATUS_LABEL: Record<ShootDay["status"], string> = {
  scheduled: "예정",
  "in-progress": "촬영중",
  completed: "완료",
  postponed: "연기",
};

export const MOCK_SHOOT_DAYS: ShootDay[] = [
  {
    id: "ph-001",
    projectId: "BEAT-SAVIOR",
    shootDay: 1,
    date: "2026-05-01",
    location: "서울 강남구 스튜디오 A",
    scenes: ["SC-01", "SC-02", "SC-03"],
    director: "김철수 감독",
    dp: "이영희 (촬영감독)",
    callTime: "06:00",
    wrapTime: "20:30",
    pageCount: 8,
    setups: 24,
    status: "completed",
    notes: "병원 인트로 시퀀스 — 오버타임 40분",
  },
  {
    id: "ph-002",
    projectId: "BEAT-SAVIOR",
    shootDay: 2,
    date: "2026-05-02",
    location: "한강 야외 (서울)",
    scenes: ["SC-15", "SC-16"],
    director: "김철수 감독",
    dp: "이영희 (촬영감독)",
    callTime: "04:30",
    wrapTime: "09:00",
    pageCount: 4,
    setups: 12,
    status: "completed",
    notes: "Magic hour 02:00~05:00 — 조건부 2회차 예비 촬영 없음",
  },
  {
    id: "ph-003",
    projectId: "BEAT-SAVIOR",
    shootDay: 7,
    date: "2026-05-08",
    location: "을지로 지하 클럽",
    scenes: ["SC-34", "SC-67"],
    director: "김철수 감독",
    dp: "이영희 (촬영감독)",
    callTime: "22:00",
    pageCount: 10,
    setups: 32,
    status: "scheduled",
    notes: "야간 전용 허가 · 스턴트 소팀 대기",
  },
  {
    id: "ph-004",
    projectId: "PROJECT-NOVA",
    shootDay: 1,
    date: "2026-07-01",
    location: "여의도 63빌딩 옥상",
    scenes: ["SC-22", "SC-23"],
    director: "박소연 감독",
    dp: "최민혁 (촬영감독)",
    callTime: "16:00",
    pageCount: 6,
    setups: 18,
    status: "scheduled",
    notes: "황혼 골든아워 촬영 — 항공청 드론 허가 대기",
  },
];

export function summarizePhotography(days: ShootDay[]) {
  const byProject = new Map<string, ShootDay[]>();
  for (const d of days) {
    const arr = byProject.get(d.projectId) ?? [];
    arr.push(d);
    byProject.set(d.projectId, arr);
  }
  const completed = days.filter((d) => d.status === "completed").length;
  const totalSetups = days.reduce((n, d) => n + d.setups, 0);
  return {
    total: days.length,
    completed,
    totalSetups,
    totalPages: days.reduce((n, d) => n + d.pageCount, 0),
    projectIds: Array.from(byProject.keys()),
  };
}
