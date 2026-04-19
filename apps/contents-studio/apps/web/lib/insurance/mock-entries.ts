// Insurance / Legal — Sprint 10 #31
// Production insurance policies and legal clearances per project.

export type InsuranceType =
  | "production"
  | "equipment"
  | "liability"
  | "workers-comp"
  | "euo"
  | "errors-omissions";

export type InsuranceStatus = "needed" | "quoted" | "bound" | "active";

export interface InsurancePolicy {
  id: string;
  projectId: string;
  policyType: InsuranceType;
  insurer?: string;
  broker?: string;
  coverageKRW?: number;
  annualPremiumKRW?: number;
  status: InsuranceStatus;
  effectiveDate?: string;
  expiresDate?: string;
  note?: string;
}

export const mockInsurance: InsurancePolicy[] = [
  // ID-001 DECODE
  {
    id: "INS-001-01",
    projectId: "ID-001",
    policyType: "production",
    insurer: "한화손해보험",
    broker: "아이언브로커리지",
    coverageKRW: 5_000_000_000,
    annualPremiumKRW: 12_000_000,
    status: "active",
    effectiveDate: "2026-04-01",
    expiresDate: "2027-03-31",
    note: "촬영 중단 손해 포함",
  },
  {
    id: "INS-001-02",
    projectId: "ID-001",
    policyType: "equipment",
    insurer: "삼성화재",
    broker: "아이언브로커리지",
    coverageKRW: 800_000_000,
    annualPremiumKRW: 3_500_000,
    status: "active",
    effectiveDate: "2026-05-01",
    expiresDate: "2026-10-31",
  },
  {
    id: "INS-001-03",
    projectId: "ID-001",
    policyType: "liability",
    insurer: "DB손해보험",
    coverageKRW: 1_000_000_000,
    annualPremiumKRW: 2_200_000,
    status: "bound",
    effectiveDate: "2026-05-15",
    expiresDate: "2026-12-31",
  },
  {
    id: "INS-001-04",
    projectId: "ID-001",
    policyType: "workers-comp",
    insurer: "근로복지공단",
    coverageKRW: 500_000_000,
    annualPremiumKRW: 1_800_000,
    status: "active",
    effectiveDate: "2026-04-01",
    expiresDate: "2026-12-31",
    note: "스턴트 추가 특약 포함",
  },
  {
    id: "INS-001-05",
    projectId: "ID-001",
    policyType: "errors-omissions",
    broker: "법무법인 세움",
    status: "quoted",
    note: "배급 계약 완료 후 바인딩 예정",
  },
  // ID-002
  {
    id: "INS-002-01",
    projectId: "ID-002",
    policyType: "production",
    insurer: "현대해상",
    coverageKRW: 2_000_000_000,
    annualPremiumKRW: 6_000_000,
    status: "bound",
    effectiveDate: "2026-06-01",
    expiresDate: "2027-05-31",
  },
  {
    id: "INS-002-02",
    projectId: "ID-002",
    policyType: "equipment",
    status: "needed",
    note: "촬영 장비 확정 후 견적 예정",
  },
];

export function findInsuranceByProject(projectId: string): InsurancePolicy[] {
  return mockInsurance.filter((p) => p.projectId === projectId);
}

export function summarizeInsurance(policies: InsurancePolicy[]) {
  const total = policies.length;
  const active = policies.filter(
    (p) => p.status === "active" || p.status === "bound",
  ).length;
  const pending = policies.filter(
    (p) => p.status === "quoted" || p.status === "needed",
  ).length;
  const totalPremiumKRW = policies.reduce(
    (s, p) => s + (p.annualPremiumKRW ?? 0),
    0,
  );
  const totalCoverageKRW = policies.reduce(
    (s, p) => s + (p.coverageKRW ?? 0),
    0,
  );
  return { total, active, pending, totalPremiumKRW, totalCoverageKRW };
}

export const INSURANCE_TYPE_LABEL: Record<InsuranceType, string> = {
  production: "제작보험",
  equipment: "장비보험",
  liability: "배상책임",
  "workers-comp": "산재보험",
  euo: "E&O (오류·누락)",
  "errors-omissions": "E&O",
};

export const INSURANCE_TYPE_COLOR: Record<InsuranceType, string> = {
  production: "#00FF41",
  equipment: "#facc15",
  liability: "#60a5fa",
  "workers-comp": "#f472b6",
  euo: "#a78bfa",
  "errors-omissions": "#a78bfa",
};
