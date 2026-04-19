// Archive / Rights Management — Sprint 11 #74
// 콘텐츠 아카이브 및 저작권 관리

export type ArchiveStatus = "active" | "licensed-out" | "expired" | "restricted";
export type AssetCategory =
  | "original-camera-negative"
  | "digital-master"
  | "intermediate"
  | "audio-stem"
  | "music-stem"
  | "vfx-element"
  | "script"
  | "legal-document"
  | "marketing-asset";

export interface ArchiveAsset {
  id: string;
  projectId: string;
  assetCategory: AssetCategory;
  description: string;
  format?: string; // e.g. "4K DPX", "WAV 96kHz", "PDF"
  storageLocation?: string; // e.g. "Iron Mountain Seoul", "AWS S3 ap-northeast-2"
  retentionYears?: number;
  rightsExpiryDate?: string;
  rightsHolder?: string;
  status: ArchiveStatus;
  notes?: string;
}

export const mockArchiveAssets: ArchiveAsset[] = [
  // ID-001 DECODE
  {
    id: "AR-001-01",
    projectId: "ID-001",
    assetCategory: "digital-master",
    description: "4K HDR 디지털 마스터 (DCP + ProRes)",
    format: "4K DCP / ProRes 4444 XQ",
    storageLocation: "Iron Mountain Seoul + AWS S3 ap-northeast-2",
    retentionYears: 50,
    rightsHolder: "Marionette Studios / ID-001",
    status: "active",
  },
  {
    id: "AR-001-02",
    projectId: "ID-001",
    assetCategory: "audio-stem",
    description: "Atmos 7.1.4 최종 믹스 스템",
    format: "WAV 96kHz / 24bit",
    storageLocation: "AWS S3 ap-northeast-2",
    retentionYears: 50,
    rightsHolder: "Marionette Studios / ID-001",
    status: "active",
  },
  {
    id: "AR-001-03",
    projectId: "ID-001",
    assetCategory: "vfx-element",
    description: "VFX 렌더 레이어 (EXR 시퀀스)",
    format: "OpenEXR 16bit",
    storageLocation: "AWS S3 Glacier ap-northeast-2",
    retentionYears: 20,
    rightsHolder: "VFX Studio (라이선스 계약)",
    status: "active",
    notes: "소유권 협상 중 — 현재 라이선스 보유",
  },
  {
    id: "AR-001-04",
    projectId: "ID-001",
    assetCategory: "music-stem",
    description: "오리지널 스코어 스템",
    format: "WAV 48kHz / 24bit",
    storageLocation: "AWS S3 ap-northeast-2",
    retentionYears: 70,
    rightsHolder: "Marionette Studios + 작곡가 박승찬",
    rightsExpiryDate: "2096-01-01",
    status: "active",
  },
  {
    id: "AR-001-05",
    projectId: "ID-001",
    assetCategory: "script",
    description: "최종 확정 대본 (Script Lock)",
    format: "PDF / FDX",
    storageLocation: "AWS S3 ap-northeast-2 + 법무법인 보관",
    retentionYears: 70,
    rightsHolder: "김현수 감독 / Marionette Studios",
    status: "active",
  },
  {
    id: "AR-001-06",
    projectId: "ID-001",
    assetCategory: "legal-document",
    description: "전체 계약서 아카이브",
    format: "PDF",
    storageLocation: "법무법인 + AWS S3 (암호화)",
    retentionYears: 30,
    rightsHolder: "Marionette Studios",
    status: "active",
  },
  // ID-002
  {
    id: "AR-002-01",
    projectId: "ID-002",
    assetCategory: "digital-master",
    description: "디지털 마스터",
    format: "2K DCP",
    retentionYears: 30,
    status: "active",
  },
];

export function findArchiveByProject(projectId: string): ArchiveAsset[] {
  return mockArchiveAssets.filter((a) => a.projectId === projectId);
}

export const CATEGORY_LABEL: Record<AssetCategory, string> = {
  "original-camera-negative": "원본 카메라 네거티브",
  "digital-master": "디지털 마스터",
  intermediate: "인터미디에이트",
  "audio-stem": "오디오 스템",
  "music-stem": "음악 스템",
  "vfx-element": "VFX 소스",
  script: "대본",
  "legal-document": "법무 서류",
  "marketing-asset": "마케팅 자료",
};

export const STATUS_COLOR: Record<ArchiveStatus, string> = {
  active: "#00FF41",
  "licensed-out": "#60a5fa",
  expired: "#707070",
  restricted: "#f87171",
};

export const STATUS_LABEL: Record<ArchiveStatus, string> = {
  active: "보관 중",
  "licensed-out": "라이선스 아웃",
  expired: "만료",
  restricted: "제한",
};
