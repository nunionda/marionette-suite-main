import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const DB_PATH = "./script_writer.db";
const sqlite = new Database(DB_PATH, { create: true });
sqlite.exec("PRAGMA journal_mode = WAL;");

// Auto-create all tables on startup
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    genre TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    logline TEXT,
    progress INTEGER DEFAULT 0,
    concept TEXT,
    architecture TEXT,
    treatment TEXT,
    scenario TEXT,
    review TEXT,
    analysis_data TEXT,
    storyboard_images TEXT,
    concept_brief TEXT,
    bible TEXT,
    episodes TEXT,
    script TEXT,
    hook TEXT,
    edit TEXT,
    seo TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scene_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    stage TEXT NOT NULL,
    content TEXT NOT NULL,
    producer_note TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS project_outline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    act INTEGER,
    scene_number INTEGER,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'Planned',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    scene_number INTEGER NOT NULL,
    slug TEXT NOT NULL,
    display_id TEXT,
    heading TEXT,
    setting TEXT,
    location TEXT,
    time_of_day TEXT,
    summary TEXT,
    characters TEXT,
    act INTEGER,
    status TEXT DEFAULT 'pending',
    cut_count INTEGER DEFAULT 0,
    completed_cut_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cuts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER REFERENCES scenes(id),
    project_id INTEGER REFERENCES projects(id),
    cut_number INTEGER NOT NULL,
    slug TEXT NOT NULL,
    display_id TEXT,
    type TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    script_text TEXT,
    image_prompt TEXT,
    image_url TEXT,
    video_prompt TEXT,
    video_url TEXT,
    audio_url TEXT,
    thumbnail_url TEXT,
    duration INTEGER DEFAULT 4,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS logline_ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    genre TEXT,
    category TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS production_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    node_id TEXT NOT NULL,
    phase TEXT NOT NULL,
    track TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    input_data TEXT,
    output_data TEXT,
    image_urls TEXT,
    file_urls TEXT,
    style TEXT,
    provider TEXT,
    error_message TEXT,
    cut_id INTEGER REFERENCES cuts(id),
    scene_id INTEGER REFERENCES scenes(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed default projects if DB is empty
const count = sqlite.query("SELECT COUNT(*) as cnt FROM projects").get() as { cnt: number };
if (count.cnt === 0) {
  const insert = sqlite.prepare(
    "INSERT INTO projects (title, category, genre, status, progress, logline, concept, architecture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );

  const defaults = [
    ['THE ALGORITHM', 'Netflix Original', 'Thriller', 'Development (Phase 2)', 45,
      'A rogue quantum algorithm alters reality, forcing a disgraced trader and a ghost hacker into a 72-hour race against extinction.',
      '알고리듬이 세상을 삼킨다. 72시간의 리얼타임 레이스.',
      '[Characters Design]\n- KANG: Disgraced Quant (Cynical/Logical)\n- SOPHIE: Ghost Hacker (Nervous/Brilliant)\n- ALGORITHM: Sovereign Engine (Cold/Absolute)'],
    ['FIRST SNOW (첫눈)', 'Short Film', 'Drama', 'Simulation (Short)', 0,
      '사랑했던 사람과의 마지막 기억이 첫눈과 함께 사라지기 전, 단 한 번의 인사를 전하려는 남자의 이야기.', null, null],
    ['ETERNAL ECHOES (영원의 메아리)', 'Netflix Original', 'SF', 'Simulation (10-Ep)', 0,
      '평행세계의 연인이 죽음 이후 데이터로 부활한다. 10개의 에피소드에 걸친 금지된 사랑과 진실의 추적.', null, null],
    ['VALENTINE GLOW (발렌타인 글로우)', 'Commercial', 'Romance', 'Simulation (30s Ad)', 0,
      '30초 만에 사로잡는 사랑의 향기. 가장 순수한 고백의 순간을 담은 프리미엄 코스메틱 광고.', null, null],
  ];

  for (const row of defaults) insert.run(...row);
  console.log("Seeded 4 default projects into SQLite");
}

export const db = drizzle(sqlite, { schema });
export * from "./schema";
