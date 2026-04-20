import { NextResponse } from "next/server";
import { requireSession } from "../../../../lib/server-session";
import { prisma } from "@marionette/db";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/development/:id
export async function GET(req: Request, ctx: Ctx) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { id } = await ctx.params;
  const entry = await prisma.developmentEntry.findUnique({ where: { id } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(entry);
}

// PUT /api/development/:id
// Body: { title?, content?, status?, projectId? }
export async function PUT(req: Request, ctx: Ctx) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { id } = await ctx.params;

  let body: { title?: string; content?: unknown; status?: string; projectId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const existing = await prisma.developmentEntry.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.projectId) {
    const project = await prisma.project.findUnique({ where: { id: body.projectId }, select: { id: true } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const updated = await prisma.developmentEntry.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.content !== undefined ? { content: body.content as object } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.projectId !== undefined ? { projectId: body.projectId } : {}),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/development/:id
export async function DELETE(req: Request, ctx: Ctx) {
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  const { id } = await ctx.params;
  const existing = await prisma.developmentEntry.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.developmentEntry.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
