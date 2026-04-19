// Talent Contracts — Sprint 10 #21 (Casting Contract)
// Legal agreements with cast members; extends casting audition data.

export type TalentContractStatus =
  | "negotiating"
  | "offered"
  | "signed"
  | "declined";

export interface TalentContract {
  id: string;
  projectId: string;
  actorName: string;
  characterName: string;
  role: "lead" | "supporting" | "minor";
  agencyName?: string;
  feeKRW: number;
  shootDays: number;
  status: TalentContractStatus;
  signedDate?: string;
  exclusivity: boolean;
  note?: string;
}

export const mockTalentContracts: TalentContract[] = [
  // ID-001 DECODE
  {
    id: "TC-001-01",
    projectId: "ID-001",
    actorName: "이민준",
    characterName: "박도현",
    role: "lead",
    agencyName: "SM C&C",
    feeKRW: 120_000_000,
    shootDays: 42,
    status: "signed",
    signedDate: "2026-04-10",
    exclusivity: true,
    note: "넷플릭스 창구 제한 조항 포함",
  },
  {
    id: "TC-001-02",
    projectId: "ID-001",
    actorName: "김서연",
    characterName: "최유리",
    role: "lead",
    agencyName: "YG Entertainment",
    feeKRW: 95_000_000,
    shootDays: 38,
    status: "signed",
    signedDate: "2026-04-15",
    exclusivity: true,
  },
  {
    id: "TC-001-03",
    projectId: "ID-001",
    actorName: "박준혁",
    characterName: "장철우",
    role: "supporting",
    agencyName: "BH Entertainment",
    feeKRW: 35_000_000,
    shootDays: 18,
    status: "offered",
    exclusivity: false,
    note: "에이전시 검토 중 — 회신 D+3",
  },
  {
    id: "TC-001-04",
    projectId: "ID-001",
    actorName: "최나리",
    characterName: "오미경",
    role: "supporting",
    agencyName: "Siren Pictures",
    feeKRW: 22_000_000,
    shootDays: 12,
    status: "negotiating",
    exclusivity: false,
  },
  // ID-002
  {
    id: "TC-002-01",
    projectId: "ID-002",
    actorName: "한강현",
    characterName: "강민수",
    role: "lead",
    agencyName: "Management SOOP",
    feeKRW: 55_000_000,
    shootDays: 30,
    status: "signed",
    signedDate: "2026-05-02",
    exclusivity: true,
  },
];

export function findTalentContractsByProject(
  projectId: string,
): TalentContract[] {
  return mockTalentContracts.filter((t) => t.projectId === projectId);
}

export function summarizeTalentContracts(contracts: TalentContract[]) {
  const total = contracts.length;
  const signed = contracts.filter((c) => c.status === "signed").length;
  const pending = contracts.filter(
    (c) => c.status === "negotiating" || c.status === "offered",
  ).length;
  const leads = contracts.filter((c) => c.role === "lead").length;
  const leadsLocked = contracts.filter(
    (c) => c.role === "lead" && c.status === "signed",
  ).length;
  const totalFeeKRW = contracts.reduce((s, c) => s + c.feeKRW, 0);
  return { total, signed, pending, leads, leadsLocked, totalFeeKRW };
}
