import { ScriptLibraryClient } from "./script-library-client";

export const metadata = { title: "Script Library — Marionette Studio" };

// Fetch scenario list server-side (no content field — list view only)
async function fetchScenarios() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/scenarios`, {
      cache: "no-store",
      headers: { cookie: "" }, // auth handled by requireSession on the API side
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { data: ScenarioSummary[] };
    return body.data ?? [];
  } catch {
    return [];
  }
}

export interface ScenarioSummary {
  id: string;
  projectId: string | null;
  title: string;
  format: string;
  source: string;
  sourceRef: string | null;
  status: string;
  metadata: {
    sceneCount?: number;
    characterCount?: number;
    wordCount?: number;
    pageCount?: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default async function ScriptLibraryPage() {
  const scenarios = await fetchScenarios();
  return <ScriptLibraryClient scenarios={scenarios} />;
}
