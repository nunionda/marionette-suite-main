import { NextResponse } from "next/server";
import { requireSession } from "../../../lib/server-session";
import { prisma } from "@marionette/db";

const VALID_STAGES = ["idea", "research", "rights", "pitch", "financing"] as const;
type Stage = (typeof VALID_STAGES)[number];

function isValidStage(s: string | null): s is Stage {
  return VALID_STAGES.includes(s as Stage);
}

// GET /api/development?stage=idea&projectId=xxx
export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");
  const projectId = searchParams.get("projectId");

  if (!isValidStage(stage)) {
    return NextResponse.json(
      { error: `stage must be one of: ${VALID_STAGES.join(", ")}` },
      { status: 400 },
    );
  }

  const entries = await prisma.developmentEntry.findMany({
    where: {
      stage,
      ...(projectId ? { projectId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: entries, total: entries.length });
}

// POST /api/development
// Body: { stage, title, content, projectId? }
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  let body: { stage?: string; title?: string; content?: unknown; projectId?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { stage, title, content, projectId, status } = body;

  if (!isValidStage(stage ?? null)) {
    return NextResponse.json(
      { error: `stage must be one of: ${VALID_STAGES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (content === undefined || content === null) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  // Verify projectId exists if supplied
  if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const entry = await prisma.developmentEntry.create({
    data: {
      stage: stage!,
      title: title.trim(),
      content: content as object,
      status: status ?? "draft",
      ...(projectId ? { projectId } : {}),
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
