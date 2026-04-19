// Pitch Deck module — Charter #12
// Mock data. Future sprints will back this with a DB.

export type PitchStatus = "draft" | "ready" | "pitched" | "greenlit" | "rejected";

export interface PitchMeeting {
  date: string; // ISO
  buyer: string;
  outcome: "interested" | "pass" | "pending" | "greenlit";
  note?: string;
}

export interface PitchEntry {
  projectId: string;
  status: PitchStatus;
  deckVersion: string;
  targetBuyers: string[];
  askAmount: number; // KRW
  askCurrency: "KRW";
  proposedROI: string;
  meetings: PitchMeeting[];
  deckUrl?: string;
  updatedAt: string;
}

export const mockPitches: PitchEntry[] = [
  {
    projectId: "ID-001",
    status: "greenlit",
    deckVersion: "v3.2",
    targetBuyers: ["Netflix Korea", "CJ ENM", "롯데엔터테인먼트", "NEW"],
    askAmount: 8_500_000_000,
    askCurrency: "KRW",
    proposedROI: "x3.5 — OTT 선판매 + 극장 + 해외 판권 기준",
    meetings: [
      { date: "2025-10-20T14:00:00Z", buyer: "Netflix Korea", outcome: "interested", note: "글로벌 오리지널 슬롯 검토 중" },
      { date: "2025-11-05T10:00:00Z", buyer: "CJ ENM", outcome: "greenlit", note: "공동 제작 MOU 체결 완료" },
      { date: "2025-11-12T15:00:00Z", buyer: "NEW", outcome: "pass", note: "SF 슬롯 마감" },
    ],
    deckUrl: "/files/DECODE_PitchDeck_v3.2.pdf",
    updatedAt: "2025-11-06T09:00:00Z",
  },
  {
    projectId: "ID-002",
    status: "pitched",
    deckVersion: "v1.5",
    targetBuyers: ["JTBC Studios", "tvN", "Kakao Entertainment", "Disney+ APAC"],
    askAmount: 6_000_000_000,
    askCurrency: "KRW",
    proposedROI: "x2.8 — 글로벌 OTT + 굿즈/IP 라이선스 포함",
    meetings: [
      { date: "2026-01-15T13:00:00Z", buyer: "JTBC Studios", outcome: "interested", note: "에피소드 구조 재검토 요청" },
      { date: "2026-02-03T11:00:00Z", buyer: "Disney+ APAC", outcome: "pending", note: "본사 승인 대기 중" },
    ],
    updatedAt: "2026-02-04T10:30:00Z",
  },
];

export function findPitchByProject(projectId: string): PitchEntry | undefined {
  return mockPitches.find((p) => p.projectId === projectId);
}
