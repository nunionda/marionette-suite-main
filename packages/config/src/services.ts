/**
 * ─── Marionette Suite — Central Service Registry ───
 *
 * 모든 서비스의 포트, URL, API 경로를 한 곳에서 관리합니다.
 * 영화 제작 파이프라인 순서로 정렬되어 있습니다.
 *
 * 개발 흐름:
 *   시나리오 작성 → 시나리오 분석 → 스토리보드/컨셉 → 프로덕션 → 스튜디오 관제 → 홈페이지
 */

// ─── Service Definitions ────────────────────────────────────────

export interface ServiceDef {
  /** 서비스 표시명 */
  name: string;
  /** 기본 포트 번호 */
  port: number;
  /** 포트를 오버라이드하는 환경변수 이름 */
  envKey: string;
  /** 프레임워크/런타임 */
  runtime: string;
  /** 파이프라인 단계 (1=최상류, 6=최하류) */
  phase: number;
  /** 서비스 설명 */
  description: string;
}

export const SERVICES = {
  // ─── Phase 1: 시나리오 작성 ───
  scriptWriterFrontend: {
    name: "Script Writer",
    port: 5174,
    envKey: "SCRIPT_WRITER_PORT",
    runtime: "Vite + React",
    phase: 1,
    description: "시나리오 작성 프론트엔드",
  },
  scriptWriterBackend: {
    name: "Script Writer API",
    port: 3006,
    envKey: "SCRIPT_WRITER_API_PORT",
    runtime: "Elysia (Bun)",
    phase: 1,
    description: "시나리오 작성 백엔드 (AI 스트리밍, 이미지 생성)",
  },

  // ─── Phase 2: 시나리오 분석 ───
  analysisWeb: {
    name: "Analysis System",
    port: 4007,
    envKey: "ANALYSIS_WEB_PORT",
    runtime: "Next.js",
    phase: 2,
    description: "시나리오 분석 대시보드",
  },
  analysisApi: {
    name: "Analysis API",
    port: 4006,
    envKey: "ANALYSIS_API_PORT",
    runtime: "Elysia (Bun)",
    phase: 2,
    description: "시나리오 분석 엔진 (LLM 벤치마크, 캐릭터 분석, 흥행 예측)",
  },

  // ─── Phase 3: 프로덕션 파이프라인 ───
  pipelineApi: {
    name: "Production Pipeline API",
    port: 3005,
    envKey: "PIPELINE_API_PORT",
    runtime: "FastAPI (Python)",
    phase: 3,
    description: "프로덕션 파이프라인 백엔드 (20개 AI Agent 오케스트레이션)",
  },
  pipelineWeb: {
    name: "Production Pipeline Web",
    port: 5173,
    envKey: "PIPELINE_WEB_PORT",
    runtime: "Vite + React",
    phase: 3,
    description: "프로덕션 파이프라인 프론트엔드",
  },
  filmFinance: {
    name: "Film Finance API",
    port: 4010,
    envKey: "FINANCE_API_PORT",
    runtime: "Bun",
    phase: 3,
    description: "영화 재무 분석 API (Prisma + SQLite)",
  },

  // ─── Phase 4: 스튜디오 관제 ───
  studio: {
    name: "Studio Hub",
    port: 3001,
    envKey: "STUDIO_PORT",
    runtime: "Next.js 16",
    phase: 4,
    description: "통합 스튜디오 관제 센터 (엔진 오케스트레이션, 샷 매트릭스)",
  },

  // ─── Phase 5: 홈페이지 ───
  homepage: {
    name: "Homepage",
    port: 3000,
    envKey: "HOMEPAGE_PORT",
    runtime: "Bun (Static HTML)",
    phase: 5,
    description: "마리오네트 스튜디오 메인 홈페이지",
  },

  // ─── Phase 6: 숏폼 팬튜브 자동화 ───
  shortsFactoryFrontend: {
    name: "Shorts Factory",
    port: 5178,
    envKey: "SHORTS_FACTORY_PORT",
    runtime: "Vite + React",
    phase: 6,
    description: "K-POP 숏폼 팬튜브 자동화 프론트엔드",
  },
  shortsFactoryBackend: {
    name: "Shorts Factory API",
    port: 3008,
    envKey: "SHORTS_FACTORY_API_PORT",
    runtime: "Elysia (Bun)",
    phase: 6,
    description: "K-POP 숏폼 팬튜브 자동화 백엔드 (FFmpeg, Whisper, YouTube API)",
  },
} as const satisfies Record<string, ServiceDef>;

export type ServiceId = keyof typeof SERVICES;

// ─── URL Builders ───────────────────────────────────────────────

function resolvePort(service: ServiceDef): number {
  if (typeof process !== "undefined" && process.env?.[service.envKey]) {
    return parseInt(process.env[service.envKey]!, 10);
  }
  return service.port;
}

function resolveHost(): string {
  if (typeof process !== "undefined" && process.env?.SERVICE_HOST) {
    return process.env.SERVICE_HOST;
  }
  return "localhost";
}

/** HTTP URL for a service */
export function serviceUrl(id: ServiceId, path = ""): string {
  const svc = SERVICES[id];
  return `http://${resolveHost()}:${resolvePort(svc)}${path}`;
}

/** WebSocket URL for a service */
export function serviceWs(id: ServiceId, path = ""): string {
  const svc = SERVICES[id];
  return `ws://${resolveHost()}:${resolvePort(svc)}${path}`;
}

/** 포트 번호만 반환 */
export function servicePort(id: ServiceId): number {
  return resolvePort(SERVICES[id]);
}

/** 전체 CORS origins 목록 생성 (모든 프론트엔드 서비스) */
export function allCorsOrigins(): string[] {
  return Object.values(SERVICES).map(
    (svc) => `http://${resolveHost()}:${resolvePort(svc)}`
  );
}
