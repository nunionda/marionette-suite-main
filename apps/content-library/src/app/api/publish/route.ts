import { NextRequest, NextResponse } from "next/server";
import { appendPromoted } from "@/lib/promoted-store";
import type { LibraryEntry } from "@marionette/types-content";

// Allow cross-origin calls from post-studio (:4002)
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "http://localhost:4002",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS_HEADERS });
  }

  const { projectId, title, category, studio, deliverables, channels } = body;
  if (!projectId || !title || !category || !studio) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 422, headers: CORS_HEADERS });
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
    return NextResponse.json({ error: "Store write failed" }, { status: 500, headers: CORS_HEADERS });
  }

  console.log("[publish] promoted:", entry.id, entry.title);
  return NextResponse.json({ ok: true, id: entry.id }, { status: 201, headers: CORS_HEADERS });
}
