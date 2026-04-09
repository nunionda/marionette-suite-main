"use server";

import { revalidatePath } from "next/cache";

const API_BASE_URL = "http://localhost:3005/api";

/**
 * 샷 리뷰 상태 업데이트 (승인/재작업 요청)
 */
export async function updateShotStatus(
  projectId: string, 
  runId: string, 
  stepName: string, 
  status: "Approved" | "Revision"
) {
  try {
    const response = await fetch(`${API_BASE_URL}/pipeline/${projectId}/runs/${runId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        step: stepName, 
        status: status === "Approved" ? "completed" : "failed" 
      }),
    });

    if (!response.ok) {
        throw new Error("Failed to update shot status");
    }

    revalidatePath("/");
    return await response.json();
  } catch (error) {
    console.error("Error updating shot status:", error);
    throw error;
  }
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
