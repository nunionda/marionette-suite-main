import { NextResponse } from "next/server";
import { findProject } from "@marionette/paperclip-bridge/registry";
import { buildExportPackage } from "@marionette/prompt-adapters";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const entry = await findProject(id);
  if (!entry) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const pkg = buildExportPackage(id, entry.title, entry.category, []);

  return new NextResponse(JSON.stringify(pkg, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${id}-higgsfield-export.json"`,
    },
  });
}
