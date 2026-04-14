import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const DB_PATH = "./shorts_factory.db";
const sqlite = new Database(DB_PATH, { create: true });
sqlite.run("PRAGMA journal_mode = WAL;");

// Auto-create all tables on startup
const DDL = `
  CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL DEFAULT 'youtube',
    channel_id TEXT NOT NULL,
    channel_name TEXT NOT NULL,
    channel_url TEXT NOT NULL,
    credit_text TEXT NOT NULL,
    disclaimer_text TEXT,
    risk_level TEXT DEFAULT 'low',
    max_clip_seconds INTEGER DEFAULT 20,
    enabled INTEGER DEFAULT 1,
    last_checked_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER REFERENCES sources(id),
    video_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    published_at TEXT,
    duration INTEGER,
    thumbnail_url TEXT,
    raw_file_path TEXT,
    download_status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS candidate_clips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER REFERENCES assets(id),
    start_sec REAL NOT NULL,
    end_sec REAL NOT NULL,
    rule_type TEXT NOT NULL,
    rationale TEXT,
    status TEXT DEFAULT 'pending',
    created_by TEXT DEFAULT 'operator',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS render_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_clip_id INTEGER REFERENCES candidate_clips(id),
    template_id TEXT NOT NULL,
    template_version INTEGER DEFAULT 1,
    lang_set TEXT DEFAULT 'kr,en',
    status TEXT DEFAULT 'queued',
    stage TEXT,
    error_code TEXT,
    error_message TEXT,
    output_file_path TEXT,
    subtitle_file_path TEXT,
    idempotency_key TEXT UNIQUE,
    retry_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS review_decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    render_job_id INTEGER REFERENCES render_jobs(id),
    decision TEXT NOT NULL,
    reviewer TEXT DEFAULT 'operator',
    checklist_result TEXT,
    notes TEXT,
    decided_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS publish_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    render_job_id INTEGER REFERENCES render_jobs(id),
    platform TEXT DEFAULT 'youtube_shorts',
    title TEXT NOT NULL,
    description TEXT,
    hashtags TEXT,
    scheduled_at TEXT,
    status TEXT DEFAULT 'pending',
    upload_id TEXT,
    error_code TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    idempotency_key TEXT UNIQUE,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS daily_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    publish_job_id INTEGER REFERENCES publish_jobs(id),
    date TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    avd REAL,
    retention_1s REAL,
    retention_3s REAL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    geo TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pipeline_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_type TEXT NOT NULL,
    job_id INTEGER,
    stage TEXT NOT NULL,
    status TEXT NOT NULL,
    source_id INTEGER,
    asset_id INTEGER,
    candidate_clip_id INTEGER,
    render_job_id INTEGER,
    error_code TEXT,
    error_message TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS edit_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    opening_duration REAL DEFAULT 0.5,
    ending_duration REAL DEFAULT 1.0,
    subtitle_style TEXT,
    credit_text TEXT,
    cta_text TEXT,
    is_default INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`;
for (const stmt of DDL.split(';').map(s => s.trim()).filter(Boolean)) {
  sqlite.run(stmt);
}

// Seed default templates if empty
const count = sqlite.query("SELECT COUNT(*) as cnt FROM edit_templates").get() as { cnt: number };
if (count.cnt === 0) {
  const insert = sqlite.prepare(
    "INSERT INTO edit_templates (name, description, opening_duration, ending_duration, subtitle_style, credit_text, cta_text, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  insert.run(
    'Standard K-POP',
    '표준 K-POP 팬튜브 템플릿 — 화이트 자막, 0.5초 훅 오프닝',
    0.5, 1.0,
    'FontName=Outfit,FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1',
    'Source: Official aespa / SMTOWN channel. All rights belong to the original owners.',
    'Subscribe for more highlights!',
    1
  );
  insert.run(
    'Minimal Clean',
    '미니멀 클린 템플릿 — 작은 자막, CTA 없음',
    0.3, 0.5,
    'FontName=Geist Mono,FontSize=18,PrimaryColour=&H00E8E4DC,OutlineColour=&H00000000,Outline=1,Shadow=0',
    'All rights belong to the original creators.',
    '',
    0
  );
  console.log("Seeded 2 default edit templates");
}

// Seed aespa official source if empty
const srcCount = sqlite.query("SELECT COUNT(*) as cnt FROM sources").get() as { cnt: number };
if (srcCount.cnt === 0) {
  sqlite.prepare(
    "INSERT INTO sources (type, channel_id, channel_name, channel_url, credit_text, disclaimer_text, risk_level, max_clip_seconds, enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    'youtube',
    'UCEf_Bc-KVd7onSeifS3py9g',
    'SMTOWN',
    'https://www.youtube.com/@SMTOWN',
    'Source: Official SMTOWN channel. All rights belong to SM Entertainment.',
    'This is a fan-made highlight for commentary and discovery. Please visit the official channel for the full content.',
    'low',
    20,
    1
  );
  console.log("Seeded SMTOWN as default source");
}

export const db = drizzle(sqlite, { schema });
export * from "./schema";
