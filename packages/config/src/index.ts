/**
 * @marionette/config
 *
 * 마리오네트 스위트 전체 서비스 레지스트리 & API 주소 관리
 *
 * @example
 * ```ts
 * import { SERVICES, serviceUrl, ENDPOINTS } from "@marionette/config";
 *
 * // 서비스 URL 조합
 * const url = serviceUrl("pipelineApi", ENDPOINTS.pipelineApi.health);
 * // → "http://localhost:3005/api/health"
 *
 * // 동적 경로
 * const projectUrl = serviceUrl("pipelineApi", ENDPOINTS.pipelineApi.project("abc123"));
 * // → "http://localhost:3005/api/projects/abc123"
 *
 * // WebSocket
 * const wsUrl = serviceWs("pipelineApi", ENDPOINTS.pipelineApi.wsPipeline);
 * // → "ws://localhost:3005/ws/pipeline"
 * ```
 */

export {
  // Service registry
  SERVICES,
  type ServiceDef,
  type ServiceId,

  // URL builders
  serviceUrl,
  serviceWs,
  servicePort,
  allCorsOrigins,
} from "./services";

export {
  // Endpoint paths
  ENDPOINTS,
  SCRIPT_WRITER,
  ANALYSIS_API,
  PIPELINE_API,
  FINANCE_API,
} from "./endpoints";
