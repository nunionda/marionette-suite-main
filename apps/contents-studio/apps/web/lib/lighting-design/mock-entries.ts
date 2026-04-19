export interface LightingPlan {
  id: string;
  projectId: string;
  location: string;
  timeOfDay: "dawn" | "morning" | "day" | "golden-hour" | "dusk" | "night" | "interior";
  mood: string;
  keyLight: string;
  fillRatio: string;
  practicals: string[];
  colorTemp: number;
  status: "draft" | "approved" | "locked" | "on-set-adjusted";
  notes?: string;
}

export const TIME_LABEL: Record<LightingPlan["timeOfDay"], string> = {
  dawn: "새벽",
  morning: "아침",
  day: "낮",
  "golden-hour": "골든아워",
  dusk: "황혼",
  night: "밤",
  interior: "실내",
};

export const STATUS_COLOR: Record<LightingPlan["status"], string> = {
  draft: "#707070",
  approved: "#60a5fa",
  locked: "#00FF41",
  "on-set-adjusted": "#f59e0b",
};

export const STATUS_LABEL: Record<LightingPlan["status"], string> = {
  draft: "초안",
  approved: "승인",
  locked: "확정",
  "on-set-adjusted": "현장조정",
};

export const MOCK_PLANS: LightingPlan[] = [
  {
    id: "ld-001",
    projectId: "BEAT-SAVIOR",
    location: "서울 강남구 스튜디오 A",
    timeOfDay: "interior",
    mood: "차갑고 기계적인 병원 분위기",
    keyLight: "Arri SkyPanel S60-C (6000K hard)",
    fillRatio: "1:3",
    practicals: ["형광등 그리드", "모니터 글로우"],
    colorTemp: 6000,
    status: "locked",
    notes: "의도적 green channel shift — 병원 특유의 불안감",
  },
  {
    id: "ld-002",
    projectId: "BEAT-SAVIOR",
    location: "한강 야외 (새벽)",
    timeOfDay: "dawn",
    mood: "외로움, 희망의 첫 실마리",
    keyLight: "Leko 실루엣 + 자연광 보조",
    fillRatio: "1:6",
    practicals: ["교량 가로등", "수면 반사"],
    colorTemp: 3200,
    status: "approved",
    notes: "Magic hour 창 2분 — 2회차 촬영 예비",
  },
  {
    id: "ld-003",
    projectId: "BEAT-SAVIOR",
    location: "지하 클럽",
    timeOfDay: "night",
    mood: "카오틱, 에너제틱",
    keyLight: "RGB LED 무빙 헤드 × 16",
    fillRatio: "무비율 (다방향 소스)",
    practicals: ["DJ 부스 조명", "스트로브 (간헐)"],
    colorTemp: 2700,
    status: "on-set-adjusted",
  },
  {
    id: "ld-004",
    projectId: "PROJECT-NOVA",
    location: "옥상 (황혼)",
    timeOfDay: "golden-hour",
    mood: "따뜻하고 서글픈 작별",
    keyLight: "자연광 + 18K HMI 리플렉터",
    fillRatio: "1:2",
    practicals: ["도시 네온"],
    colorTemp: 3800,
    status: "draft",
  },
];

export function summarizeLighting(plans: LightingPlan[]) {
  const byProject = new Map<string, LightingPlan[]>();
  for (const p of plans) {
    const arr = byProject.get(p.projectId) ?? [];
    arr.push(p);
    byProject.set(p.projectId, arr);
  }
  const locked = plans.filter((p) => p.status === "locked").length;
  return { total: plans.length, locked, projectIds: Array.from(byProject.keys()) };
}
