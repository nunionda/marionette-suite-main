import { Elysia, t } from "elysia";
import { db, kpopGroups, sources } from "../db";
import { eq, and, isNull } from "drizzle-orm";

export const kpopGroupsRoutes = new Elysia({ prefix: "/api/kpop-groups" })

  .get("/", async ({ query }) => {
    let rows = await db.select().from(kpopGroups).all();

    // Optional filters: ?tier=1&generation=4&status=active
    const { tier, generation, status } = query as Record<string, string>;
    if (tier) rows = rows.filter(r => r.softPowerTier === Number(tier));
    if (generation) rows = rows.filter(r => r.generation === Number(generation));
    if (status) rows = rows.filter(r => r.status === status);

    return { success: true, groups: rows };
  })

  .get("/:id", async ({ params }) => {
    const [row] = await db.select().from(kpopGroups).where(eq(kpopGroups.id, Number(params.id)));
    if (!row) return { success: false, error: "Group not found" };
    return { success: true, group: row };
  })

  .patch(
    "/:id",
    async ({ params, body }) => {
      const b = body as any;
      const updates: Record<string, any> = {};
      if (b.youtubeChannelId !== undefined) updates.youtubeChannelId = b.youtubeChannelId;
      if (b.youtubeHandle !== undefined) updates.youtubeHandle = b.youtubeHandle;
      if (b.youtubeChannelUrl !== undefined) updates.youtubeChannelUrl = b.youtubeChannelUrl;
      if (b.sourceId !== undefined) updates.sourceId = b.sourceId;
      if (b.diplomaticRoles !== undefined) updates.diplomaticRoles = b.diplomaticRoles;
      if (b.tags !== undefined) updates.tags = b.tags;

      if (Object.keys(updates).length === 0) {
        return { success: false, error: "No fields to update" };
      }

      await db.update(kpopGroups).set(updates).where(eq(kpopGroups.id, Number(params.id)));
      const [updated] = await db.select().from(kpopGroups).where(eq(kpopGroups.id, Number(params.id)));
      return { success: true, group: updated };
    },
    {
      body: t.Object({
        youtubeChannelId: t.Optional(t.String()),
        youtubeHandle: t.Optional(t.String()),
        youtubeChannelUrl: t.Optional(t.String()),
        sourceId: t.Optional(t.Nullable(t.Number())),
        diplomaticRoles: t.Optional(t.String()),
        tags: t.Optional(t.String()),
      })
    }
  )

  // POST /:id/monitor — create a sources entry and link sourceId
  .post("/:id/monitor", async ({ params }) => {
    const id = Number(params.id);
    const [group] = await db.select().from(kpopGroups).where(eq(kpopGroups.id, id));
    if (!group) return { success: false, error: "Group not found" };
    if (group.sourceId) return { success: false, error: "Already monitored", sourceId: group.sourceId };

    if (!group.youtubeChannelId && !group.youtubeHandle) {
      return { success: false, error: "No YouTube channel ID or handle — update group first" };
    }

    const handle = group.youtubeHandle ?? group.youtubeChannelId ?? "";
    const channelUrl = group.youtubeChannelUrl ?? `https://www.youtube.com/@${handle}`;

    const [source] = await db.insert(sources).values({
      type: "youtube",
      channelId: group.youtubeChannelId ?? handle,
      channelName: group.nameEn,
      channelUrl,
      creditText: `Source: Official ${group.nameEn} channel. All rights belong to the original owners.`,
      disclaimerText: "Fan-made highlight for commentary and discovery. Visit the official channel for full content.",
      riskLevel: "low",
      maxClipSeconds: 20,
      enabled: 1,
    }).returning();

    await db.update(kpopGroups).set({ sourceId: source.id }).where(eq(kpopGroups.id, id));
    return { success: true, source, message: `${group.nameEn} added to monitoring` };
  })

  // DELETE /:id/monitor — unlink sourceId (does NOT delete the source)
  .delete("/:id/monitor", async ({ params }) => {
    const id = Number(params.id);
    const [group] = await db.select().from(kpopGroups).where(eq(kpopGroups.id, id));
    if (!group) return { success: false, error: "Group not found" };
    if (!group.sourceId) return { success: false, error: "Group is not monitored" };

    await db.update(kpopGroups).set({ sourceId: null }).where(eq(kpopGroups.id, id));
    return { success: true, message: `${group.nameEn} removed from monitoring (source preserved)` };
  });
