import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ─── Monitored Sources (공식 채널) ───

export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull().default("youtube"),
  channelId: text("channel_id").notNull(),
  channelName: text("channel_name").notNull(),
  channelUrl: text("channel_url").notNull(),
  creditText: text("credit_text").notNull(),
  disclaimerText: text("disclaimer_text"),
  riskLevel: text("risk_level").default("low"),
  maxClipSeconds: integer("max_clip_seconds").default(20),
  enabled: integer("enabled").default(1),
  lastCheckedAt: text("last_checked_at"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// ─── Source Assets (감지된 원본 영상) ───

export const assets = sqliteTable("assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceId: integer("source_id").references(() => sources.id),
  videoId: text("video_id").notNull().unique(),
  title: text("title").notNull(),
  publishedAt: text("published_at"),
  duration: integer("duration"),
  thumbnailUrl: text("thumbnail_url"),
  rawFilePath: text("raw_file_path"),
  downloadStatus: text("download_status").default("pending"),
  errorMessage: text("error_message"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// ─── Candidate Clips (하이라이트 후보) ───

export const candidateClips = sqliteTable("candidate_clips", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assetId: integer("asset_id").references(() => assets.id),
  startSec: real("start_sec").notNull(),
  endSec: real("end_sec").notNull(),
  ruleType: text("rule_type").notNull(),
  rationale: text("rationale"),
  contentType: text("content_type").default("short"), // short | long
  status: text("status").default("pending"),
  createdBy: text("created_by").default("operator"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// ─── Render Jobs (렌더 작업) ───

export const renderJobs = sqliteTable("render_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidateClipId: integer("candidate_clip_id").references(() => candidateClips.id),
  templateId: text("template_id").notNull(),
  templateVersion: integer("template_version").default(1),
  format: text("format").default("vertical"), // vertical (9:16) | horizontal (16:9)
  renderTier: text("render_tier").default("ffmpeg"), // ffmpeg | submagic | resolve
  langSet: text("lang_set").default("kr,en"),
  status: text("status").default("queued"),
  stage: text("stage"),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  outputFilePath: text("output_file_path"),
  subtitleFilePath: text("subtitle_file_path"),
  subtitleEntries: text("subtitle_entries"), // JSON: [{start, end, text}[]]
  idempotencyKey: text("idempotency_key").unique(),
  retryCount: integer("retry_count").default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

// ─── Review Decisions (검수 결정) ───

export const reviewDecisions = sqliteTable("review_decisions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  renderJobId: integer("render_job_id").references(() => renderJobs.id),
  decision: text("decision").notNull(),
  reviewer: text("reviewer").default("operator"),
  checklistResult: text("checklist_result"),
  notes: text("notes"),
  decidedAt: text("decided_at").$defaultFn(() => new Date().toISOString()),
});

// ─── Publish Jobs (업로드 작업) ───

export const publishJobs = sqliteTable("publish_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  renderJobId: integer("render_job_id").references(() => renderJobs.id),
  platform: text("platform").default("youtube_shorts"),
  title: text("title").notNull(),
  description: text("description"),
  hashtags: text("hashtags"),
  scheduledAt: text("scheduled_at"),
  status: text("status").default("pending"),
  uploadId: text("upload_id"),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  idempotencyKey: text("idempotency_key").unique(),
  titleVariants: text("title_variants"), // JSON array of 3 LLM-generated title options
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

// ─── Daily Metrics (일별 성과) ───

export const dailyMetrics = sqliteTable("daily_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  publishJobId: integer("publish_job_id").references(() => publishJobs.id),
  date: text("date").notNull(),
  views: integer("views").default(0),
  avd: real("avd"),
  retention1s: real("retention_1s"),
  retention3s: real("retention_3s"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  saves: integer("saves").default(0),
  geo: text("geo"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// ─── Pipeline Logs (관측성) ───

export const pipelineLogs = sqliteTable("pipeline_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobType: text("job_type").notNull(),
  jobId: integer("job_id"),
  stage: text("stage").notNull(),
  status: text("status").notNull(),
  sourceId: integer("source_id"),
  assetId: integer("asset_id"),
  candidateClipId: integer("candidate_clip_id"),
  renderJobId: integer("render_job_id"),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  metadata: text("metadata"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// ─── Edit Templates (편집 프리셋) ───

export const editTemplates = sqliteTable("edit_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  openingDuration: real("opening_duration").default(0.5),
  endingDuration: real("ending_duration").default(1.0),
  subtitleStyle: text("subtitle_style"),
  creditText: text("credit_text"),
  ctaText: text("cta_text"),
  isDefault: integer("is_default").default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// ─── K-pop Groups (소프트파워 그룹 DB) ───

export const kpopGroups = sqliteTable("kpop_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameKr: text("name_kr").notNull(),
  nameEn: text("name_en").notNull(),
  nameAlias: text("name_alias"),
  agency: text("agency"),
  groupType: text("group_type").default("boy_group"),
  generation: integer("generation"),
  debutYear: integer("debut_year"),
  disbandYear: integer("disband_year"),
  status: text("status").default("active"),
  memberCount: integer("member_count"),
  softPowerTier: integer("soft_power_tier").default(3),
  diplomaticRoles: text("diplomatic_roles").default("[]"),
  youtubeChannelId: text("youtube_channel_id"),
  youtubeHandle: text("youtube_handle"),
  youtubeChannelUrl: text("youtube_channel_url"),
  fandomName: text("fandom_name"),
  tags: text("tags").default("[]"),
  sourceId: integer("source_id").references(() => sources.id, { onDelete: "set null" }),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});
