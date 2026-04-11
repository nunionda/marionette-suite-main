"use server";

import { revalidatePath } from "next/cache";
import { serviceUrl } from "@marionette/config";

const API_BASE_URL = serviceUrl("pipelineApi", "/api");
const BIBLE_URL = `${API_BASE_URL}/bible`;

export async function generateBible(projectId: string) {
  const response = await fetch(`${BIBLE_URL}/${projectId}/generate`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to generate Production Bible");
  revalidatePath(`/projects/${projectId}/bible`);
  return await response.json();
}

export async function getBibleContent(projectId: string): Promise<string | null> {
  try {
    const response = await fetch(`${BIBLE_URL}/${projectId}/view`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}
