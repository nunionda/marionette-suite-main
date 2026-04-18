import { Elysia, t } from "elysia";
import { db, assets, sources } from "../db";
import { eq, desc } from "drizzle-orm";
import { detectSource } from "../services/detector";
import { triggerDownload } from "../lib/worker-bridge";

export const assetsRoutes = new Elysia()

  // GET /api/assets — list all, optionally filter by sourceId or downloadStatus
  .get("/api/assets", async ({ query }) => {
    const rows = await db
      .select({
        id: assets.id,
        sourceId: assets.sourceId,
        videoId: assets.videoId,
        title: assets.title,
        publishedAt: assets.publishedAt,
        duration: assets.duration,
        thumbnailUrl: assets.thumbnailUrl,
        rawFilePath: assets.rawFilePath,
        downloadStatus: assets.downloadStatus,
        errorMessage: assets.errorMessage,
        createdAt: assets.createdAt,
        channelName: sources.channelName,
        maxClipSeconds: sources.maxClipSeconds,
      })
      .from(assets)
      .leftJoin(sources, eq(assets.sourceId, sources.id))
      .orderBy(desc(assets.publishedAt));

    const filtered = query.sourceId
      ? rows.filter((r) => r.sourceId === Number(query.sourceId))
      : query.status
      ? rows.filter((r) => r.downloadStatus === query.status)
      : rows;

    return { assets: filtered };
  })

  // GET /api/assets/:id
  .get("/api/assets/:id", async ({ params, status }) => {
    const rows = await db
      .select({
        id: assets.id,
        sourceId: assets.sourceId,
        videoId: assets.videoId,
        title: assets.title,
        publishedAt: assets.publishedAt,
        duration: assets.duration,
        thumbnailUrl: assets.thumbnailUrl,
        rawFilePath: assets.rawFilePath,
        downloadStatus: assets.downloadStatus,
        errorMessage: assets.errorMessage,
        createdAt: assets.createdAt,
        channelName: sources.channelName,
        maxClipSeconds: sources.maxClipSeconds,
        creditText: sources.creditText,
      })
      .from(assets)
      .leftJoin(sources, eq(assets.sourceId, sources.id))
      .where(eq(assets.id, Number(params.id)));
    if (rows.length === 0) return status(404, { error: "Asset not found" });
    return rows[0];
  })

  // POST /api/assets/detect — trigger RSS poll for one source
  .post(
    "/api/assets/detect",
    async ({ body }) => {
      const count = await detectSource(body.sourceId);
      return { success: true, newVideos: count };
    },
    { body: t.Object({ sourceId: t.Number() }) }
  )

  // POST /api/assets/:id/download — queue yt-dlp download
  .post("/api/assets/:id/download", async ({ params, status }) => {
    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, Number(params.id)));
    if (!asset) return status(404, { error: "Asset not found" });

    if (asset.downloadStatus === "downloading") {
      return { success: false, message: "Already downloading" };
    }

    // Mark as downloading immediately
    await db
      .update(assets)
      .set({ downloadStatus: "downloading", errorMessage: null })
      .where(eq(assets.id, asset.id));

    // Spawn Python worker — fire-and-forget
    triggerDownload(asset.id, asset.videoId).catch(console.error);

    return { success: true, assetId: asset.id };
  })

  // PATCH /api/assets/:id — update status/path (called by Python worker via API)
  .patch(
    "/api/assets/:id",
    async ({ params, body, status }) => {
      const [asset] = await db
        .select()
        .from(assets)
        .where(eq(assets.id, Number(params.id)));
      if (!asset) return status(404, { error: "Asset not found" });

      await db
        .update(assets)
        .set({
          ...(body.downloadStatus !== undefined && { downloadStatus: body.downloadStatus }),
          ...(body.rawFilePath !== undefined && { rawFilePath: body.rawFilePath }),
          ...(body.duration !== undefined && { duration: body.duration }),
          ...(body.errorMessage !== undefined && { errorMessage: body.errorMessage }),
        })
        .where(eq(assets.id, asset.id));

      const [updated] = await db
        .select()
        .from(assets)
        .where(eq(assets.id, asset.id));
      return updated;
    },
    {
      body: t.Object({
        downloadStatus: t.Optional(t.String()),
        rawFilePath: t.Optional(t.String()),
        duration: t.Optional(t.Number()),
        errorMessage: t.Optional(t.Nullable(t.String())),
      }),
    }
  );
