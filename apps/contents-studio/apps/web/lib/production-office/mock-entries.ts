// Production Office — Sprint 10 #32
// Physical and operational production office setup per project.

export type OfficeItemCategory =
  | "space"
  | "it"
  | "furniture"
  | "comms"
  | "supplies"
  | "catering";

export type OfficeItemStatus = "needed" | "ordered" | "setup" | "operational";

export interface ProductionOfficeItem {
  id: string;
  projectId: string;
  name: string;
  category: OfficeItemCategory;
  quantity?: number;
  vendor?: string;
  monthlyCostKRW?: number;
  oneTimeCostKRW?: number;
  status: OfficeItemStatus;
  note?: string;
}

export const mockProductionOffice: ProductionOfficeItem[] = [
  // ID-001 DECODE
  {
    id: "PO-001-01",
    projectId: "ID-001",
    name: "사무실 임대 (마포구 150평)",
    category: "space",
    quantity: 1,
    vendor: "한국부동산신탁",
    monthlyCostKRW: 8_000_000,
    status: "operational",
    note: "2026-03-01 입주, 2026-12-31 계약",
  },
  {
    id: "PO-001-02",
    projectId: "ID-001",
    name: "아이맥 Pro 작업 스테이션",
    category: "it",
    quantity: 10,
    vendor: "애플코리아",
    oneTimeCostKRW: 45_000_000,
    status: "operational",
  },
  {
    id: "PO-001-03",
    projectId: "ID-001",
    name: "편집실 (Avid Media Composer 라이선스)",
    category: "it",
    quantity: 3,
    vendor: "Avid Technology",
    monthlyCostKRW: 900_000,
    status: "operational",
  },
  {
    id: "PO-001-04",
    projectId: "ID-001",
    name: "회의실 가구 세트",
    category: "furniture",
    quantity: 2,
    vendor: "이케아 코리아",
    oneTimeCostKRW: 6_000_000,
    status: "operational",
  },
  {
    id: "PO-001-05",
    projectId: "ID-001",
    name: "전화/인터넷 회선 (기가 인터넷 10회선)",
    category: "comms",
    quantity: 1,
    vendor: "KT 기업사업부",
    monthlyCostKRW: 500_000,
    status: "operational",
  },
  {
    id: "PO-001-06",
    projectId: "ID-001",
    name: "워키토키 + 기지국 세트",
    category: "comms",
    quantity: 30,
    vendor: "모토로라 코리아",
    monthlyCostKRW: 800_000,
    status: "setup",
    note: "촬영 시작 전 배포 예정",
  },
  {
    id: "PO-001-07",
    projectId: "ID-001",
    name: "사무용품 예산",
    category: "supplies",
    monthlyCostKRW: 300_000,
    status: "operational",
  },
  {
    id: "PO-001-08",
    projectId: "ID-001",
    name: "케이터링 서비스 (촬영일 기준)",
    category: "catering",
    vendor: "온셋케이터링",
    monthlyCostKRW: 5_000_000,
    status: "ordered",
    note: "촬영 시작일 (2026-06-10) 부터 가동",
  },
  // ID-002
  {
    id: "PO-002-01",
    projectId: "ID-002",
    name: "소규모 제작사무실 임대 (대구, 30평)",
    category: "space",
    quantity: 1,
    vendor: "대구부동산",
    monthlyCostKRW: 1_500_000,
    status: "setup",
    note: "2026-05-15 입주",
  },
  {
    id: "PO-002-02",
    projectId: "ID-002",
    name: "노트북 + 모니터 세트",
    category: "it",
    quantity: 4,
    oneTimeCostKRW: 8_000_000,
    status: "ordered",
  },
  {
    id: "PO-002-03",
    projectId: "ID-002",
    name: "케이터링 (촬영일 기준)",
    category: "catering",
    status: "needed",
    note: "대구 지역 케이터링사 문의 중",
  },
];

export function findProductionOfficeByProject(
  projectId: string,
): ProductionOfficeItem[] {
  return mockProductionOffice.filter((o) => o.projectId === projectId);
}

export function summarizeProductionOffice(items: ProductionOfficeItem[]) {
  const total = items.length;
  const operational = items.filter(
    (o) => o.status === "operational" || o.status === "setup",
  ).length;
  const pending = items.filter(
    (o) => o.status === "needed" || o.status === "ordered",
  ).length;
  const monthlyKRW = items.reduce((s, o) => s + (o.monthlyCostKRW ?? 0), 0);
  const oneTimeKRW = items.reduce((s, o) => s + (o.oneTimeCostKRW ?? 0), 0);
  return { total, operational, pending, monthlyKRW, oneTimeKRW };
}

export const OFFICE_CATEGORY_LABEL: Record<OfficeItemCategory, string> = {
  space: "공간",
  it: "IT/장비",
  furniture: "가구",
  comms: "통신",
  supplies: "소모품",
  catering: "케이터링",
};

export const OFFICE_CATEGORY_COLOR: Record<OfficeItemCategory, string> = {
  space: "#00FF41",
  it: "#facc15",
  furniture: "#60a5fa",
  comms: "#f472b6",
  supplies: "#a78bfa",
  catering: "#fb923c",
};
