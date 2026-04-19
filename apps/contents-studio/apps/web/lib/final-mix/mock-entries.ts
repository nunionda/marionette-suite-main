export type FinalMixStatus =
  | "pending"
  | "mix-in-progress"
  | "review"
  | "approved"
  | "delivered";

export interface FinalMixSession {
  id: string;
  projectId: string;
  reel: string;
  mixer: string;
  formats: string[];
  status: FinalMixStatus;
  deliveryDate?: string;
  notes?: string;
}

export const STATUS_COLOR: Record<FinalMixStatus, string> = {
  pending:           "#707070",
  "mix-in-progress": "#60a5fa",
  review:            "#f59e0b",
  approved:          "#00FF41",
  delivered:         "#22c55e",
};

export const STATUS_LABEL: Record<FinalMixStatus, string> = {
  pending:           "대기",
  "mix-in-progress": "믹싱중",
  review:            "검토",
  approved:          "승인",
  delivered:         "납품완료",
};

export const MOCK_SESSIONS: FinalMixSession[] = [
  {
    id: "fm-001",
    projectId: "BEAT-SAVIOR",
    reel: "R1",
    mixer: "Kim Dohyun",
    formats: ["Dolby Atmos 7.1.4", "Stereo LtRt"],
    status: "approved",
    deliveryDate: "2026-04-18",
    notes: "오프닝 씬 앰비언스 보강 완료",
  },
  {
    id: "fm-002",
    projectId: "BEAT-SAVIOR",
    reel: "R2",
    mixer: "Kim Dohyun",
    formats: ["Dolby Atmos 7.1.4", "Stereo LtRt"],
    status: "review",
    notes: "2막 클라이맥스 다이얼로그 레벨 재검토 요청",
  },
  {
    id: "fm-003",
    projectId: "BEAT-SAVIOR",
    reel: "R3",
    mixer: "Park Jisoo",
    formats: ["Dolby Atmos 7.1.4", "Stereo LtRt", "5.1 Surround"],
    status: "mix-in-progress",
  },
  {
    id: "fm-004",
    projectId: "BEAT-SAVIOR",
    reel: "R4",
    mixer: "Park Jisoo",
    formats: ["Dolby Atmos 7.1.4", "Stereo LtRt"],
    status: "pending",
  },
  {
    id: "fm-005",
    projectId: "PROJECT-NOVA",
    reel: "R1",
    mixer: "Lee Sungho",
    formats: ["Dolby Atmos 7.1.4", "Stereo LtRt"],
    status: "mix-in-progress",
    notes: "항구 씬 폴리 레이어 추가 작업 중",
  },
  {
    id: "fm-006",
    projectId: "PROJECT-NOVA",
    reel: "R2",
    mixer: "Lee Sungho",
    formats: ["Dolby Atmos 7.1.4", "Stereo LtRt"],
    status: "pending",
  },
];
