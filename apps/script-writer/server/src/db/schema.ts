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

// ─── Scene/Cut Production Pipeline ───

export const scenes = sqliteTable("scenes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id),
  sceneNumber: integer("scene_number").notNull(),
  slug: text("slug").notNull(),           // 'sc001'
  displayId: text("display_id"),          // 'BS_sc001'
  heading: text("heading"),               // 'S#1. EXT. 싱가포르 국제학교 정문 - 오후'
  setting: text("setting"),               // 'EXT.'
  location: text("location"),             // '싱가포르 국제학교 정문'
  timeOfDay: text("time_of_day"),         // '오후'
  summary: text("summary"),
  characters: text("characters"),         // JSON array as text
  act: integer("act"),                    // 1, 2, 3
  status: text("status").default("pending"), // pending | in_progress | done
  cutCount: integer("cut_count").default(0),
  completedCutCount: integer("completed_cut_count").default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const cuts = sqliteTable("cuts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sceneId: integer("scene_id").references(() => scenes.id),
  projectId: integer("project_id").references(() => projects.id),
  cutNumber: integer("cut_number").notNull(),
  slug: text("slug").notNull(),           // 'cut001'
  displayId: text("display_id"),          // 'BS_sc001_cut001'
  type: text("type"),                     // 'action' | 'dialogue' | 'transition'
  description: text("description"),       // cut description text
  status: text("status").default("pending"), // pending | script | image_prompt | image_gen | video | audio | done

  // Node pipeline data (JSON stored as text)
  scriptText: text("script_text"),
  imagePrompt: text("image_prompt"),
  imageUrl: text("image_url"),
  videoPrompt: text("video_prompt"),
  videoUrl: text("video_url"),
  audioUrl: text("audio_url"),
  thumbnailUrl: text("thumbnail_url"),

  duration: integer("duration").default(4), // seconds
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// ─── Production Pipeline Assets ───
// Stores results from both Production Design and Video Generation nodes

export const productionAssets = sqliteTable("production_assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id),
  nodeId: text("node_id").notNull(),          // e.g. 'character_design', 'image_gen'
  phase: text("phase").notNull(),             // e.g. 'analysis', 'world_building', 'image_gen'
  track: text("track").notNull(),             // 'design' | 'video'
  status: text("status").default("pending"),  // pending | generating | done | error

  inputData: text("input_data"),              // JSON — input params used
  outputData: text("output_data"),            // JSON — text results, analysis data
  imageUrls: text("image_urls"),              // JSON array of image URLs
  fileUrls: text("file_urls"),                // JSON array of file URLs (PDF, XLSX)

  style: text("style"),                       // e.g. 'bong', 'kubrick' (10 Masters)
  provider: text("provider"),                 // e.g. 'pollinations', 'ollama'
  errorMessage: text("error_message"),

  // For video track: link to specific cut
  cutId: integer("cut_id").references(() => cuts.id),
  sceneId: integer("scene_id").references(() => scenes.id),

  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const loglineIdeas = sqliteTable("logline_ideas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  genre: text("genre"),
  category: text("category"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});
