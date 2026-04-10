"use server";

// 🎬 Stage 7: Unified Production Engine (Port 3005)
const API_BASE_URL = "http://localhost:3005/api";

export async function getProjects() {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch projects");
    return await response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function createProject(data: { title: string; category?: string; genre?: string; logline?: string; idea?: string }) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create project");
    return await response.json();
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function getProject(projectId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch project");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    return null;
  }
}

export async function updateProjectContext(projectId: string, field: "visual_dna" | "set_concept", data: unknown) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: data }),
    });
    if (!response.ok) throw new Error(`Failed to update ${field}`);
    return await response.json();
  } catch (error) {
    console.error(`Error updating ${field} for ${projectId}:`, error);
    throw error;
  }
}

export async function startPipeline(projectId: string, steps: string[]) {
  try {
    const response = await fetch(`${API_BASE_URL}/pipeline/${projectId}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to start pipeline");
    }
    return await response.json();
  } catch (error) {
    console.error(`Error starting pipeline for ${projectId}:`, error);
    throw error;
  }
}

export async function getLatestRuns(projectId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/pipeline/${projectId}/runs`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch runs");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching runs for ${projectId}:`, error);
    return [];
  }
}

// ─── Node Graph APIs ───

export async function getNodeGraph(projectId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/graph`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching graph for ${projectId}:`, error);
    return null;
  }
}

export async function executeGraph(projectId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/graph/execute`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to execute graph");
    return await response.json();
  } catch (error) {
    console.error(`Error executing graph for ${projectId}:`, error);
    throw error;
  }
}

// ─── Preset APIs ───

export async function getPresets(category?: string) {
  try {
    const url = category
      ? `${API_BASE_URL}/presets/?category=${category}`
      : `${API_BASE_URL}/presets/`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch presets");
    return await response.json();
  } catch (error) {
    console.error("Error fetching presets:", error);
    return [];
  }
}

export async function getBenchmarks() {
  try {
    const response = await fetch(`${API_BASE_URL}/system/benchmarks`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch benchmarks");
    return await response.json();
  } catch (error) {
    console.error("Error fetching benchmarks:", error);
    return null;
  }
}
