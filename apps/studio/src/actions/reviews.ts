"use server";

import { revalidatePath } from "next/cache";
import { serviceUrl } from "@marionette/config";

const API_BASE_URL = serviceUrl("pipelineApi", "/api");

/**
 * 샷 리뷰 상태 업데이트 (승인/재작업 요청)
 * PATCH /api/pipeline/{projectId}/runs/{runId}/status
 */
export async function updateShotStatus(
  projectId: string,
  runId: string,
  stepName: string,
  status: "Approved" | "Revision"
) {
  const response = await fetch(
    `${API_BASE_URL}/pipeline/${projectId}/runs/${runId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step_name: stepName, status }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`리뷰 상태 업데이트 실패: ${error}`);
  }

  revalidatePath(`/projects/${projectId}`);
  return response.json();
}

/**
 * 퀄리티 게이트 상세 피드백 조회
 */
export async function getQualityFeedback(projectId: string, runId: string, stepName: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/pipeline/${projectId}/runs/${runId}`, {
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Failed to fetch quality feedback");
    
    const runData = await response.json();
    return runData.step_results?.[stepName]?.soq || null;
  } catch (error) {
    console.error("Error fetching quality feedback:", error);
    return null;
  }
}
