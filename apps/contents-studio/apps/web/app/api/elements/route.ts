/**
 * GET  /api/elements?projectId=... — list elements (optional filters).
 * POST /api/elements                 — create an element.
 *
 * Minimal surface for Sprint 15a cinema demo. Sprint 15c expands with
 * patch, delete, trigger-training, and reference uploads.
 */
import { NextResponse } from "next/server";
import type { ElementDraft, ElementKind } from "@marionette/elements-core";
import { getCinemaEngine } from "../../../lib/cinema/engine";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { store } = getCinemaEngine();
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const kind = url.searchParams.get("kind") as ElementKind | null;
  const tag = url.searchParams.get("tag") ?? undefined;
  const nameLike = url.searchParams.get("nameLike") ?? undefined;

  try {
    const elements = await store.query({
      projectId,
      kind: kind ?? undefined,
      tag,
      nameLike,
    });
    return NextResponse.json({ elements });
  } catch (err) {
    console.error("[elements] list failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "list failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { store } = getCinemaEngine();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const b = body as Partial<ElementDraft>;
  if (
    typeof b.projectId !== "string" ||
    typeof b.name !== "string" ||
    typeof b.kind !== "string"
  ) {
    return NextResponse.json(
      { error: "projectId, name, kind are required strings" },
      { status: 400 },
    );
  }

  try {
    const draft: ElementDraft = {
      projectId: b.projectId,
      kind: b.kind as ElementKind,
      name: b.name,
      description: b.description,
      references: b.references ?? [],
      attributes: b.attributes ?? {},
      tags: b.tags ?? [],
    };
    const el = await store.create(draft);
    return NextResponse.json({ element: el }, { status: 201 });
  } catch (err) {
    console.error("[elements] create failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "create failed" },
      { status: 500 },
    );
  }
}
