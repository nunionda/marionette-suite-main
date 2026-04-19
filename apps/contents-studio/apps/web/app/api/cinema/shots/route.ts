/**
 * POST /api/cinema/shots — submit a Cinema Studio 3.5 shot for generation.
 *
 * Body shape (JSON):
 *   {
 *     prompt: string;
 *     sceneId?: string;
 *     shotId?: string;
 *     elementIds?: string[];
 *     cameraBody?: CameraBody;
 *     motion?: MotionAxis.type;
 *     ramp?: SpeedRampPreset;
 *     aspectRatio?: ImageAspectRatio;
 *     durationSec?: number;
 *     preferProvider?: string;
 *   }
 *
 * Returns: { jobId }. Client polls GET /api/cinema/shots/[jobId].
 */
import { NextResponse } from "next/server";
import { getCinemaEngine } from "../../../../lib/cinema/engine";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { queue } = getCinemaEngine();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as { prompt?: unknown }).prompt !== "string"
  ) {
    return NextResponse.json(
      { error: "prompt is required (string)" },
      { status: 400 },
    );
  }

  try {
    const jobId = await queue.submit("cinema:shot", body, {
      maxAttempts: 2,
      retryDelayMs: 3000,
    });
    return NextResponse.json({ jobId }, { status: 202 });
  } catch (err) {
    console.error("[cinema/shots] submit failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "submit failed" },
      { status: 500 },
    );
  }
}
