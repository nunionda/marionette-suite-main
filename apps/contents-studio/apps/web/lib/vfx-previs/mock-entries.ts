export interface VfxPrevisShot {
  id: string;
  projectId: string;
  shotId: string;
  vfxType: "compositing" | "cgi" | "matte-painting" | "motion-capture" | "particle" | "simulation";
  complexity: "low" | "medium" | "high" | "hero";
  software: string[];
  frameCount: number;
  status: "concept" | "previs" | "approved" | "in-production" | "final";
  vendor?: string;
  dueDate?: string;
  notes?: string;
}

export const VFX_TYPE_LABEL: Record<VfxPrevisShot["vfxType"], string> = {
  compositing: "합성",
  cgi: "CGI",
  "matte-painting": "매트페인팅",
  "motion-capture": "모션캡처",
  particle: "파티클",
  simulation: "시뮬레이션",
};

export const COMPLEXITY_COLOR: Record<VfxPrevisShot["complexity"], string> = {
  low: "#60a5fa",
  medium: "#f59e0b",
  high: "#ef4444",
  hero: "#00FF41",
};

export const COMPLEXITY_LABEL: Record<VfxPrevisShot["complexity"], string> = {
  low: "낮음",
  medium: "중간",
  high: "높음",
  hero: "히어로",
};

export const STATUS_COLOR: Record<VfxPrevisShot["status"], string> = {
  concept: "#707070",
  previs: "#60a5fa",
  approved: "#f59e0b",
  "in-production": "#a78bfa",
  final: "#00FF41",
};

export const STATUS_LABEL: Record<VfxPrevisShot["status"], string> = {
  concept: "컨셉",
  previs: "프리비즈",
  approved: "승인",
  "in-production": "제작중",
  final: "완성",
};

export const MOCK_SHOTS: VfxPrevisShot[] = [
  {
    id: "vfx-001",
    projectId: "BEAT-SAVIOR",
    shotId: "SC-15-SH-03",
    vfxType: "compositing",
    complexity: "hero",
    software: ["Nuke", "After Effects", "DaVinci Fusion"],
    frameCount: 240,
    status: "approved",
    vendor: "Laika VFX Seoul",
    dueDate: "2026-05-10",
    notes: "병원 복도 디지털 확장 — 실사와 CG 경계 불분명하게",
  },
  {
    id: "vfx-002",
    projectId: "BEAT-SAVIOR",
    shotId: "SC-67-SH-01",
    vfxType: "particle",
    complexity: "high",
    software: ["Houdini", "Nuke"],
    frameCount: 180,
    status: "in-production",
    vendor: "Laika VFX Seoul",
    dueDate: "2026-05-20",
    notes: "클럽 연기·광선 파티클 — RGB LED 조명과 물리 연동",
  },
  {
    id: "vfx-003",
    projectId: "BEAT-SAVIOR",
    shotId: "SC-01-SH-02",
    vfxType: "matte-painting",
    complexity: "medium",
    software: ["Photoshop", "Nuke"],
    frameCount: 120,
    status: "previs",
    dueDate: "2026-06-01",
  },
  {
    id: "vfx-004",
    projectId: "PROJECT-NOVA",
    shotId: "SC-45-SH-01",
    vfxType: "simulation",
    complexity: "hero",
    software: ["Houdini", "Nuke", "Katana"],
    frameCount: 360,
    status: "concept",
    vendor: "Digital Domain Korea",
    dueDate: "2026-07-15",
    notes: "도시 붕괴 시퀀스 — 유리·콘크리트 파괴 시뮬레이션",
  },
];

export function summarizeVfxPrevis(shots: VfxPrevisShot[]) {
  const byProject = new Map<string, VfxPrevisShot[]>();
  for (const s of shots) {
    const arr = byProject.get(s.projectId) ?? [];
    arr.push(s);
    byProject.set(s.projectId, arr);
  }
  const heroShots = shots.filter((s) => s.complexity === "hero").length;
  const finalShots = shots.filter((s) => s.status === "final").length;
  return {
    total: shots.length,
    heroShots,
    finalShots,
    totalFrames: shots.reduce((n, s) => n + s.frameCount, 0),
    projectIds: Array.from(byProject.keys()),
  };
}
