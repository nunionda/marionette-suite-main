export interface StuntSequence {
  id: string;
  projectId: string;
  sceneId: string;
  description: string;
  stuntType: "fall" | "fight" | "vehicle" | "fire" | "wire" | "explosion" | "water";
  coordinator: string;
  riskLevel: "low" | "medium" | "high" | "extreme";
  rehearsalCount: number;
  performer: string;
  doubleRequired: boolean;
  status: "planning" | "rehearsing" | "safety-cleared" | "completed";
  shootDate?: string;
  notes?: string;
}

export const STUNT_TYPE_LABEL: Record<StuntSequence["stuntType"], string> = {
  fall: "낙하",
  fight: "격투",
  vehicle: "차량",
  fire: "화재",
  wire: "와이어",
  explosion: "폭발",
  water: "수중",
};

export const RISK_COLOR: Record<StuntSequence["riskLevel"], string> = {
  low: "#60a5fa",
  medium: "#f59e0b",
  high: "#ef4444",
  extreme: "#ff00ff",
};

export const RISK_LABEL: Record<StuntSequence["riskLevel"], string> = {
  low: "낮음",
  medium: "중간",
  high: "높음",
  extreme: "극위험",
};

export const STATUS_COLOR: Record<StuntSequence["status"], string> = {
  planning: "#707070",
  rehearsing: "#60a5fa",
  "safety-cleared": "#f59e0b",
  completed: "#00FF41",
};

export const STATUS_LABEL: Record<StuntSequence["status"], string> = {
  planning: "계획",
  rehearsing: "리허설",
  "safety-cleared": "안전승인",
  completed: "완료",
};

export const MOCK_SEQUENCES: StuntSequence[] = [
  {
    id: "st-001",
    projectId: "BEAT-SAVIOR",
    sceneId: "SC-34",
    description: "병원 옥상 추격 — 3층 낙하 및 파쿠르 시퀀스",
    stuntType: "fall",
    coordinator: "박민준 (스턴트 코디네이터)",
    riskLevel: "high",
    rehearsalCount: 6,
    performer: "김태호 (주연 스턴트)",
    doubleRequired: true,
    status: "safety-cleared",
    shootDate: "2026-05-08",
    notes: "에어백 3중 설치 · 보험 추가 커버리지 확보",
  },
  {
    id: "st-002",
    projectId: "BEAT-SAVIOR",
    sceneId: "SC-67",
    description: "클럽 격투 — 6인 동시 안무 전투",
    stuntType: "fight",
    coordinator: "박민준 (스턴트 코디네이터)",
    riskLevel: "medium",
    rehearsalCount: 12,
    performer: "앙상블",
    doubleRequired: false,
    status: "rehearsing",
    shootDate: "2026-05-14",
  },
  {
    id: "st-003",
    projectId: "PROJECT-NOVA",
    sceneId: "SC-22",
    description: "옥상 와이어 플라이 — 빌딩 간 점프",
    stuntType: "wire",
    coordinator: "이소연 (와이어 전문)",
    riskLevel: "extreme",
    rehearsalCount: 4,
    performer: "최지훈 (주연 스턴트)",
    doubleRequired: true,
    status: "planning",
    shootDate: "2026-07-01",
    notes: "건물주 허가 + 항공청 신고 필요",
  },
  {
    id: "st-004",
    projectId: "PROJECT-NOVA",
    sceneId: "SC-45",
    description: "차량 전복 — 교차로 액션",
    stuntType: "vehicle",
    coordinator: "이소연 (와이어 전문)",
    riskLevel: "high",
    rehearsalCount: 3,
    performer: "차량 전문 드라이버",
    doubleRequired: true,
    status: "planning",
    notes: "도로 전면 통제 · 소방차 대기",
  },
];

export function summarizeStunts(sequences: StuntSequence[]) {
  const byProject = new Map<string, StuntSequence[]>();
  for (const s of sequences) {
    const arr = byProject.get(s.projectId) ?? [];
    arr.push(s);
    byProject.set(s.projectId, arr);
  }
  const highRisk = sequences.filter(
    (s) => s.riskLevel === "high" || s.riskLevel === "extreme",
  ).length;
  const cleared = sequences.filter((s) => s.status === "safety-cleared" || s.status === "completed").length;
  return { total: sequences.length, highRisk, cleared, projectIds: Array.from(byProject.keys()) };
}
