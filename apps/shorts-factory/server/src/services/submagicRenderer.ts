/**
 * submagicRenderer.ts — Submagic API integration for trendy video rendering.
 *
 * Tier 2 renderer: sends a clip to Submagic API for viral-style captions,
 * auto-zoom, B-roll insertion, and BGM. Falls back to FFmpeg (Tier 1) on failure.
 *
 * Flow: upload clip → create project → poll status → export → download result
 *
 * API docs: https://docs.submagic.co/
 */

const SUBMAGIC_API_KEY = process.env.SUBMAGIC_API_KEY;
const SUBMAGIC_BASE = "https://api.submagic.co/v1";

interface SubmagicProject {
  id: string;
  status: string;
  exportUrl?: string;
}

async function submagicFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  if (!SUBMAGIC_API_KEY) {
    throw new Error("SUBMAGIC_API_KEY not set");
  }

  const res = await fetch(`${SUBMAGIC_BASE}${endpoint}`, {
    ...options,
    headers: {
      "x-api-key": SUBMAGIC_API_KEY,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Submagic API ${res.status}: ${body.slice(0, 300)}`);
  }

  return res.json();
}

/** List available templates. Cache-friendly (changes rarely). */
export async function listTemplates(): Promise<string[]> {
  const data = await submagicFetch("/templates");
  return (data.templates ?? data ?? []).map((t: any) => t.name ?? t);
}

/** List supported languages. */
export async function listLanguages(): Promise<string[]> {
  const data = await submagicFetch("/languages");
  return (data.languages ?? data ?? []).map((l: any) => l.code ?? l);
}

/**
 * Create a Submagic project from a video URL.
 * The video must be publicly accessible (or use a signed URL).
 */
export async function createProject(opts: {
  title: string;
  videoUrl: string;
  language?: string;
  templateName?: string;
}): Promise<SubmagicProject> {
  const body = {
    title: opts.title,
    videoUrl: opts.videoUrl,
    language: opts.language ?? "ko",
    templateName: opts.templateName ?? "Hormozi 2",
  };

  const data = await submagicFetch("/projects", {
    method: "POST",
    body: JSON.stringify(body),
  });

  console.log(`[submagic] project created: ${data.id ?? data.projectId}`);
  return {
    id: data.id ?? data.projectId,
    status: data.status ?? "processing",
  };
}

/** Poll project status until done or timeout. */
export async function waitForProject(
  projectId: string,
  timeoutMs = 300_000,
  pollIntervalMs = 5_000
): Promise<SubmagicProject> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const data = await submagicFetch(`/projects/${projectId}`);
    const status = data.status ?? "unknown";

    if (status === "completed" || status === "done" || status === "ready") {
      console.log(`[submagic] project ${projectId} completed`);
      return { id: projectId, status, exportUrl: data.exportUrl ?? data.downloadUrl };
    }

    if (status === "failed" || status === "error") {
      throw new Error(`Submagic project failed: ${data.error ?? data.message ?? status}`);
    }

    console.log(`[submagic] project ${projectId}: ${status}, waiting...`);
    await Bun.sleep(pollIntervalMs);
  }

  throw new Error(`Submagic project ${projectId} timed out after ${timeoutMs / 1000}s`);
}

/** Trigger export and get download URL. */
export async function exportProject(projectId: string): Promise<string> {
  const data = await submagicFetch(`/projects/${projectId}/export`, {
    method: "POST",
  });

  // Some APIs return the URL directly, others require polling
  if (data.downloadUrl || data.exportUrl || data.url) {
    return data.downloadUrl ?? data.exportUrl ?? data.url;
  }

  // Poll for export completion
  const result = await waitForProject(projectId, 120_000, 3_000);
  if (!result.exportUrl) {
    throw new Error("Export completed but no download URL returned");
  }
  return result.exportUrl;
}

/** Download the rendered video to a local path. */
export async function downloadResult(url: string, outputPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  await Bun.write(outputPath, res);
  const size = (await Bun.file(outputPath).size) / 1_048_576;
  console.log(`[submagic] downloaded: ${outputPath} (${size.toFixed(1)} MB)`);
}

/**
 * Full Submagic render pipeline:
 *   upload → process → export → download
 *
 * Returns the local output file path.
 */
export async function renderWithSubmagic(opts: {
  clipPath: string;
  clipUrl: string; // must be publicly accessible
  title: string;
  language?: string;
  templateName?: string;
  outputPath: string;
}): Promise<string> {
  console.log(`[submagic] starting render: ${opts.title}`);

  // 1. Create project
  const project = await createProject({
    title: opts.title,
    videoUrl: opts.clipUrl,
    language: opts.language,
    templateName: opts.templateName,
  });

  // 2. Wait for processing
  await waitForProject(project.id);

  // 3. Export
  const downloadUrl = await exportProject(project.id);

  // 4. Download result
  await downloadResult(downloadUrl, opts.outputPath);

  return opts.outputPath;
}

/** Check if Submagic is configured and reachable. */
export async function isAvailable(): Promise<boolean> {
  if (!SUBMAGIC_API_KEY) return false;
  try {
    await submagicFetch("/health");
    return true;
  } catch {
    return false;
  }
}
