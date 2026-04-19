export interface SoundSession {
  id: string;
  projectId: string;
  shootDay: number;
  sceneId: string;
  recordist: string;
  boomOperator: string;
  equipment: string[];
  sampleRate: number;
  bitDepth: number;
  trackCount: number;
  status: "prep" | "recording" | "review" | "approved" | "re-record";
  issues?: string;
  notes?: string;
}

export const STATUS_COLOR: Record<SoundSession["status"], string> = {
  prep: "#707070",
  recording: "#60a5fa",
  review: "#f59e0b",
  approved: "#00FF41",
  "re-record": "#ef4444",
};

export const STATUS_LABEL: Record<SoundSession["status"], string> = {
  prep: "준비",
  recording: "녹음중",
  review: "검토",
  approved: "승인",
  "re-record": "재녹음",
};

export const MOCK_SESSIONS: SoundSession[] = [
  {
    id: "os-001",
    projectId: "BEAT-SAVIOR",
    shootDay: 1,
    sceneId: "SC-01~SC-03",
    recordist: "황진수 (Production Sound Mixer)",
    boomOperator: "오세영",
    equipment: ["Sound Devices 888", "Sennheiser MKH 50", "Lectrosonics SMQV x4", "DPA 4060 (라발)", "Rycote Cyclone 풍막"],
    sampleRate: 48000,
    bitDepth: 24,
    trackCount: 8,
    status: "approved",
    notes: "스튜디오 A — 형광등 60Hz 노이즈 차폐 완료",
  },
  {
    id: "os-002",
    projectId: "BEAT-SAVIOR",
    shootDay: 2,
    sceneId: "SC-15~SC-16",
    recordist: "황진수 (Production Sound Mixer)",
    boomOperator: "오세영",
    equipment: ["Sound Devices 888", "Sennheiser MKH 416", "Lectrosonics SMQV x2", "Rycote Cyclone 풍막"],
    sampleRate: 48000,
    bitDepth: 24,
    trackCount: 6,
    status: "re-record",
    issues: "한강 수면 바람 노이즈 과다 — ADR 권고",
    notes: "ADR 세션 일정 조율 중",
  },
  {
    id: "os-003",
    projectId: "BEAT-SAVIOR",
    shootDay: 7,
    sceneId: "SC-34, SC-67",
    recordist: "황진수 (Production Sound Mixer)",
    boomOperator: "오세영",
    equipment: ["Sound Devices 888", "DPA 4060 x6 (무선)", "Lectrosonics SMQV x6"],
    sampleRate: 48000,
    bitDepth: 24,
    trackCount: 12,
    status: "prep",
    notes: "클럽 음악과 대사 분리 트랙 필수 — 음악 재생 동기화",
  },
  {
    id: "os-004",
    projectId: "PROJECT-NOVA",
    shootDay: 1,
    sceneId: "SC-22~SC-23",
    recordist: "유지은 (Sound Mixer)",
    boomOperator: "강민호",
    equipment: ["Sound Devices MixPre-10 II", "Sennheiser MKH 50", "Lectrosonics LT x3"],
    sampleRate: 48000,
    bitDepth: 32,
    trackCount: 6,
    status: "prep",
    notes: "옥상 강풍 대비 — 와이어리스 라발 우선",
  },
];

export function summarizeOnSetSound(sessions: SoundSession[]) {
  const byProject = new Map<string, SoundSession[]>();
  for (const s of sessions) {
    const arr = byProject.get(s.projectId) ?? [];
    arr.push(s);
    byProject.set(s.projectId, arr);
  }
  const reRecord = sessions.filter((s) => s.status === "re-record").length;
  const approved = sessions.filter((s) => s.status === "approved").length;
  return { total: sessions.length, approved, reRecord, projectIds: Array.from(byProject.keys()) };
}
