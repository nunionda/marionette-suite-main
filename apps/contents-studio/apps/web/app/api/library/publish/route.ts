import { NextRequest, NextResponse } from "next/server";
import { appendPromoted } from "../../../../lib/library/promoted-store";
import type { LibraryEntry } from "@marionette/types-content";

interface PublishBody {
  projectId: string;
  title: string;
  category: string;
  studio: string;
  deliverables: string[];
  channels: string[];
}

export async function POST(req: NextRequest) {
  let body: PublishBody;
  try {
    body = (await req.json()) as PublishBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectId, title, category, studio, deliverables, channels } = body;
  if (!projectId || !title || !category || !studio) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 });
  }

  const entry: LibraryEntry = {
    id: `PUB-${projectId}-${Date.now()}`,
    projectId,
    title,
    category: category as LibraryEntry["category"],
    studio: studio as LibraryEntry["studio"],
    deliverables: deliverables ?? [],
    channels: channels ?? [],
    metrics: {},
  };

  try {
    await appendPromoted(entry);
  } catch (err) {
    console.error("[publish] failed to write promoted entry:", err);
    return NextResponse.json({ error: "Store write failed" }, { status: 500 });
  }

  console.log("[publish] promoted:", entry.id, entry.title);
  return NextResponse.json({ ok: true, id: entry.id }, { status: 201 });
}
