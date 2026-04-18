/**
 * ─── Marionette Suite — API Endpoint Registry ───
 *
 * 각 서비스의 API 경로를 중앙에서 관리합니다.
 * serviceUrl(id, ENDPOINTS.xxx.yyy) 형태로 완성된 URL을 조합할 수 있습니다.
 */

// ─── Script Writer API (Elysia :3006) ──────────────────────────

export const SCRIPT_WRITER = {
  /** GET / — 서버 상태 */
  root: "/",
  /** GET /api/projects — 프로젝트 목록 */
  projects: "/api/projects",
  /** POST /api/projects — 프로젝트 생성 */
  createProject: "/api/projects",
  /** GET /api/projects/:id */
  project: (id: string | number) => `/api/projects/${id}`,
  /** POST /api/projects/:id/upload-image */
  uploadImage: (id: string | number) => `/api/projects/${id}/upload-image`,
  /** DELETE /api/projects/:id */
  deleteProject: (id: string | number) => `/api/projects/${id}`,
  /** POST /api/projects/:id/export — PDF 내보내기 */
  exportProject: (id: string | number) => `/api/projects/${id}/export`,
  /** GET /api/export/:jobId — PDF 다운로드 */
  exportStatus: (jobId: string) => `/api/export/${jobId}`,
  /** GET /api/projects/:id/outline */
  outline: (id: string | number) => `/api/projects/${id}/outline`,
  /** POST /api/projects/:id/outline */
  saveOutline: (id: string | number) => `/api/projects/${id}/outline`,
  /** GET /api/loglines */
  loglines: "/api/loglines",
  /** POST /api/loglines */
  createLogline: "/api/loglines",
  /** DELETE /api/loglines/:id */
  deleteLogline: (id: string | number) => `/api/loglines/${id}`,
  /** POST /api/ai/stream — AI 스트리밍 */
  aiStream: "/api/ai/stream",
  /** POST /api/ai/generate-image — 이미지 생성 */
  aiGenerateImage: "/api/ai/generate-image",
  /** POST /api/ai/refine-image-prompt — 프롬프트 정제 */
  aiRefineImagePrompt: "/api/ai/refine-image-prompt",
} as const;

// ─── Analysis System API (Elysia :4006) ────────────────────────

export const ANALYSIS_API = {
  /** GET / — 서버 상태 */
  root: "/",
  /** GET /providers — LLM 프로바이더 목록 */
  providers: "/providers",
  /** POST /analyze — 시나리오 분석 실행 */
  analyze: "/analyze",
  /** POST /benchmark — LLM 벤치마크 실행 */
  benchmark: "/benchmark",
  /** GET /report/:id — 분석 리포트 조회 */
  report: (id: string) => `/report/${id}`,
  /** GET /reports — 리포트 목록 */
  reports: "/reports",
  /** POST /translate — 번역 */
  translate: "/translate",
  /** POST /chat — 대화형 분석 */
  chat: "/chat",
  /** POST /compare — 드래프트 비교 */
  compare: "/compare",
} as const;

// ─── Production Pipeline API (FastAPI :3005) ───────────────────

