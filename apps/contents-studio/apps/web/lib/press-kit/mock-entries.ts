// PR / Press Kit — Sprint 11 #66
// 홍보 자료 및 언론 배포 키트

export type PressAssetStatus = "missing" | "in-progress" | "ready" | "distributed";
export type PressAssetType =
  | "production-notes"
  | "director-statement"
  | "cast-bio"
  | "synopsis-long"
  | "synopsis-short"
  | "stills"
  | "poster"
  | "trailer"
  | "epr"; // Electronic Press Release

export interface PressAsset {
  id: string;
  projectId: string;
  assetType: PressAssetType;
  title: string;
  language: string;
  assignedTo?: string;
  dueDate?: string;
  distributedDate?: string;
  outletCount?: number; // press outlets reached
  status: PressAssetStatus;
  note?: string;
}

export const mockPressAssets: PressAsset[] = [
  // ID-001 DECODE
  {
    id: "PK-001-01",
    projectId: "ID-001",
    assetType: "production-notes",
    title: "프로덕션 노트 (KO)",
    language: "KO",
    assignedTo: "홍보팀",
    dueDate: "2027-01-15",
    status: "in-progress",
  },
  {
    id: "PK-001-02",
    projectId: "ID-001",
    assetType: "production-notes",
    title: "Production Notes (EN)",
    language: "EN",
    dueDate: "2027-01-15",
    status: "missing",
    note: "KO 완료 후 번역",
  },
  {
    id: "PK-001-03",
    projectId: "ID-001",
    assetType: "director-statement",
    title: "감독의 말 (KO/EN)",
    language: "KO/EN",
    assignedTo: "김현수 감독",
    status: "ready",
  },
  {
    id: "PK-001-04",
    projectId: "ID-001",
    assetType: "synopsis-short",
    title: "시놉시스 (단문 100자)",
    language: "KO",
    status: "ready",
  },
  {
    id: "PK-001-05",
    projectId: "ID-001",
    assetType: "stills",
    title: "프레스 스틸 30장",
    language: "N/A",
    assignedTo: "스틸 포토그래퍼",
    dueDate: "2027-01-20",
    status: "in-progress",
    note: "DCP 납품 후 확정 스틸 선별",
  },
  {
    id: "PK-001-06",
    projectId: "ID-001",
    assetType: "epr",
    title: "전자 프레스 릴리즈",
    language: "KO",
    dueDate: "2027-02-15",
    distributedDate: "2027-02-16",
    outletCount: 42,
    status: "distributed",
  },
  {
    id: "PK-001-07",
    projectId: "ID-001",
    assetType: "cast-bio",
    title: "주연 배우 바이오 (KO)",
    language: "KO",
    status: "ready",
  },
  // ID-002
  {
    id: "PK-002-01",
    projectId: "ID-002",
    assetType: "synopsis-short",
    title: "시놉시스",
    language: "KO",
    status: "missing",
  },
  {
    id: "PK-002-02",
    projectId: "ID-002",
    assetType: "director-statement",
    title: "감독의 말",
    language: "KO",
    status: "missing",
  },
];

export function findPressByProject(projectId: string): PressAsset[] {
  return mockPressAssets.filter((p) => p.projectId === projectId);
}

export function summarizePress(assets: PressAsset[]) {
  const total = assets.length;
  const ready = assets.filter((a) => a.status === "ready" || a.status === "distributed").length;
  const totalOutlets = assets.reduce((s, a) => s + (a.outletCount ?? 0), 0);
  return { total, ready, totalOutlets };
}

export const ASSET_TYPE_LABEL: Record<PressAssetType, string> = {
  "production-notes": "프로덕션 노트",
  "director-statement": "감독의 말",
  "cast-bio": "배우 바이오",
  "synopsis-long": "시놉시스 (장문)",
  "synopsis-short": "시놉시스 (단문)",
  stills: "스틸컷",
  poster: "포스터",
  trailer: "트레일러",
  epr: "전자 보도자료",
};

export const STATUS_COLOR: Record<PressAssetStatus, string> = {
  missing: "#707070",
  "in-progress": "#facc15",
  ready: "#60a5fa",
  distributed: "#00FF41",
};

export const STATUS_LABEL: Record<PressAssetStatus, string> = {
  missing: "미비",
  "in-progress": "작성 중",
  ready: "준비 완료",
  distributed: "배포 완료",
};
