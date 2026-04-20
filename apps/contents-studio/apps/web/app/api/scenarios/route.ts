import { NextResponse } from "next/server";
import { requireSession } from "../../../lib/server-session";
import { prisma } from "@marionette/db";

const VALID_FORMATS = ["fdx", "fountain", "pdf", "text"] as const;
const VALID_SOURCES = ["upload", "script-writer", "manual"] as const;

type Format = (typeof VALID_FORMATS)[number];

function isValidFormat(f: string | null | undefined): f is Format {
  return VALID_FORMATS.includes(f as Format);
}

// GET /api/scenarios?projectId=xxx
// Lists all scenarios, optionally filtered by project
export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const scenarios = await prisma.scenario.findMany({
    where: projectId ? { projectId } : {},
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      projectId: true,
      title: true,
      format: true,
      source: true,
      sourceRef: true,
      status: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
      // Omit `content` from the list response — it can be very large
    },
  });

  return NextResponse.json({ data: scenarios, total: scenarios.length });
}

// POST /api/scenarios
// Body: { title, content, format?, source?, sourceRef?, projectId?, metadata?, status? }
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  let body: {
    title?: string;
    content?: string;
    format?: string;
    source?: string;
    sourceRef?: string;
    projectId?: string;
    metadata?: unknown;
    status?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, content, format, source, sourceRef, projectId, metadata, status } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }
  if (format !== undefined && !isValidFormat(format)) {
    return NextResponse.json(
      { error: `format must be one of: ${VALID_FORMATS.join(", ")}` },
      { status: 400 },
    );
  }

  // Verify projectId exists if supplied
  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const scenario = await prisma.scenario.create({
    data: {
      title: title.trim(),
      content,
      format: (format as Format) ?? "text",
      source: (VALID_SOURCES.includes(source as (typeof VALID_SOURCES)[number]) ? source : "manual") as string,
      sourceRef: sourceRef ?? null,
      status: status ?? "imported",
      metadata: metadata ? (metadata as object) : null,
      ...(projectId ? { projectId } : {}),
    },
  });

  return NextResponse.json(scenario, { status: 201 });
}
