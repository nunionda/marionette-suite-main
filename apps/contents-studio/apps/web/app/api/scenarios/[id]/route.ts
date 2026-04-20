import { NextResponse } from "next/server";
import { requireSession } from "../../../../lib/server-session";
import { prisma } from "@marionette/db";

type Params = { params: Promise<{ id: string }> };

// GET /api/scenarios/:id — returns full scenario including content
export async function GET(req: Request, { params }: Params) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { id } = await params;

  const scenario = await prisma.scenario.findUnique({ where: { id } });
  if (!scenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  return NextResponse.json(scenario);
}

// PUT /api/scenarios/:id — partial update (title, content, status, projectId, metadata)
export async function PUT(req: Request, { params }: Params) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { id } = await params;

  const existing = await prisma.scenario.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  let body: {
    title?: string;
    content?: string;
    status?: string;
    projectId?: string | null;
    metadata?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, content, status, projectId, metadata } = body;

  // Verify projectId exists if supplied (null = detach)
  if (projectId !== undefined && projectId !== null) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const updated = await prisma.scenario.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(projectId !== undefined ? { projectId } : {}),
      ...(metadata !== undefined ? { metadata: metadata as object | null } : {}),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/scenarios/:id
export async function DELETE(req: Request, { params }: Params) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { id } = await params;

  const existing = await prisma.scenario.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  await prisma.scenario.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
