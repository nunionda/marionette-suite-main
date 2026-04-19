// Daily Production Report — Sprint 11 #37
// 촬영 현장 일일 제작 보고서

export type DailyReportStatus = "draft" | "submitted" | "approved" | "archived";

export interface DailyReport {
  id: string;
  projectId: string;
  shootDay: number;
  date: string;
  unit: string;
  callTime: string;
  wrapTime?: string;
  scheduledPages: number;
  completedPages: number;
  totalScenes: number;
  completedScenes: number;
  setups: number;
  status: DailyReportStatus;
  preparedBy?: string;
  approvedBy?: string;
  note?: string;
}

export const mockDailyReports: DailyReport[] = [
  // ID-001 DECODE
  {
    id: "DR-001-01",
    projectId: "ID-001",
    shootDay: 1,
    date: "2026-07-01",
    unit: "Main Unit",
    callTime: "06:00",
    wrapTime: "20:30",
    scheduledPages: 4.5,
    completedPages: 4.0,
    totalScenes: 6,
    completedScenes: 5,
    setups: 32,
    status: "approved",
    preparedBy: "신유진 (1st AD)",
    approvedBy: "오혜진 (UPM)",
  },
  {
    id: "DR-001-02",
    projectId: "ID-001",
    shootDay: 2,
    date: "2026-07-02",
    unit: "Main Unit",
    callTime: "06:30",
    wrapTime: "21:00",
    scheduledPages: 5.0,
    completedPages: 5.5,
    totalScenes: 7,
    completedScenes: 8,
    setups: 41,
    status: "approved",
    preparedBy: "신유진 (1st AD)",
    approvedBy: "오혜진 (UPM)",
    note: "1씬 추가 촬영 완료 (보너스)",
  },
  {
    id: "DR-001-03",
    projectId: "ID-001",
    shootDay: 3,
    date: "2026-07-03",
    unit: "Main Unit",
    callTime: "07:00",
    scheduledPages: 4.0,
    completedPages: 2.0,
    totalScenes: 5,
    completedScenes: 3,
    setups: 18,
    status: "submitted",
    preparedBy: "신유진 (1st AD)",
    note: "우천으로 야외씬 2일 이월",
  },
  // ID-002
  {
    id: "DR-002-01",
    projectId: "ID-002",
    shootDay: 1,
    date: "2026-07-15",
    unit: "Main Unit",
    callTime: "07:00",
    wrapTime: "19:00",
    scheduledPages: 3.5,
    completedPages: 3.5,
    totalScenes: 5,
    completedScenes: 5,
    setups: 28,
    status: "approved",
    preparedBy: "1st AD",
  },
];

export function findReportsByProject(projectId: string): DailyReport[] {
  return mockDailyReports.filter((r) => r.projectId === projectId);
}

export function summarizeReports(reports: DailyReport[]) {
  const total = reports.length;
  const approved = reports.filter((r) => r.status === "approved").length;
  const totalScheduled = reports.reduce((s, r) => s + r.scheduledPages, 0);
  const totalCompleted = reports.reduce((s, r) => s + r.completedPages, 0);
  const efficiency = totalScheduled > 0 ? (totalCompleted / totalScheduled) * 100 : 0;
  return { total, approved, totalScheduled, totalCompleted, efficiency };
}

export const STATUS_COLOR: Record<DailyReportStatus, string> = {
  draft: "#707070",
  submitted: "#facc15",
  approved: "#00FF41",
  archived: "#505050",
};

export const STATUS_LABEL: Record<DailyReportStatus, string> = {
  draft: "초안",
  submitted: "제출됨",
  approved: "승인",
  archived: "보관",
};
