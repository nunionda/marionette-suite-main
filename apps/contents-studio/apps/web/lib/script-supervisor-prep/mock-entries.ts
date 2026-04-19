export interface ScriptSupervisorDoc {
  id: string;
  projectId: string;
  supervisor: string;
  docType: "breakdown" | "continuity-sheet" | "editor-notes" | "daily-log" | "lined-script";
  coveredScenes: string[];
  pageCount: number;
  status: "pending" | "in-progress" | "reviewed" | "approved";
  completedDate?: string;
  notes?: string;
}

export const DOC_TYPE_LABEL: Record<ScriptSupervisorDoc["docType"], string> = {
  breakdown: "씬 분해",
  "continuity-sheet": "연속성 시트",
  "editor-notes": "편집 노트",
  "daily-log": "일일 로그",
  "lined-script": "라인 스크립트",
};

export const STATUS_COLOR: Record<ScriptSupervisorDoc["status"], string> = {
  pending: "#707070",
  "in-progress": "#60a5fa",
  reviewed: "#f59e0b",
  approved: "#00FF41",
};

export const STATUS_LABEL: Record<ScriptSupervisorDoc["status"], string> = {
  pending: "대기",
  "in-progress": "작업중",
  reviewed: "검토",
  approved: "승인",
};

export const MOCK_DOCS: ScriptSupervisorDoc[] = [
  {
    id: "ss-001",
    projectId: "BEAT-SAVIOR",
    supervisor: "정은혜 (Script Supervisor)",
    docType: "breakdown",
    coveredScenes: ["전체 (SC-01~SC-89)"],
    pageCount: 122,
    status: "approved",
    completedDate: "2026-03-01",
    notes: "89씬 · 122페이지 · 3401컷 분해 완료",
  },
  {
    id: "ss-002",
    projectId: "BEAT-SAVIOR",
    supervisor: "정은혜 (Script Supervisor)",
    docType: "lined-script",
    coveredScenes: ["SC-01~SC-45"],
    pageCount: 60,
    status: "in-progress",
    notes: "1~2막 라인드 스크립트 — 카메라 커버리지 병기",
  },
  {
    id: "ss-003",
    projectId: "BEAT-SAVIOR",
    supervisor: "정은혜 (Script Supervisor)",
    docType: "continuity-sheet",
    coveredScenes: ["SC-12", "SC-34", "SC-67"],
    pageCount: 18,
    status: "reviewed",
    notes: "의상·소품 연속성 집중 — 클라이맥스 시퀀스",
  },
  {
    id: "ss-004",
    projectId: "PROJECT-NOVA",
    supervisor: "김하은 (Script Supervisor)",
    docType: "breakdown",
    coveredScenes: ["전체 (SC-01~SC-60)"],
    pageCount: 95,
    status: "approved",
    completedDate: "2026-03-15",
  },
  {
    id: "ss-005",
    projectId: "PROJECT-NOVA",
    supervisor: "김하은 (Script Supervisor)",
    docType: "editor-notes",
    coveredScenes: ["SC-01~SC-30"],
    pageCount: 40,
    status: "pending",
    notes: "편집 우선순위 마킹 — 선편집 기준 노트",
  },
];

export function summarizeSupervisorPrep(docs: ScriptSupervisorDoc[]) {
  const byProject = new Map<string, ScriptSupervisorDoc[]>();
  for (const d of docs) {
    const arr = byProject.get(d.projectId) ?? [];
    arr.push(d);
    byProject.set(d.projectId, arr);
  }
  const approved = docs.filter((d) => d.status === "approved").length;
  const totalPages = docs.reduce((n, d) => n + d.pageCount, 0);
  return { total: docs.length, approved, totalPages, projectIds: Array.from(byProject.keys()) };
}
