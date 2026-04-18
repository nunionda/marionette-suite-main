import { Elysia } from "elysia";
import { db, editTemplates } from "../db";
import { eq } from "drizzle-orm";

export const templatesRoutes = new Elysia({ prefix: "/api/templates" })

  .get("/", async () => {
    const rows = await db.select().from(editTemplates).all();
    return { success: true, templates: rows };
  })

  .get("/:id", async ({ params }) => {
    const [row] = await db.select().from(editTemplates).where(eq(editTemplates.id, Number(params.id)));
    if (!row) return { success: false, error: "Template not found" };
    return { success: true, template: row };
  })

  .post("/", async ({ body }) => {
    const b = body as any;
    const [row] = await db.insert(editTemplates).values({
      name: b.name,
      description: b.description || null,
      openingDuration: b.openingDuration ?? 0.5,
      endingDuration: b.endingDuration ?? 1.0,
      subtitleStyle: b.subtitleStyle || null,
      creditText: b.creditText || null,
      ctaText: b.ctaText || null,
      isDefault: b.isDefault ?? 0,
    }).returning();
    return { success: true, template: row };
  })

  .patch("/:id", async ({ params, body }) => {
    const b = body as any;
    const updates: Record<string, any> = {};
    if (b.name !== undefined) updates.name = b.name;
    if (b.description !== undefined) updates.description = b.description;
    if (b.openingDuration !== undefined) updates.openingDuration = b.openingDuration;
    if (b.endingDuration !== undefined) updates.endingDuration = b.endingDuration;
    if (b.subtitleStyle !== undefined) updates.subtitleStyle = b.subtitleStyle;
    if (b.creditText !== undefined) updates.creditText = b.creditText;
    if (b.ctaText !== undefined) updates.ctaText = b.ctaText;
    if (b.isDefault !== undefined) updates.isDefault = b.isDefault;

    if (Object.keys(updates).length === 0) {
      return { success: false, error: "No fields to update" };
    }

    await db.update(editTemplates).set(updates).where(eq(editTemplates.id, Number(params.id)));
    const [updated] = await db.select().from(editTemplates).where(eq(editTemplates.id, Number(params.id)));
    return { success: true, template: updated };
  })

  .delete("/:id", async ({ params }) => {
    await db.delete(editTemplates).where(eq(editTemplates.id, Number(params.id)));
    return { success: true };
  });
