import { pgTable, serial, text, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", ["Movie", "Series", "Commercial"]);
export const statusEnum = pgEnum("status", ["Active", "Archived", "Draft"]);

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // Movie, Series, Commercial
  genre: text("genre").notNull(),
  status: text("status").default("Active"),
  
  // Pipeline Data (Stored as text for simplicity in this MVP, can be broken out further)
  concept: text("concept"),
  architecture: text("architecture"),
  treatment: text("treatment"),
  scenario: text("scenario"),
  review: text("review"),
  analysisData: jsonb("analysis_data"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sceneVersions = pgTable("scene_versions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  stage: text("stage").notNull(), // concept, architecture, treatment, scenario
  content: text("content").notNull(),
  producerNote: text("producer_note"),
  createdAt: timestamp("created_at").defaultNow(),
});
