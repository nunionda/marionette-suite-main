/**
 * GET /api/ai/providers — list every registered provider with probed health.
 *
 * Response shape:
 *   {
 *     providers: [
 *       { id, capability, label, tier, description?, health: {...} },
 *       ...
 *     ]
 *   }
 *
 * Uses registry.getHealthMatrix per capability — probes are cached (30s
 * TTL inside the registry) so polling this endpoint is cheap.
 */
import { NextResponse } from "next/server";
import { getHealthMatrix } from "@marionette/ai-providers/registry";
import type { Capability } from "@marionette/ai-providers";

export const runtime = "nodejs";

const CAPABILITIES: readonly Capability[] = [
  "text",
  "image",
  "video",
  "audio",
  "voice-clone",
] as const;

export async function GET() {
  try {
    const perCap = await Promise.all(
      CAPABILITIES.map(async (cap) => ({
        cap,
        rows: await getHealthMatrix(cap),
      })),
    );
    const providers = perCap.flatMap(({ cap, rows }) =>
      rows.map(({ meta, health }) => ({
        id: meta.id,
        capability: cap,
        label: meta.label,
        tier: meta.tier,
        description: meta.description,
        health,
      })),
    );
    return NextResponse.json({ providers });
  } catch (err) {
    console.error("[ai/providers] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 500 },
    );
  }
}
