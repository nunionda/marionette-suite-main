"use server";

import { revalidatePath } from "next/cache";

const API_BASE_URL = "http://localhost:3005/api";
const PIPELINE_URL = `${API_BASE_URL}/pipeline`;
const ANALYSIS_URL = `${API_BASE_URL}/analysis`;

/**
 * 프로젝트 자산 매니페스트 조회
 */
export async function getProjectManifest(projectId: string) {
  try {
    const response = await fetch(`${PIPELINE_URL}/${projectId}/manifest`, {
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Failed to fetch project manifest");
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching manifest:", error);
    return null;
  }
}

/**
 * 최종 패키지 다운로드 URL 반환 (Client-side에서 fetch 트리거 권장)
 */
export async function getPackageDownloadUrl(projectId: string) {
    return `${PIPELINE_URL}/${projectId}/package`;
}

/**
 * 프로덕션 바이블 데이터 생성용 (단일 합본 객체)
 */
export async function getProductionBible(projectId: string) {
    // 실제로는 별도 엔드포인트나 매니페스트 + 프로젝트 상세 합본
    const manifest = await getProjectManifest(projectId);
    // 추가적인 프로젝트 상세 정보 fetch 로직...
    return manifest;
}
/**
 * 4K 마스터링 최종 승인 (Phase 7)
 */
export async function approveMastering(projectId: string, resolution: string = "4k") {
  try {
    const response = await fetch(`${PIPELINE_URL}/${projectId}/mastering/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, target_resolution: resolution }),
    });

    if (!response.ok) throw new Error("Failed to approve mastering");
    
    revalidatePath("/");
    return await response.json();
  } catch (error) {
    console.error("Error approving mastering:", error);
    throw error;
  }
}

/**
 * 프로젝트 지능형 분석 데이터 조회 (ROI, Risk, Kelly)
 */
export async function getProjectAnalysis(projectId: string) {
  try {
    const response = await fetch(`${ANALYSIS_URL}/${projectId}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return null;
  }
}

/**
 * 지능형 분석 실행 (Intelligence Audit Run)
 */
export async function runProjectAnalysis(projectId: string) {
  try {
    const response = await fetch(`${ANALYSIS_URL}/${projectId}/run`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to execute analysis audit");
    revalidatePath("/");
    return await response.json();
  } catch (error) {
    console.error("Error running analysis:", error);
    throw error;
  }
}
