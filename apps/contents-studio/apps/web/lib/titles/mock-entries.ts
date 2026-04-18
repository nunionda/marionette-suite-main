// Title Design module — Sprint 5 #56
// Mock data. Later: link to After Effects / Motion design source files.

export type TitleStatus = "draft" | "review" | "approved" | "locked";

export type TitleKind =
  | "main_title" // 메인 타이틀
  | "opening_credits" // 오프닝 크레딧
  | "chapter_title" // 챕터 타이틀
  | "subtitle_card" // 자막 카드
  | "end_credits" // 엔딩 크레딧
  | "post_credits"; // 쿠키 영상 타이틀

export interface TitleCard {
  id: string;
  projectId: string; // paperclipId
  kind: TitleKind;
  label: string; // e.g. "Main Title — DECODE"
  text?: string; // displayed text
  font?: string;
  durationSec?: number;
  designer?: string;
  status: TitleStatus;
  note?: string;
}

export const mockTitleCards: TitleCard[] = [
  // ID-001 DECODE
  {
    id: "TIT-001-01",
    projectId: "ID-001",
    kind: "main_title",
    label: "Main Title",
    text: "DECODE",
    font: "Anton Condensed Bold",
    durationSec: 4,
    designer: "PRANK Studios",
    status: "approved",
    note: "페이드인 + 글리치 트랜지션",
  },
  {
    id: "TIT-001-02",
    projectId: "ID-001",
    kind: "opening_credits",
    label: "Opening Credits Sequence",
    durationSec: 90,
    designer: "PRANK Studios",
    status: "review",
    note: "Saul Bass 레퍼런스 · 키네틱 타이포그래피",
  },
  {
    id: "TIT-001-03",
    projectId: "ID-001",
    kind: "subtitle_card",
    label: "Location Card — 서울, 2026",
    text: "SEOUL · 2026",
    font: "Space Mono",
    durationSec: 2,
    status: "approved",
  },
  {
    id: "TIT-001-04",
    projectId: "ID-001",
    kind: "subtitle_card",
    label: "Time Card — 72시간 후",
    text: "72 HOURS LATER",
    font: "Space Mono",
    durationSec: 2,
    status: "draft",
  },
  {
    id: "TIT-001-05",
    projectId: "ID-001",
    kind: "end_credits",
    label: "End Credits Roll",
    durationSec: 420,
    designer: "PRANK Studios",
    status: "draft",
    note: "DGA 표준 크레딧 순서 · 90 cast/crew",
  },
  // ID-002 어머니의 이력서
  {
    id: "TIT-002-01",
    projectId: "ID-002",
    kind: "main_title",
    label: "Main Title",
    text: "어머니의 이력서",
    font: "본명조 Bold",
    durationSec: 5,
    status: "draft",
  },
  {
    id: "TIT-002-02",
    projectId: "ID-002",
    kind: "end_credits",
    label: "End Credits",
    durationSec: 180,
    status: "draft",
  },
];

export function findTitlesByProject(projectId: string): TitleCard[] {
  return mockTitleCards.filter((t) => t.projectId === projectId);
}

export function computeTitleSummary(cards: TitleCard[]) {
  const total = cards.length;
  const approved = cards.filter((c) => c.status === "approved" || c.status === "locked").length;
  const review = cards.filter((c) => c.status === "review").length;
  const draft = cards.filter((c) => c.status === "draft").length;
  return { total, approved, review, draft };
}
