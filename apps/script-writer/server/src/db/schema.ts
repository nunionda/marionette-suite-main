import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category").notNull(), // Feature Film, Short Film, Netflix Original, Commercial, YouTube
  genre: text("genre").notNull(),
  status: text("status").default("Active"),
  logline: text("logline"),
  progress: integer("progress").default(0),

  // Pipeline stages
  concept: text("concept"),
  architecture: text("architecture"),
  treatment: text("treatment"),
  scenario: text("scenario"),
  review: text("review"),
  analysisData: text("analysis_data"),       // JSON stored as text
  storyboardImages: text("storyboard_images"), // JSON stored as text

  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updated: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const sceneVersions = sqliteTable("scene_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id),
  stage: text("stage").notNull(),
  content: text("content").notNull(),
  producerNote: text("producer_note"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const projectOutline = sqliteTable("project_outline", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id),
  act: integer("act"),
  sceneNumber: integer("scene_number"),
  title: text("title"),
  description: text("description"),
  status: text("status").default("Planned"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const loglineIdeas = sqliteTable("logline_ideas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  genre: text("genre"),
  category: text("category"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});
