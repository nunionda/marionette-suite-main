export interface ConformReel {
  id: string;
  projectId: string;
  reelNumber: number;
  title: string;
  durationFrames: number;
  fps: number;
  standard: "DCI-4K" | "HDR10" | "Dolby Vision" | "HLG" | "SDR-Rec709";
  colorSpace: string;
  resolution: string;
  audioConfig: string;
  status: "pending" | "conform-in-progress" | "qc-review" | "approved" | "delivered";
  deliveryDate?: string;
  notes?: string;
}

export const STANDARD_COLOR: Record<ConformReel["standard"], string> = {
  "DCI-4K": "#60a5fa",
  HDR10: "#f59e0b",
  "Dolby Vision": "#a78bfa",
  HLG: "#34d399",
  "SDR-Rec709": "#707070",
};

export const STATUS_COLOR: Record<ConformReel["status"], string> = {
  pending: "#707070",
  "conform-in-progress": "#60a5fa",
  "qc-review": "#f59e0b",
  approved: "#a78bfa",
  delivered: "#00FF41",
};

export const STATUS_LABEL: Record<ConformReel["status"], string> = {
  pending: "대기",
  "conform-in-progress": "컨폼중",
  "qc-review": "QC 검토",
  approved: "승인",
  delivered: "납품",
};

export const MOCK_REELS: ConformReel[] = [
  {
    id: "cf-001",
    projectId: "BEAT-SAVIOR",
    reelNumber: 1,
    title: "BEAT-SAVIOR — Reel 1 (DCI 4K)",
    durationFrames: 129600,
    fps: 24,
    standard: "DCI-4K",
    colorSpace: "DCI-P3 / X'Y'Z'",
    resolution: "4096×2160",
    audioConfig: "Dolby Atmos 7.1.4",
    status: "conform-in-progress",
    deliveryDate: "2026-07-01",
    notes: "DCP 마스터링 기준 — 배급사 납품용",
  },
  {
    id: "cf-002",
    projectId: "BEAT-SAVIOR",
    reelNumber: 1,
    title: "BEAT-SAVIOR — Reel 1 (Dolby Vision)",
    durationFrames: 129600,
    fps: 24,
    standard: "Dolby Vision",
    colorSpace: "BT.2020 / ITP",
    resolution: "3840×2160",
    audioConfig: "Dolby Atmos 7.1.4",
    status: "pending",
    deliveryDate: "2026-07-10",
    notes: "스트리밍 플랫폼(넷플릭스 인터스트) 납품용",
  },
  {
    id: "cf-003",
    projectId: "BEAT-SAVIOR",
    reelNumber: 1,
    title: "BEAT-SAVIOR — Reel 1 (HDR10)",
    durationFrames: 129600,
    fps: 24,
    standard: "HDR10",
    colorSpace: "BT.2020",
    resolution: "3840×2160",
    audioConfig: "Dolby Atmos 7.1.4",
    status: "pending",
    deliveryDate: "2026-07-10",
  },
  {
    id: "cf-004",
    projectId: "PROJECT-NOVA",
    reelNumber: 1,
    title: "PROJECT-NOVA — Reel 1 (DCI 4K)",
    durationFrames: 151200,
    fps: 24,
    standard: "DCI-4K",
    colorSpace: "DCI-P3 / X'Y'Z'",
    resolution: "4096×2160",
    audioConfig: "Dolby Atmos 7.1.2",
    status: "pending",
    deliveryDate: "2026-10-01",
  },
];

export function summarizeConform(reels: ConformReel[]) {
  const byProject = new Map<string, ConformReel[]>();
  for (const r of reels) {
    const arr = byProject.get(r.projectId) ?? [];
    arr.push(r);
    byProject.set(r.projectId, arr);
  }
  const delivered = reels.filter((r) => r.status === "delivered").length;
  const inProgress = reels.filter(
    (r) => r.status === "conform-in-progress" || r.status === "qc-review",
  ).length;
  return { total: reels.length, delivered, inProgress, projectIds: Array.from(byProject.keys()) };
}
