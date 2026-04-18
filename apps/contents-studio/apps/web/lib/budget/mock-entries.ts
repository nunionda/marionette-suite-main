// Budget module — Sprint 1 #17
// Mock data. Later sprints will back this with contents-studio-api or a
// dedicated budget DB.

export type BudgetStatus = "draft" | "submitted" | "approved" | "locked";

export interface BudgetLineItem {
  department: string; // "Production", "Design", "Camera", "Sound", "Post", "VFX"
  allocated: number; // KRW
  spent: number; // KRW
  note?: string;
}

export interface ProjectBudget {
  projectId: string; // paperclipId
  totalAllocated: number; // KRW
  currency: "KRW";
  status: BudgetStatus;
  approvedBy?: string;
  approvedAt?: string; // ISO
  lineItems: BudgetLineItem[];
  updatedAt: string; // ISO
}

export const mockBudgets: ProjectBudget[] = [
  {
    projectId: "ID-001", // DECODE
    totalAllocated: 8_500_000_000, // ₩8.5B
    currency: "KRW",
    status: "approved",
    approvedBy: "STE CFO",
    approvedAt: "2026-03-12",
    updatedAt: "2026-04-18",
    lineItems: [
      { department: "Production", allocated: 2_000_000_000, spent: 1_420_000_000 },
      { department: "Design", allocated: 1_500_000_000, spent: 980_000_000, note: "Art Bible · 11 섹션" },
      { department: "Camera", allocated: 900_000_000, spent: 450_000_000 },
      { department: "Sound", allocated: 650_000_000, spent: 210_000_000 },
      { department: "VFX", allocated: 2_200_000_000, spent: 1_100_000_000, note: "247 shots" },
      { department: "Post", allocated: 1_250_000_000, spent: 380_000_000 },
    ],
  },
  {
    projectId: "ID-002", // 어머니의 이력서
    totalAllocated: 1_200_000_000, // ₩1.2B
    currency: "KRW",
    status: "submitted",
    updatedAt: "2026-04-10",
    lineItems: [
      { department: "Production", allocated: 400_000_000, spent: 0 },
      { department: "Design", allocated: 180_000_000, spent: 0 },
      { department: "Camera", allocated: 220_000_000, spent: 0 },
      { department: "Sound", allocated: 150_000_000, spent: 0 },
      { department: "Post", allocated: 250_000_000, spent: 0 },
    ],
  },
];

export function findBudgetByProject(projectId: string): ProjectBudget | undefined {
  return mockBudgets.find((b) => b.projectId === projectId);
}

export function computeBudgetSummary(b: ProjectBudget) {
  const spent = b.lineItems.reduce((acc, li) => acc + li.spent, 0);
  const remaining = b.totalAllocated - spent;
  const burnRatePct = b.totalAllocated > 0
    ? Math.round((spent / b.totalAllocated) * 100)
    : 0;
  return { spent, remaining, burnRatePct };
}
