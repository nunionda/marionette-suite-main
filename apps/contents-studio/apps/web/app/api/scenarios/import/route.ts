import { NextResponse } from "next/server";
import { requireSession } from "../../../../lib/server-session";
import { prisma } from "@marionette/db";

// ── Script-writer project shape (port 3006) ────────────────────────────────
interface ScriptWriterProject {
  id: number;
  title: string;
  category?: string;
  genre?: string;
  logline?: string;
  scenario?: string; // primary screenplay text field
  script?: string;   // fallback field
}

// ── Metadata helpers ───────────────────────────────────────────────────────

function countScenes(text: string): number {
  // Scene headings: INT./EXT. at the start of a line
  return (text.match(/^(?:INT\.|EXT\.|INT\/EXT\.|I\/E\.)/gim) ?? []).length;
}

function countCharacters(text: string): number {
  // Character cue: uppercase-only line, possibly followed by (V.O.)/(O.S.)
  const names = new Set(
    [...text.matchAll(/^([A-Z][A-Z\s']+?)(?:\s*\(.*?\))?\s*$/gm)]
      .map((m) => m[1]?.trim())
      .filter((n): n is string => !!n && n.length > 1 && n.length < 40),
  );
  return names.size;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimatePages(text: string): number {
  // Industry standard: ~55 lines per page in proper screenplay format
  const lines = text.split("\n").length;
  return Math.max(1, Math.round(lines / 55));
}

function deriveMetadata(content: string) {
  return {
    sceneCount: countScenes(content),
    characterCount: countCharacters(content),
    wordCount: countWords(content),
    pageCount: estimatePages(content),
  };
}

// ── POST /api/scenarios/import ─────────────────────────────────────────────
//
// Two import sources:
//
//   { source: "script-writer", scriptWriterProjectId: number, hubProjectId?: string }
//     → Fetches from the script-writer service at port 3006 and persists to hub DB.
//
//   { source: "upload", format: "fdx"|"fountain"|"pdf"|"text",
//     content: string, title: string, hubProjectId?: string }
//     → Persists plain-text screenplay already parsed by the client.
//
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const source = body.source as string | undefined;

  // ── Branch: import from script-writer ──────────────────────────────────
  if (source === "script-writer") {
    const swId = body.scriptWriterProjectId;
    if (typeof swId !== "number" && typeof swId !== "string") {
      return NextResponse.json(
        { error: "scriptWriterProjectId is required for source=script-writer" },
        { status: 400 },
      );
    }

    const hubProjectId = body.hubProjectId as string | undefined;
    if (hubProjectId) {
      const project = await prisma.project.findUnique({
        where: { id: hubProjectId },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json({ error: "Hub project not found" }, { status: 404 });
      }
    }

    // Prevent duplicate imports of the same script-writer project
    const alreadyImported = await prisma.scenario.findFirst({
      where: { source: "script-writer", sourceRef: String(swId) },
      select: { id: true, title: true },
    });
    if (alreadyImported) {
      return NextResponse.json(
        { error: "Already imported", existing: alreadyImported },
        { status: 409 },
      );
    }

    // Fetch from script-writer service
    const swBaseUrl = process.env.INTERNAL_SCRIPT_ENGINE_URL ?? "http://localhost:3006";
    let swProject: ScriptWriterProject;
    try {
      const res = await fetch(`${swBaseUrl}/api/projects/${swId}`);
      if (!res.ok) {
        return NextResponse.json(
          { error: `Script-writer returned ${res.status}` },
          { status: 502 },
        );
      }
      const data = (await res.json()) as { project?: ScriptWriterProject } | ScriptWriterProject;
      // The API may wrap in { project: ... } or return the object directly
      swProject = ("project" in data ? data.project : data) as ScriptWriterProject;
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to reach script-writer service", detail: String(err) },
        { status: 502 },
      );
    }

    const content = swProject.scenario ?? swProject.script ?? "";
    if (!content.trim()) {
      return NextResponse.json(
        { error: "Script-writer project has no screenplay content" },
        { status: 422 },
      );
    }

    const scenario = await prisma.scenario.create({
      data: {
        title: swProject.title,
        content,
        format: "text",
        source: "script-writer",
        sourceRef: String(swId),
        status: "imported",
        metadata: deriveMetadata(content),
        ...(hubProjectId ? { projectId: hubProjectId } : {}),
      },
    });

    return NextResponse.json(scenario, { status: 201 });
  }

  // ── Branch: file upload (client-side parsed) ───────────────────────────
  if (source === "upload") {
    const title = body.title as string | undefined;
    const content = body.content as string | undefined;
    const format = (body.format as string | undefined) ?? "text";
    const hubProjectId = body.hubProjectId as string | undefined;

    if (!title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    if (hubProjectId) {
      const project = await prisma.project.findUnique({
        where: { id: hubProjectId },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json({ error: "Hub project not found" }, { status: 404 });
      }
    }

    const scenario = await prisma.scenario.create({
      data: {
        title: title.trim(),
        content,
        format,
        source: "upload",
        sourceRef: body.originalFilename as string | null ?? null,
        status: "imported",
        metadata: deriveMetadata(content),
        ...(hubProjectId ? { projectId: hubProjectId } : {}),
      },
    });

    return NextResponse.json(scenario, { status: 201 });
  }

  return NextResponse.json(
    { error: 'source must be "script-writer" or "upload"' },
    { status: 400 },
  );
}
