import { Elysia, t } from "elysia";
import { db, sources } from "../db";
import { eq } from "drizzle-orm";

export const sourcesRoutes = new Elysia({ prefix: "/api/sources" })

  .get("/", async () => {
    const rows = await db.select().from(sources).all();
    return { success: true, sources: rows };
  })

  .get("/:id", async ({ params }) => {
    const [row] = await db.select().from(sources).where(eq(sources.id, Number(params.id)));
    if (!row) return { success: false, error: "Source not found" };
    return { success: true, source: row };
  })

  .post("/", async ({ body }) => {
    const b = body as any;
    const [row] = await db.insert(sources).values({
      type: b.type || "youtube",
      channelId: b.channelId,
      channelName: b.channelName,
      channelUrl: b.channelUrl,
      creditText: b.creditText,
      disclaimerText: b.disclaimerText || null,
      riskLevel: b.riskLevel || "low",
      maxClipSeconds: b.maxClipSeconds || 20,
      enabled: b.enabled ?? 1,
    }).returning();
    return { success: true, source: row };
  })

  .patch("/:id", async ({ params, body }) => {
    const b = body as any;
    const updates: Record<string, any> = {};
    if (b.channelName !== undefined) updates.channelName = b.channelName;
    if (b.channelUrl !== undefined) updates.channelUrl = b.channelUrl;
    if (b.creditText !== undefined) updates.creditText = b.creditText;
    if (b.disclaimerText !== undefined) updates.disclaimerText = b.disclaimerText;
    if (b.riskLevel !== undefined) updates.riskLevel = b.riskLevel;
    if (b.maxClipSeconds !== undefined) updates.maxClipSeconds = b.maxClipSeconds;
    if (b.enabled !== undefined) updates.enabled = b.enabled;

    if (Object.keys(updates).length === 0) {
      return { success: false, error: "No fields to update" };
    }

    await db.update(sources).set(updates).where(eq(sources.id, Number(params.id)));
    const [updated] = await db.select().from(sources).where(eq(sources.id, Number(params.id)));
    return { success: true, source: updated };
  })

  .delete("/:id", async ({ params }) => {
    await db.delete(sources).where(eq(sources.id, Number(params.id)));
    return { success: true };
  });
