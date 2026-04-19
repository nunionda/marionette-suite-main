export type DeliverableStatus =
  | "pending"
  | "encoding"
  | "qc"
  | "approved"
  | "delivered";

export interface Deliverable {
  id: string;
  projectId: string;
  name: string;
  platform: string;
  spec: string;
  status: DeliverableStatus;
  dueDate?: string;
  fileSize?: string;
  notes?: string;
}

export const STATUS_COLOR: Record<DeliverableStatus, string> = {
  pending:   "#707070",
  encoding:  "#60a5fa",
  qc:        "#f59e0b",
  approved:  "#00FF41",
  delivered: "#22c55e",
};

export const STATUS_LABEL: Record<DeliverableStatus, string> = {
  pending:   "대기",
  encoding:  "인코딩",
  qc:        "QC",
  approved:  "승인",
  delivered: "납품완료",
};

export const MOCK_DELIVERABLES: Deliverable[] = [
  {
    id: "dl-001",
    projectId: "BEAT-SAVIOR",
    name: "DCP 극장용",
    platform: "극장",
    spec: "JPEG2000 4K / Dolby Atmos",
    status: "approved",
    dueDate: "2026-05-01",
    fileSize: "280 GB",
  },
  {
    id: "dl-002",
    projectId: "BEAT-SAVIOR",
    name: "넷플릭스 4K HDR",
    platform: "Netflix",
    spec: "H.265 HDR10 / Atmos",
    status: "encoding",
    dueDate: "2026-05-10",
    notes: "R3 픽처 락 완료 후 인코딩 시작",
  },
  {
    id: "dl-003",
    projectId: "BEAT-SAVIOR",
    name: "왓챠 FHD",
    platform: "Watcha",
    spec: "H.264 1080p / 5.1",
    status: "pending",
    dueDate: "2026-05-15",
  },
  {
    id: "dl-004",
    projectId: "BEAT-SAVIOR",
    name: "국제 배급 ProRes",
    platform: "International",
    spec: "ProRes 4444 / Stereo",
    status: "qc",
    dueDate: "2026-05-05",
    fileSize: "1.2 TB",
    notes: "컬러 메타데이터 검증 진행 중",
  },
  {
    id: "dl-005",
    projectId: "PROJECT-NOVA",
    name: "DCP 극장용",
    platform: "극장",
    spec: "JPEG2000 4K / Dolby Atmos",
    status: "pending",
    dueDate: "2026-06-15",
  },
  {
    id: "dl-006",
    projectId: "PROJECT-NOVA",
    name: "스트리밍 패키지",
    platform: "OTT",
    spec: "H.265 4K HDR / Atmos",
    status: "pending",
    dueDate: "2026-06-20",
  },
];
