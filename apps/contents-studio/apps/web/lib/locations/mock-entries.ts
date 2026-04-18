// Locations module — Sprint 4 #18 (Location Scouting)
// Mock data. Later sprints can link to Google Maps / location DB.

export type LocationStatus =
  | "scouting" // searching
  | "shortlisted" // candidate identified
  | "permitted" // permit obtained
  | "confirmed" // locked for shoot
  | "rejected";

export interface ScoutedLocation {
  id: string;
  projectId: string; // paperclipId
  name: string;
  address: string;
  interior: boolean;
  status: LocationStatus;
  permitStatus?: "none" | "pending" | "approved";
  dailyRateKRW?: number;
  contact?: string;
  sceneIds?: string[]; // scenes this location serves
  note?: string;
}

export const mockLocations: ScoutedLocation[] = [
  // ID-001 DECODE
  {
    id: "LOC-001-01",
    projectId: "ID-001",
    name: "강남 오피스",
    address: "서울 강남구 테헤란로 123",
    interior: true,
    status: "confirmed",
    permitStatus: "approved",
    dailyRateKRW: 3_500_000,
    contact: "한성 프로덕션 서비스",
    sceneIds: ["S1", "S2", "S3", "S4", "S5", "S6"],
    note: "오프닝 시퀀스 · 엘리베이터 사용 가능",
  },
  {
    id: "LOC-001-02",
    projectId: "ID-001",
    name: "해운대 해변",
    address: "부산 해운대구 해운대해수욕장",
    interior: false,
    status: "permitted",
    permitStatus: "approved",
    dailyRateKRW: 2_100_000,
    contact: "부산 촬영 지원센터",
    sceneIds: ["S7", "S8", "S9", "S10", "S11"],
    note: "magic hour 촬영 · 일몰 19:15",
  },
  {
    id: "LOC-001-03",
    projectId: "ID-001",
    name: "한남동 주택",
    address: "서울 용산구 한남대로 45",
    interior: true,
    status: "shortlisted",
    permitStatus: "pending",
    dailyRateKRW: 4_200_000,
    contact: "한남 헤리티지",
    sceneIds: ["S12", "S13", "S14"],
  },
  {
    id: "LOC-001-04",
    projectId: "ID-001",
    name: "교외 창고 (미정)",
    address: "경기 남양주시 일대",
    interior: true,
    status: "scouting",
    permitStatus: "none",
    sceneIds: ["S28", "S29"],
    note: "3곳 답사 예정",
  },
  // ID-002
  {
    id: "LOC-002-01",
    projectId: "ID-002",
    name: "대구 동성로 카페",
    address: "대구 중구 동성로 66",
    interior: true,
    status: "confirmed",
    permitStatus: "approved",
    dailyRateKRW: 1_200_000,
    contact: "카페 주인장 직접",
    sceneIds: ["S1", "S2"],
    note: "일요일 촬영 필수 (평일 영업)",
  },
  {
    id: "LOC-002-02",
    projectId: "ID-002",
    name: "대구 집",
    address: "대구 수성구",
    interior: true,
    status: "shortlisted",
    permitStatus: "pending",
    sceneIds: ["S3", "S4", "S5"],
  },
];

export function findLocationsByProject(projectId: string): ScoutedLocation[] {
  return mockLocations.filter((l) => l.projectId === projectId);
}

export function computeLocationSummary(locations: ScoutedLocation[]) {
  const total = locations.length;
  const confirmed = locations.filter((l) => l.status === "confirmed").length;
  const permitted = locations.filter(
    (l) => l.status === "permitted" || l.status === "confirmed",
  ).length;
  const scouting = locations.filter(
    (l) => l.status === "scouting" || l.status === "shortlisted",
  ).length;
  return { total, confirmed, permitted, scouting };
}
