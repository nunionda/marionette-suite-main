// Music Licensing — Sprint 11 #53
// 음악 사용 권리 취득 및 라이선싱 현황

export type LicenseType = "sync" | "master" | "original" | "public-domain";
export type LicenseStatus = "needed" | "negotiating" | "licensed" | "cleared";
export type UsageType = "title" | "score" | "source" | "credits" | "trailer";

export interface MusicLicense {
  id: string;
  projectId: string;
  trackTitle: string;
  artist?: string;
  publisher?: string;
  licenseType: LicenseType;
  usageType: UsageType;
  territories: string[];
  feeKRW?: number;
  status: LicenseStatus;
  expiryDate?: string;
  note?: string;
}

export const mockMusicLicenses: MusicLicense[] = [
  // ID-001 DECODE
  {
    id: "ML-001-01",
    projectId: "ID-001",
    trackTitle: "오프닝 테마 (오리지널)",
    licenseType: "original",
    usageType: "title",
    territories: ["KR", "WORLD"],
    status: "licensed",
    note: "작곡가 박승찬 — 완전 양도 계약",
  },
  {
    id: "ML-001-02",
    projectId: "ID-001",
    trackTitle: "Neon Pulse",
    artist: "Synthwave KR",
    publisher: "SM Music Publishing",
    licenseType: "sync",
    usageType: "source",
    territories: ["KR", "ASIA"],
    feeKRW: 3_500_000,
    status: "licensed",
    expiryDate: "2028-12-31",
  },
  {
    id: "ML-001-03",
    projectId: "ID-001",
    trackTitle: "Moonlight Sonata Op.27 No.2",
    artist: "Beethoven",
    licenseType: "public-domain",
    usageType: "score",
    territories: ["WORLD"],
    feeKRW: 0,
    status: "cleared",
    note: "퍼블릭 도메인 — 연주 레코딩만 master 확인 필요",
  },
  {
    id: "ML-001-04",
    projectId: "ID-001",
    trackTitle: "End Credits Suite (오리지널)",
    licenseType: "original",
    usageType: "credits",
    territories: ["WORLD"],
    status: "negotiating",
    note: "작곡 의뢰 중 — 3개 스튜디오 견적 비교",
  },
  {
    id: "ML-001-05",
    projectId: "ID-001",
    trackTitle: "Trailer Hit Score",
    licenseType: "sync",
    usageType: "trailer",
    territories: ["WORLD"],
    feeKRW: 8_000_000,
    status: "needed",
    note: "예고편 전용 — 글로벌 배급 확정 후 진행",
  },
  // ID-002
  {
    id: "ML-002-01",
    projectId: "ID-002",
    trackTitle: "메인 테마 (오리지널)",
    licenseType: "original",
    usageType: "title",
    territories: ["WORLD"],
    status: "licensed",
  },
  {
    id: "ML-002-02",
    projectId: "ID-002",
    trackTitle: "Retro City Beat",
    artist: "DJ Hangang",
    publisher: "Kakao Entertainment",
    licenseType: "master",
    usageType: "source",
    territories: ["KR"],
    feeKRW: 1_200_000,
    status: "negotiating",
  },
];

export function findLicensesByProject(projectId: string): MusicLicense[] {
  return mockMusicLicenses.filter((l) => l.projectId === projectId);
}

export function summarizeLicenses(licenses: MusicLicense[]) {
  const total = licenses.length;
  const cleared = licenses.filter(
    (l) => l.status === "cleared" || l.status === "licensed",
  ).length;
  const totalFee = licenses.reduce((s, l) => s + (l.feeKRW ?? 0), 0);
  return { total, cleared, totalFee };
}

export const LICENSE_TYPE_LABEL: Record<LicenseType, string> = {
  sync: "싱크",
  master: "마스터",
  original: "오리지널",
  "public-domain": "퍼블릭 도메인",
};

export const STATUS_COLOR: Record<LicenseStatus, string> = {
  needed: "#707070",
  negotiating: "#facc15",
  licensed: "#60a5fa",
  cleared: "#00FF41",
};

export const STATUS_LABEL: Record<LicenseStatus, string> = {
  needed: "필요",
  negotiating: "협상 중",
  licensed: "계약 완료",
  cleared: "클리어",
};

export const USAGE_LABEL: Record<UsageType, string> = {
  title: "타이틀",
  score: "스코어",
  source: "소스",
  credits: "크레딧",
  trailer: "예고편",
};
