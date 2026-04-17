/**
 * Paperclip Bridge — thin client for Paperclip HQ at ~/paperclip.
 *
 * Paperclip runs on http://127.0.0.1:3100 (local_trusted).
 * Each of the 3 companies has its own prefix + agent roster:
 *   - STE (Marionette Studios)          — 17 agents, 핵심 프로덕션
 *   - IMP (Global Studios Standard)     — 24 agents, 디즈니 6-stage
 *   - MAR (Development Department)       —  6 agents, 파이프라인 자동화
 *
 * This stub returns mock data so UIs can integrate now. Sprint 9+ swaps
 * in real HTTP calls to :3100.
 */

import type { StudioCode, ContentCategory } from "@marionette/pipeline-core";

export interface Studio {
  code: StudioCode;
  name: string;
  role: string;
  agentCount: number;
  defaultFor: ContentCategory[];
  emoji: string;
}

export const STUDIOS: Studio[] = [
  {
    code: "STE",
    name: "Marionette Studios",
    role: "AI 영화 스튜디오 · 핵심 프로덕션",
    agentCount: 17,
    defaultFor: ["film", "drama", "commercial"],
    emoji: "🎭",
  },
  {
    code: "IMP",
    name: "Global Studios Standard",
    role: "디즈니 6-Stage 풀스케일 스튜디오",
    agentCount: 24,
    defaultFor: ["film"],
    emoji: "🌐",
  },
  {
    code: "MAR",
    name: "Development Department",
    role: "AI 파이프라인 · 기술 인프라",
    agentCount: 6,
    defaultFor: ["youtube"],
    emoji: "⚙️",
  },
];

export function getStudio(code: StudioCode): Studio | undefined {
  return STUDIOS.find((s) => s.code === code);
}

/** Recommend studio based on content type + budget. */
export function recommendStudio(
  category: ContentCategory,
  budgetKRW?: number,
): StudioCode {
  // MAR는 creative dispatch에서 제외 — 앱 유지보수 전용.
  if (category === "film") {
    const threshold = Number(
      process.env.PAPERCLIP_IMP_BUDGET_THRESHOLD_KRW ?? "30000000000",
    );
    if (budgetKRW && budgetKRW >= threshold) return "IMP";
    return "STE";
  }
  return "STE";
}

/* ─── Paperclip HQ current projects (Phase 1 → 2 완료) ─── */

export interface PaperclipProject {
  id: string;
  title: string;
  genre: string;
  budgetKRW: number;
  priority: "P0" | "P1" | "P2";
  ownerStudio: StudioCode;
}

export const PAPERCLIP_PROJECTS: PaperclipProject[] = [
  {
    id: "ID-001",
    title: "DECODE (디코드)",
    genre: "SF 스릴러",
    budgetKRW: 3_500_000_000,
    priority: "P1",
    ownerStudio: "IMP",
  },
  {
    id: "ID-002",
    title: "어머니의 이력서",
    genre: "휴먼 드라마",
    budgetKRW: 2_000_000_000,
    priority: "P0",
    ownerStudio: "STE",
  },
  {
    id: "ID-003",
    title: "나노 커뮤니티",
    genre: "블랙코미디/스릴러",
    budgetKRW: 1_500_000_000,
    priority: "P1",
    ownerStudio: "STE",
  },
];

/* ─── Dispatch stub ─── */

export interface DispatchRequest {
  studioCode: StudioCode;
  projectId: string;
  action: "brainstorm" | "treatment" | "script" | "analysis" | "storyboard" | "schedule" | "post" | "deliver";
  payload?: Record<string, unknown>;
}

export interface DispatchResponse {
  ok: boolean;
  dispatchedTo: string;
  agentsNotified: number;
  mockTimestamp: string;
}

export async function dispatch(req: DispatchRequest): Promise<DispatchResponse> {
  const studio = getStudio(req.studioCode);
  return {
    ok: true,
    dispatchedTo: `${req.studioCode} · ${studio?.name ?? "?"}`,
    agentsNotified: studio?.agentCount ?? 0,
    mockTimestamp: new Date().toISOString(),
  };
}

export async function health(): Promise<{ status: "ok" | "offline"; host: string }> {
  const host = "http://127.0.0.1:3100";
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(`${host}/api/health`, { signal: ctrl.signal });
    clearTimeout(timer);
    return { status: res.ok ? "ok" : "offline", host };
  } catch {
    return { status: "offline", host };
  }
}

export { readRegistry, findProject, getRegistryPath } from "./registry";
export type { PaperclipRegistryEntry } from "./registry";
