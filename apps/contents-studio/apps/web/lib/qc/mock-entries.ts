// QC (Quality Control) — Sprint 11 #60
// 납품 전 기술 품질 검수

export type QCStatus = "pending" | "in-review" | "issues" | "passed";
export type QCCheckType = "video" | "audio" | "subtitle" | "metadata" | "delivery";

export interface QCCheck {
  id: string;
  projectId: string;
  version: string; // e.g. "v1.0", "v1.1-fixes"
  checkType: QCCheckType;
  checkedBy?: string;
  checkedAt?: string;
  issueCount: number;
  criticalIssues: number;
  status: QCStatus;
  notes?: string[];
}

export const mockQCChecks: QCCheck[] = [
  // ID-001 DECODE
  {
    id: "QC-001-01",
    projectId: "ID-001",
    version: "v0.9-rough",
    checkType: "video",
    checkedBy: "QC Lab Seoul",
    checkedAt: "2026-11-10",
    issueCount: 12,
    criticalIssues: 2,
    status: "issues",
    notes: [
      "리ール 3 — 4프레임 듀플리케이트",
      "씬 47 블랙 프레임 플래시",
    ],
  },
  {
    id: "QC-001-02",
    projectId: "ID-001",
    version: "v0.9-rough",
    checkType: "audio",
    checkedBy: "QC Lab Seoul",
    checkedAt: "2026-11-10",
    issueCount: 3,
    criticalIssues: 0,
    status: "issues",
    notes: ["리어 채널 레벨 불균형 (-3dB)"],
  },
  {
    id: "QC-001-03",
    projectId: "ID-001",
    version: "v1.0",
    checkType: "video",
    checkedBy: "QC Lab Seoul",
    checkedAt: "2026-12-01",
    issueCount: 0,
    criticalIssues: 0,
    status: "passed",
  },
  {
    id: "QC-001-04",
    projectId: "ID-001",
    version: "v1.0",
    checkType: "audio",
    checkedAt: "2026-12-01",
    issueCount: 0,
    criticalIssues: 0,
    status: "pending",
    notes: ["최종 믹스 납품 대기"],
  },
  {
    id: "QC-001-05",
    projectId: "ID-001",
    version: "v1.0",
    checkType: "subtitle",
    issueCount: 0,
    criticalIssues: 0,
    status: "pending",
  },
  // ID-002
  {
    id: "QC-002-01",
    projectId: "ID-002",
    version: "v1.0",
    checkType: "video",
    issueCount: 0,
    criticalIssues: 0,
    status: "pending",
  },
];

export function findQCByProject(projectId: string): QCCheck[] {
  return mockQCChecks.filter((q) => q.projectId === projectId);
}

export function summarizeQC(checks: QCCheck[]) {
  const total = checks.length;
  const passed = checks.filter((c) => c.status === "passed").length;
  const issues = checks.filter((c) => c.status === "issues").length;
  const criticalTotal = checks.reduce((s, c) => s + c.criticalIssues, 0);
  return { total, passed, issues, criticalTotal };
}

export const QC_TYPE_LABEL: Record<QCCheckType, string> = {
  video: "영상",
  audio: "음향",
  subtitle: "자막",
  metadata: "메타데이터",
  delivery: "납품 패키지",
};

export const STATUS_COLOR: Record<QCStatus, string> = {
  pending: "#707070",
  "in-review": "#facc15",
  issues: "#f87171",
  passed: "#00FF41",
};

export const STATUS_LABEL: Record<QCStatus, string> = {
  pending: "대기",
  "in-review": "검토 중",
  issues: "이슈",
  passed: "통과",
};
