/**
 * GET    /api/elements/[id] — fetch one element.
 * PATCH  /api/elements/[id] — update fields (name, description, refs, tags, attrs).
 * DELETE /api/elements/[id] — remove.
 */
import { NextResponse } from "next/server";
import type { ElementPatch } from "@marionette/elements-core";
import { getCinemaEngine } from "../../../../lib/cinema/engine";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { store } = getCinemaEngine();
  const { id } = await params;
  const el = await store.get(id);
  if (!el) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ element: el });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { store } = getCinemaEngine();
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  try {
    const patch: ElementPatch = {
      ...(body as object),
      id,
    };
    const updated = await store.patch(patch);
    return NextResponse.json({ element: updated });
  } catch (err) {
    if (err instanceof Error && /not found/i.test(err.message)) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(`[elements/${id}] patch failed`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "patch failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { store } = getCinemaEngine();
  const { id } = await params;
  const ok = await store.remove(id);
  if (!ok) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ removed: true });
}