export const PIPELINE_API = {
  /** GET /api/health — 헬스체크 */
  health: "/api/health",
  /** GET /api/config — 서버 설정 (민감 정보 제외) */
  config: "/api/config",

  // Projects
  /** GET /api/projects — 프로젝트 목록 */
  projects: "/api/projects",
  /** POST /api/projects — 프로젝트 생성 */
  createProject: "/api/projects",
  /** GET /api/projects/:id */
  project: (id: string) => `/api/projects/${id}`,
  /** PATCH /api/projects/:id */
  updateProject: (id: string) => `/api/projects/${id}`,
  /** PATCH /api/projects/:id/status */
  updateProjectStatus: (id: string) => `/api/projects/${id}/status`,
  /** DELETE /api/projects/:id */
  deleteProject: (id: string) => `/api/projects/${id}`,

  // Pipeline runs
  /** POST /api/pipeline/:id/run — 파이프라인 실행 */
  pipelineRun: (id: string) => `/api/pipeline/${id}/run`,
  /** GET /api/pipeline/:id/runs — 실행 기록 */
  pipelineRuns: (id: string) => `/api/pipeline/${id}/runs`,
  /** GET /api/pipeline/:id/runs/:runId */
  pipelineRunDetail: (id: string, runId: string) => `/api/pipeline/${id}/runs/${runId}`,
  /** POST /api/pipeline/:id/runs/:runId/cancel */
  pipelineCancel: (id: string, runId: string) => `/api/pipeline/${id}/runs/${runId}/cancel`,
  /** POST /api/pipeline/:id/mastering/approve — 4K 마스터링 승인 */
  masteringApprove: (id: string) => `/api/pipeline/${id}/mastering/approve`,

  // Analysis (within pipeline)
  /** GET /api/analysis/:id */
  analysis: (id: string) => `/api/analysis/${id}`,
  /** POST /api/analysis/:id/run */
  analysisRun: (id: string) => `/api/analysis/${id}/run`,

  // Presets
  /** GET /api/presets — 프리셋 목록 */
  presets: "/api/presets",
  /** GET /api/presets/default/:category */
  presetDefault: (category: string) => `/api/presets/default/${category}`,
  /** POST /api/presets */
  createPreset: "/api/presets",

  // Node graph
  /** GET /api/projects/:id/graph */
  graph: (id: string) => `/api/projects/${id}/graph`,
  /** PUT /api/projects/:id/graph */
  updateGraph: (id: string) => `/api/projects/${id}/graph`,
  /** POST /api/projects/:id/graph/execute */
  executeGraph: (id: string) => `/api/projects/${id}/graph/execute`,

  // Bible
  /** POST /api/projects/:id/generate — 바이블 생성 */
  bibleGenerate: (id: string) => `/api/projects/${id}/generate`,
  /** GET /api/projects/:id/view — 바이블 조회 */
  bibleView: (id: string) => `/api/projects/${id}/view`,

  // Assets
  /** GET /api/assets */
  assets: "/api/assets",
  /** GET /api/assets/:id */
  asset: (id: string) => `/api/assets/${id}`,
  /** POST /api/assets/promote */
  promoteAsset: "/api/assets/promote",
  /** DELETE /api/assets/:id */
  deleteAsset: (id: string) => `/api/assets/${id}`,

  // Benchmark
  /** GET /api/benchmark/suites */
  benchmarkSuites: "/api/benchmark/suites",
  /** POST /api/benchmark/run/:suiteKey */
  benchmarkRun: (suiteKey: string) => `/api/benchmark/run/${suiteKey}`,
  /** GET /api/benchmark/report/:runId */
  benchmarkReport: (runId: string) => `/api/benchmark/report/${runId}`,
  /** GET /api/benchmark/history */
  benchmarkHistory: "/api/benchmark/history",

  // Vault
  /** POST /api/vault/credentials */
  vaultStore: "/api/vault/credentials",
  /** GET /api/vault/credentials */
  vaultList: "/api/vault/credentials",
  /** GET /api/vault/credentials/:provider */
  vaultGet: (provider: string) => `/api/vault/credentials/${provider}`,

  // WebSocket
  /** WS /ws/pipeline — 실시간 파이프라인 상태 */
  wsPipeline: "/ws/pipeline",
} as const;

// ─── Film Finance API (Elysia :4010) ──────────────────────────

export const FINANCE_API = {
  /** GET / — 서버 상태 */
  root: "/",
  /** GET /projects — 프로젝트 목록 */
  projects: "/projects",
  /** GET /projects/:id */
  project: (id: string) => `/projects/${id}`,
  /** POST /projects — 프로젝트 생성 */
  createProject: "/projects",
  /** GET /investors — 투자자 목록 */
  investors: "/investors",
  /** GET /investors/:id */
  investor: (id: string) => `/investors/${id}`,
  /** POST /investors */
  createInvestor: "/investors",
  /** DELETE /investors/:id */
  deleteInvestor: (id: string) => `/investors/${id}`,
  /** GET /spc — SPC 목록 */
  spcs: "/spc",
  /** GET /spc/:id */
  spc: (id: string) => `/spc/${id}`,
  /** POST /spc — SPC 생성 */
  createSpc: "/spc",
  /** GET /ir/:projectId — 투자설명서 */
  ir: (projectId: string) => `/ir/${projectId}`,
  /** GET /ir/:projectId/summary — IR 요약 */
  irSummary: (projectId: string) => `/ir/${projectId}/summary`,
} as const;

// ─── Aggregated Exports ────────────────────────────────────────

export const ENDPOINTS = {
  scriptWriter: SCRIPT_WRITER,
  analysisApi: ANALYSIS_API,
  pipelineApi: PIPELINE_API,
  financeApi: FINANCE_API,
} as const;
