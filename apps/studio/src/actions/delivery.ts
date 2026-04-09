"use server";

import { revalidatePath } from "next/cache";

const API_BASE_URL = "http://localhost:3005/api/pipeline";

/**
 * 프로젝트 자산 매니페스트 조회
 */
export async function getProjectManifest(projectId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/${projectId}/manifest`, {
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
    return `${API_BASE_URL}/${projectId}/package`;
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
