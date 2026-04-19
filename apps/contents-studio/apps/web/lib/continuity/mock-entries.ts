export interface ContinuityIssue {
  id: string;
  projectId: string;
  sceneId: string;
  continuityType: "costume" | "props" | "set-dressing" | "performance" | "camera" | "hair-makeup";
  reporter: string;
  description: string;
  affectedShots: string[];
  severity: "minor" | "moderate" | "critical";
  status: "flagged" | "under-review" | "accepted" | "fixed";
  fixNotes?: string;
}

export const TYPE_LABEL: Record<ContinuityIssue["continuityType"], string> = {
  costume: "의상",
  props: "소품",
  "set-dressing": "세트 드레싱",
  performance: "연기",
  camera: "카메라",
  "hair-makeup": "헤어·메이크업",
};

export const SEVERITY_COLOR: Record<ContinuityIssue["severity"], string> = {
  minor: "#60a5fa",
  moderate: "#f59e0b",
  critical: "#ef4444",
};

export const SEVERITY_LABEL: Record<ContinuityIssue["severity"], string> = {
  minor: "경미",
  moderate: "중간",
  critical: "심각",
};

export const STATUS_COLOR: Record<ContinuityIssue["status"], string> = {
  flagged: "#ef4444",
  "under-review": "#f59e0b",
  accepted: "#707070",
  fixed: "#00FF41",
};

export const STATUS_LABEL: Record<ContinuityIssue["status"], string> = {
  flagged: "발견",
  "under-review": "검토중",
  accepted: "허용",
  fixed: "수정완료",
};

export const MOCK_ISSUES: ContinuityIssue[] = [
  {
    id: "co-001",
    projectId: "BEAT-SAVIOR",
    sceneId: "SC-12",
    continuityType: "costume",
    reporter: "정은혜 (Script Supervisor)",
    description: "주인공 의상 왼쪽 소매 단추 SC-11 대비 잠김 → 풀림 불일치",
    affectedShots: ["SC-12-SH-03", "SC-12-SH-07"],
    severity: "critical",
    status: "fixed",
    fixNotes: "현장 의상팀 확인 · SC-12 재촬영 1컷",
  },
  {
    id: "co-002",
    projectId: "BEAT-SAVIOR",
    sceneId: "SC-34",
    continuityType: "props",
    reporter: "정은혜 (Script Supervisor)",
    description: "병실 꽃병 위치 SC-33에서 창문 옆 → SC-34에서 침대 옆으로 이동",
    affectedShots: ["SC-34-SH-01"],
    severity: "minor",
    status: "accepted",
    fixNotes: "감독 승인 하 의도적 이동으로 처리",
  },
  {
    id: "co-003",
    projectId: "BEAT-SAVIOR",
    sceneId: "SC-67",
    continuityType: "hair-makeup",
    reporter: "정은혜 (Script Supervisor)",
    description: "클럽 격투 후 SC-68 상처 위치 불일치 — 왼쪽 눈 → 오른쪽 눈",
    affectedShots: ["SC-68-SH-02", "SC-68-SH-04"],
    severity: "critical",
    status: "flagged",
  },
  {
    id: "co-004",
    projectId: "PROJECT-NOVA",
    sceneId: "SC-22",
    continuityType: "camera",
    reporter: "김하은 (Script Supervisor)",
    description: "화선 방향 SC-21 우향 → SC-22 좌향 반전 — 점프컷 위험",
    affectedShots: ["SC-22-SH-01"],
    severity: "moderate",
    status: "under-review",
  },
];

export function summarizeContinuity(issues: ContinuityIssue[]) {
  const byProject = new Map<string, ContinuityIssue[]>();
  for (const i of issues) {
    const arr = byProject.get(i.projectId) ?? [];
    arr.push(i);
    byProject.set(i.projectId, arr);
  }
  const critical = issues.filter((i) => i.severity === "critical").length;
  const unfixed = issues.filter((i) => i.status === "flagged" || i.status === "under-review").length;
  return { total: issues.length, critical, unfixed, projectIds: Array.from(byProject.keys()) };
}
