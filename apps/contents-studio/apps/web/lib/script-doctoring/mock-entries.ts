export interface DoctorSession {
  id: string;
  projectId: string;
  doctor: string;
  issueType: "dialogue" | "structure" | "pacing" | "character" | "theme";
  scenes: string[];
  notes: string;
  draftsReviewed: number;
  status: "pending" | "in-progress" | "delivered" | "approved";
  deliveredDate?: string;
}

export const ISSUE_LABEL: Record<DoctorSession["issueType"], string> = {
  dialogue: "대사",
  structure: "구조",
  pacing: "페이싱",
  character: "캐릭터",
  theme: "테마",
};

export const STATUS_COLOR: Record<DoctorSession["status"], string> = {
  pending: "#707070",
  "in-progress": "#60a5fa",
  delivered: "#f59e0b",
  approved: "#00FF41",
};

export const STATUS_LABEL: Record<DoctorSession["status"], string> = {
  pending: "대기",
  "in-progress": "작업중",
  delivered: "납품",
  approved: "승인",
};

export const MOCK_SESSIONS: DoctorSession[] = [
  {
    id: "sd-001",
    projectId: "BEAT-SAVIOR",
    doctor: "이미정 (Script Doctor)",
    issueType: "dialogue",
    scenes: ["SC-12", "SC-34", "SC-67"],
    notes: "3막 클라이맥스 대사 톤 조정 — 감정과잉 완화",
    draftsReviewed: 3,
    status: "approved",
    deliveredDate: "2026-03-10",
  },
  {
    id: "sd-002",
    projectId: "BEAT-SAVIOR",
    doctor: "박준하 (Story Consultant)",
    issueType: "pacing",
    scenes: ["SC-01~SC-20"],
    notes: "1막 도입부 페이싱 — 15분 내 world setup 완료 목표",
    draftsReviewed: 2,
    status: "in-progress",
  },
  {
    id: "sd-003",
    projectId: "PROJECT-NOVA",
    doctor: "이미정 (Script Doctor)",
    issueType: "structure",
    scenes: ["전체"],
    notes: "2막 미드포인트 재구성 — 역전 지점 앞당기기",
    draftsReviewed: 1,
    status: "delivered",
    deliveredDate: "2026-04-01",
  },
  {
    id: "sd-004",
    projectId: "PROJECT-NOVA",
    doctor: "김서연 (Character Consultant)",
    issueType: "character",
    scenes: ["SC-5", "SC-22", "SC-45", "SC-60"],
    notes: "주인공 동기 일관성 강화 — 트라우마 백스토리 통합",
    draftsReviewed: 2,
    status: "pending",
  },
];

export function summarizeDoctoring(sessions: DoctorSession[]) {
  const byProject = new Map<string, DoctorSession[]>();
  for (const s of sessions) {
    const arr = byProject.get(s.projectId) ?? [];
    arr.push(s);
    byProject.set(s.projectId, arr);
  }
  const projectIds = Array.from(byProject.keys());
  const approved = sessions.filter((s) => s.status === "approved").length;
  return { total: sessions.length, approved, projectIds };
}
