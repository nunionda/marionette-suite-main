// DCP Mastering — Sprint 11 #61
// Digital Cinema Package 마스터링 및 납품

export type DCPStatus = "not-started" | "mastering" | "kdm-pending" | "delivered" | "screened";
export type DCPFormat = "2D" | "3D" | "IMAX" | "4DX" | "Dolby Vision" | "HDR10";

export interface DCPPackage {
  id: string;
  projectId: string;
  version: string;
  format: DCPFormat;
  resolution: "2K" | "4K";
  audioChannels: number;
  aspectRatio: string;
  durationMin: number;
  fileSizeGB?: number;
  masteringHouse?: string;
  deliveredTo?: string;
  deliveryDate?: string;
  kdmExpiry?: string;
  status: DCPStatus;
  note?: string;
}

export const mockDCPPackages: DCPPackage[] = [
  // ID-001 DECODE
  {
    id: "DCP-001-01",
    projectId: "ID-001",
    version: "INT'L v1.0",
    format: "2D",
    resolution: "4K",
    audioChannels: 16,
    aspectRatio: "2.39:1",
    durationMin: 118,
    fileSizeGB: 280,
    masteringHouse: "CJ ENM DCP Lab",
    status: "mastering",
    note: "Dolby Atmos 7.1.4 베드 포함",
  },
  {
    id: "DCP-001-02",
    projectId: "ID-001",
    version: "Festival v1.0 (Subtitled EN)",
    format: "2D",
    resolution: "2K",
    audioChannels: 8,
    aspectRatio: "2.39:1",
    durationMin: 118,
    fileSizeGB: 145,
    masteringHouse: "CJ ENM DCP Lab",
    deliveredTo: "Busan IFF",
    deliveryDate: "2027-09-01",
    kdmExpiry: "2027-10-30",
    status: "delivered",
  },
  {
    id: "DCP-001-03",
    projectId: "ID-001",
    version: "IMAX v1.0",
    format: "IMAX",
    resolution: "4K",
    audioChannels: 12,
    aspectRatio: "1.90:1",
    durationMin: 118,
    masteringHouse: "IMAX Korea",
    status: "not-started",
    note: "IMAX DMR 확정 후 진행",
  },
  // ID-002
  {
    id: "DCP-002-01",
    projectId: "ID-002",
    version: "INT'L v1.0",
    format: "2D",
    resolution: "2K",
    audioChannels: 8,
    aspectRatio: "1.85:1",
    durationMin: 94,
    status: "not-started",
  },
];

export function findDCPByProject(projectId: string): DCPPackage[] {
  return mockDCPPackages.filter((d) => d.projectId === projectId);
}

export const STATUS_COLOR: Record<DCPStatus, string> = {
  "not-started": "#707070",
  mastering: "#facc15",
  "kdm-pending": "#a78bfa",
  delivered: "#60a5fa",
  screened: "#00FF41",
};

export const STATUS_LABEL: Record<DCPStatus, string> = {
  "not-started": "미착수",
  mastering: "마스터링",
  "kdm-pending": "KDM 대기",
  delivered: "납품 완료",
  screened: "상영 완료",
};
