// Equipment Prep — Sprint 10 #27
// Rental and owned equipment per project; camera, grip, lighting, sound, transport.

export type EquipmentCategory =
  | "camera"
  | "lens"
  | "grip"
  | "lighting"
  | "sound"
  | "transport"
  | "power"
  | "storage";

export type EquipmentStatus =
  | "needed"
  | "sourcing"
  | "reserved"
  | "confirmed";

export interface EquipmentItem {
  id: string;
  projectId: string;
  name: string;
  category: EquipmentCategory;
  quantity: number;
  vendor?: string;
  rentalDays?: number;
  dailyRateKRW?: number;
  status: EquipmentStatus;
  note?: string;
}

export const mockEquipment: EquipmentItem[] = [
  // ID-001 DECODE
  {
    id: "EQ-001-01",
    projectId: "ID-001",
    name: "ARRI ALEXA 35",
    category: "camera",
    quantity: 2,
    vendor: "서울카메라렌탈",
    rentalDays: 30,
    dailyRateKRW: 1_200_000,
    status: "confirmed",
  },
  {
    id: "EQ-001-02",
    projectId: "ID-001",
    name: "ARRI Master Prime 세트 (6종)",
    category: "lens",
    quantity: 1,
    vendor: "서울카메라렌탈",
    rentalDays: 30,
    dailyRateKRW: 800_000,
    status: "confirmed",
  },
  {
    id: "EQ-001-03",
    projectId: "ID-001",
    name: "테크노크레인 30ft",
    category: "grip",
    quantity: 1,
    vendor: "그립코리아",
    rentalDays: 10,
    dailyRateKRW: 650_000,
    status: "reserved",
    note: "6/10~6/20 예약 완료",
  },
  {
    id: "EQ-001-04",
    projectId: "ID-001",
    name: "SkyPanel S60-C 조명 세트",
    category: "lighting",
    quantity: 12,
    vendor: "라이트팩토리",
    rentalDays: 30,
    dailyRateKRW: 1_100_000,
    status: "confirmed",
  },
  {
    id: "EQ-001-05",
    projectId: "ID-001",
    name: "Sound Devices 888 믹서",
    category: "sound",
    quantity: 1,
    vendor: "사운드랩",
    rentalDays: 30,
    dailyRateKRW: 180_000,
    status: "reserved",
  },
  {
    id: "EQ-001-06",
    projectId: "ID-001",
    name: "촬영용 밴 (대형)",
    category: "transport",
    quantity: 3,
    vendor: "프로덕션카",
    rentalDays: 35,
    dailyRateKRW: 250_000,
    status: "confirmed",
  },
  {
    id: "EQ-001-07",
    projectId: "ID-001",
    name: "발전차 100kVA",
    category: "power",
    quantity: 1,
    vendor: "파워렌탈",
    rentalDays: 20,
    dailyRateKRW: 450_000,
    status: "sourcing",
    note: "부산 로케이션 발전차 별도 필요",
  },
  {
    id: "EQ-001-08",
    projectId: "ID-001",
    name: "DIT 스테이션 (MacBook Pro + RAID)",
    category: "storage",
    quantity: 1,
    vendor: "DIT코리아",
    rentalDays: 30,
    dailyRateKRW: 120_000,
    status: "confirmed",
  },
  // ID-002
  {
    id: "EQ-002-01",
    projectId: "ID-002",
    name: "Sony VENICE 2",
    category: "camera",
    quantity: 1,
    vendor: "미디어렌탈",
    rentalDays: 20,
    dailyRateKRW: 900_000,
    status: "reserved",
  },
  {
    id: "EQ-002-02",
    projectId: "ID-002",
    name: "조명 패키지 (LED 기본)",
    category: "lighting",
    quantity: 1,
    vendor: "TBD",
    rentalDays: 20,
    dailyRateKRW: 400_000,
    status: "sourcing",
    note: "대구 지역 렌탈사 문의 중",
  },
  {
    id: "EQ-002-03",
    projectId: "ID-002",
    name: "촬영용 밴",
    category: "transport",
    quantity: 1,
    vendor: "프로덕션카",
    rentalDays: 22,
    dailyRateKRW: 220_000,
    status: "needed",
  },
];

export function findEquipmentByProject(projectId: string): EquipmentItem[] {
  return mockEquipment.filter((e) => e.projectId === projectId);
}

export function summarizeEquipment(items: EquipmentItem[]) {
  const total = items.length;
  const confirmed = items.filter((e) => e.status === "confirmed").length;
  const reserved = items.filter((e) => e.status === "reserved").length;
  const sourcing = items.filter(
    (e) => e.status === "sourcing" || e.status === "needed",
  ).length;
  const totalRentalKRW = items.reduce(
    (s, e) => s + (e.dailyRateKRW ?? 0) * (e.rentalDays ?? 0),
    0,
  );
  return { total, confirmed, reserved, sourcing, totalRentalKRW };
}

export const CATEGORY_LABEL: Record<EquipmentCategory, string> = {
  camera: "카메라",
  lens: "렌즈",
  grip: "그립",
  lighting: "조명",
  sound: "사운드",
  transport: "이동",
  power: "전력",
  storage: "스토리지",
};

export const CATEGORY_COLOR: Record<EquipmentCategory, string> = {
  camera: "#00FF41",
  lens: "#facc15",
  grip: "#60a5fa",
  lighting: "#f472b6",
  sound: "#a78bfa",
  transport: "#fb923c",
  power: "#34d399",
  storage: "#38bdf8",
};
