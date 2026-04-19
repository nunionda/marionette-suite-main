export type DailiesStatus = "pending" | "screening" | "approved" | "flagged";

export interface DailiesSession {
  id: string;
  projectId: string;
  shootDay: number;
  date: string;
  location: string;
  format: string;
  clipCount: number;
  status: DailiesStatus;
  directorNotes?: string;
  dpNotes?: string;
}

export const STATUS_COLOR: Record<DailiesStatus, string> = {
  pending:   "#707070",
  screening: "#60a5fa",
  approved:  "#00FF41",
  flagged:   "#ef4444",
};

export const STATUS_LABEL: Record<DailiesStatus, string> = {
  pending:   "대기",
  screening: "시사중",
  approved:  "승인",
  flagged:   "재촬영",
};

export const MOCK_SESSIONS: DailiesSession[] = [
  {
    id: "d-001",
    projectId: "BEAT-SAVIOR",
    shootDay: 1,
    date: "2026-03-10",
    location: "Studio A — 인서울 세트",
    format: "ARRIRAW 4.5K",
    clipCount: 42,
    status: "approved",
    directorNotes: "씬 7A — 리딩 퍼펙트, 커버 충분",
  },
  {
    id: "d-002",
    projectId: "BEAT-SAVIOR",
    shootDay: 2,
    date: "2026-03-11",
    location: "한강 외부 로케이션",
    format: "ARRIRAW 4.5K",
    clipCount: 31,
    status: "approved",
    dpNotes: "빛 조건 변화로 노출 보정 필요 — 그레이딩에 메모 전달",
  },
  {
    id: "d-003",
    projectId: "BEAT-SAVIOR",
    shootDay: 3,
    date: "2026-03-12",
    location: "Studio B — 병원 세트",
    format: "ARRIRAW 4.5K",
    clipCount: 57,
    status: "flagged",
    directorNotes: "씬 22 — 배우 포지션 연속성 문제, D+4 재촬영 예정",
    dpNotes: "포커스 브리딩 클립 3개 — 사용 불가",
  },
  {
    id: "d-004",
    projectId: "BEAT-SAVIOR",
    shootDay: 4,
    date: "2026-03-13",
    location: "Studio B — 병원 세트",
    format: "ARRIRAW 4.5K",
    clipCount: 29,
    status: "screening",
    directorNotes: "재촬영분 + 추가 커버",
  },
  {
    id: "d-005",
    projectId: "PROJECT-NOVA",
    shootDay: 1,
    date: "2026-04-01",
    location: "외부 로케이션 — 인천항",
    format: "RED KOMODO-X 6K",
    clipCount: 38,
    status: "approved",
  },
  {
    id: "d-006",
    projectId: "PROJECT-NOVA",
    shootDay: 2,
    date: "2026-04-02",
    location: "외부 로케이션 — 인천항",
    format: "RED KOMODO-X 6K",
    clipCount: 44,
    status: "pending",
  },
];
