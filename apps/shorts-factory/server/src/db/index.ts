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
    content_type TEXT DEFAULT 'short',
    status TEXT DEFAULT 'pending',
    created_by TEXT DEFAULT 'operator',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS render_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_clip_id INTEGER REFERENCES candidate_clips(id),
    template_id TEXT NOT NULL,
    template_version INTEGER DEFAULT 1,
    format TEXT DEFAULT 'vertical',
    lang_set TEXT DEFAULT 'kr,en',
    status TEXT DEFAULT 'queued',
    stage TEXT,
    error_code TEXT,
    error_message TEXT,
    output_file_path TEXT,
    subtitle_file_path TEXT,
    subtitle_entries TEXT,
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
    title_variants TEXT,
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

  CREATE TABLE IF NOT EXISTS kpop_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_kr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_alias TEXT,
    agency TEXT,
    group_type TEXT DEFAULT 'boy_group',
    generation INTEGER,
    debut_year INTEGER,
    disband_year INTEGER,
    status TEXT DEFAULT 'active',
    member_count INTEGER,
    soft_power_tier INTEGER DEFAULT 3,
    diplomatic_roles TEXT DEFAULT '[]',
    youtube_channel_id TEXT,
    youtube_handle TEXT,
    youtube_channel_url TEXT,
    fandom_name TEXT,
    tags TEXT DEFAULT '[]',
    source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`;
for (const stmt of DDL.split(';').map(s => s.trim()).filter(Boolean)) {
  sqlite.run(stmt);
}

// Migrations for existing databases: add columns that may be missing
// (SQLite ALTER TABLE does not support IF NOT EXISTS)
const renderJobsColumns = (
  sqlite.query("PRAGMA table_info(render_jobs)").all() as { name: string }[]
).map(c => c.name);
if (!renderJobsColumns.includes("subtitle_entries")) {
  sqlite.run("ALTER TABLE render_jobs ADD COLUMN subtitle_entries TEXT");
  console.log("Migration: added subtitle_entries column to render_jobs");
}
if (!renderJobsColumns.includes("format")) {
  sqlite.run("ALTER TABLE render_jobs ADD COLUMN format TEXT DEFAULT 'vertical'");
  console.log("Migration: added format column to render_jobs");
}

const candidateColumns = (
  sqlite.query("PRAGMA table_info(candidate_clips)").all() as { name: string }[]
).map(c => c.name);
if (!candidateColumns.includes("content_type")) {
  sqlite.run("ALTER TABLE candidate_clips ADD COLUMN content_type TEXT DEFAULT 'short'");
  console.log("Migration: added content_type column to candidate_clips");
}

const publishJobsColumns = (
  sqlite.query("PRAGMA table_info(publish_jobs)").all() as { name: string }[]
).map(c => c.name);
if (!publishJobsColumns.includes("title_variants")) {
  sqlite.run("ALTER TABLE publish_jobs ADD COLUMN title_variants TEXT");
  console.log("Migration: added title_variants column to publish_jobs");
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

// Seed K-pop groups if empty
const kpopCount = sqlite.query("SELECT COUNT(*) as cnt FROM kpop_groups").get() as { cnt: number };
if (kpopCount.cnt === 0) {
  const insertGroup = sqlite.prepare(
    `INSERT INTO kpop_groups
      (name_kr, name_en, name_alias, agency, group_type, generation, debut_year, disband_year, status, soft_power_tier, diplomatic_roles, youtube_handle, youtube_channel_url, fandom_name, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const groups: [string, string, string | null, string, string, number, number, number | null, string, number, string, string | null, string | null, string | null, string][] = [
    // Tier 1 — Official Diplomatic Ambassadors
    ['방탄소년단', 'BTS', 'BTS,방탄', 'HYBE', 'boy_group', 3, 2013, null, 'active', 1,
      '["UN SDG 2030 홍보대사","유니세프 LOVE MYSELF 캠페인","한국 문화외교관 (2021)","G20 미래세대 특별사절"]',
      'bts.bighitofficial', 'https://www.youtube.com/@bts.bighitofficial', 'ARMY', '["hybe","tier1","diplomatic"]'],
    ['블랙핑크', 'BLACKPINK', 'BLACKPINK,블핑', 'YG', 'girl_group', 3, 2016, null, 'active', 1,
      '["유니세프 홍보대사","COP26 기후변화 홍보대사","WHO 코로나19 홍보대사"]',
      'BLACKPINK', 'https://www.youtube.com/@BLACKPINK', 'BLINK', '["yg","tier1","diplomatic"]'],

    // Tier 2 — Global Powerhouse
    ['빅뱅', 'BIGBANG', 'BIGBANG,빅뱅', 'YG', 'boy_group', 2, 2006, null, 'hiatus', 2,
      '[]', 'BIGBANG', 'https://www.youtube.com/@BIGBANG', 'VIP', '["yg","tier2","2gen"]'],
    ['엑소', 'EXO', 'EXO,엑소', 'SM', 'boy_group', 3, 2012, null, 'active', 2,
      '[]', 'weareoneEXO', 'https://www.youtube.com/@weareoneEXO', 'EXO-L', '["sm","tier2","3gen"]'],
    ['샤이니', 'SHINee', 'SHINee,샤이니', 'SM', 'boy_group', 2, 2008, null, 'active', 2,
      '[]', 'SHINee', 'https://www.youtube.com/@SHINee', 'Shawol', '["sm","tier2","2gen"]'],
    ['슈퍼주니어', 'Super Junior', 'SuJu,슈주', 'SM', 'boy_group', 2, 2005, null, 'active', 2,
      '[]', 'superjunior', 'https://www.youtube.com/@superjunior', 'ELF', '["sm","tier2","2gen"]'],
    ['소녀시대', "Girls' Generation", 'SNSD,소시', 'SM', 'girl_group', 2, 2007, null, 'active', 2,
      '[]', 'GirlsGeneration', 'https://www.youtube.com/@GirlsGeneration', 'SONE', '["sm","tier2","2gen"]'],
    ['투애니원', '2NE1', '2NE1,투애니원', 'YG', 'girl_group', 2, 2009, null, 'disbanded', 2,
      '[]', null, null, 'Blackjack', '["yg","tier2","2gen","disbanded"]'],
    ['트와이스', 'TWICE', 'TWICE,트와이스', 'JYP', 'girl_group', 3, 2015, null, 'active', 2,
      '[]', 'TWICE', 'https://www.youtube.com/@TWICE', 'ONCE', '["jyp","tier2","3gen"]'],
    ['세븐틴', 'SEVENTEEN', 'SVT,세븐틴', 'PLEDIS/HYBE', 'boy_group', 3, 2015, null, 'active', 2,
      '[]', 'SEVENTEEN', 'https://www.youtube.com/@SEVENTEEN', 'CARAT', '["hybe","tier2","3gen"]'],
    ['엔시티 127', 'NCT 127', 'NCT127', 'SM', 'boy_group', 4, 2016, null, 'active', 2,
      '[]', 'NCT127', 'https://www.youtube.com/@NCT127', 'NCTzen', '["sm","tier2","4gen"]'],
    ['갓세븐', 'GOT7', 'GOT7,갓세븐', 'JYP', 'boy_group', 3, 2014, null, 'active', 2,
      '[]', 'GOT7Official', 'https://www.youtube.com/@GOT7Official', 'IGOT7', '["jyp","tier2","3gen"]'],
    ['몬스타엑스', 'MONSTA X', 'MX,몬스타엑스', 'STARSHIP', 'boy_group', 3, 2015, null, 'active', 2,
      '[]', 'OfficialMonstaX', 'https://www.youtube.com/@OfficialMonstaX', 'Monbebe', '["starship","tier2","3gen"]'],
    ['마마무', 'MAMAMOO', '마마무', 'RBW', 'girl_group', 3, 2014, null, 'active', 2,
      '[]', 'mamamooofficial', 'https://www.youtube.com/@mamamooofficial', 'MooMoo', '["rbw","tier2","3gen"]'],
    ['레드벨벳', 'Red Velvet', 'RV,레드벨벳', 'SM', 'girl_group', 3, 2014, null, 'active', 2,
      '[]', 'RedVelvet', 'https://www.youtube.com/@RedVelvet', 'ReVeluv', '["sm","tier2","3gen"]'],
    ['스트레이 키즈', 'Stray Kids', 'SKZ,스키즈', 'JYP', 'boy_group', 4, 2018, null, 'active', 2,
      '[]', 'Stray_Kids', 'https://www.youtube.com/@Stray_Kids', 'STAY', '["jyp","tier2","4gen"]'],
    ['에이티즈', 'ATEEZ', 'ATZ,에이티즈', 'KQ', 'boy_group', 4, 2018, null, 'active', 2,
      '[]', 'ATEEZ', 'https://www.youtube.com/@ATEEZ', 'ATINY', '["kq","tier2","4gen"]'],
    ['투모로우바이투게더', 'Tomorrow X Together', 'TXT,투바투', 'HYBE', 'boy_group', 4, 2019, null, 'active', 2,
      '[]', 'TXT_members', 'https://www.youtube.com/@TXT_members', 'MOA', '["hybe","tier2","4gen"]'],
    ['엔하이픈', 'ENHYPEN', 'ENH,엔하이픈', 'BELIFT/HYBE', 'boy_group', 4, 2020, null, 'active', 2,
      '[]', 'ENHYPEN', 'https://www.youtube.com/@ENHYPEN', 'ENGENE', '["hybe","tier2","4gen"]'],
    ['에스파', 'aespa', 'æspa,에스파', 'SM', 'girl_group', 4, 2020, null, 'active', 2,
      '[]', 'aespa', 'https://www.youtube.com/@aespa', 'MY', '["sm","tier2","4gen"]'],
    ['(여자)아이들', '(G)I-DLE', 'GIDLE,여자아이들', 'CUBE', 'girl_group', 4, 2018, null, 'active', 2,
      '[]', 'gidle', 'https://www.youtube.com/@gidle', 'Neverland', '["cube","tier2","4gen"]'],
    ['아이브', 'IVE', 'IVE,아이브', 'STARSHIP', 'girl_group', 4, 2021, null, 'active', 2,
      '[]', 'IVEstarship', 'https://www.youtube.com/@IVEstarship', 'DIVE', '["starship","tier2","4gen"]'],
    ['르세라핌', 'LE SSERAFIM', 'LESSERAFIM,르세라핌', 'SOURCE/HYBE', 'girl_group', 4, 2022, null, 'active', 2,
      '[]', 'lesserafim', 'https://www.youtube.com/@lesserafim', 'FEARNOT', '["hybe","tier2","4gen"]'],
    ['뉴진스', 'NewJeans', 'NJ,뉴진스', 'ADOR/HYBE', 'girl_group', 4, 2022, null, 'active', 2,
      '[]', 'NewJeans_official', 'https://www.youtube.com/@NewJeans_official', 'Bunnies', '["hybe","tier2","4gen"]'],
    ['있지', 'ITZY', 'ITZY,있지', 'JYP', 'girl_group', 4, 2019, null, 'active', 2,
      '[]', 'ITZY', 'https://www.youtube.com/@ITZY', 'MIDZY', '["jyp","tier2","4gen"]'],

    // Tier 3 — Notable Acts
    ['투피엠', '2PM', '2PM,투피엠', 'JYP', 'boy_group', 2, 2008, null, 'active', 3,
      '[]', '2pm', 'https://www.youtube.com/@2pm', 'Hottest', '["jyp","tier3","2gen"]'],
    ['인피니트', 'INFINITE', 'INFINITE,인피니트', 'Woollim', 'boy_group', 3, 2010, null, 'active', 3,
      '[]', 'infinite', 'https://www.youtube.com/@infinite', 'Inspirit', '["woollim","tier3","3gen"]'],
    ['빅스', 'VIXX', 'VIXX,빅스', 'Jellyfish', 'boy_group', 3, 2012, null, 'active', 3,
      '[]', 'vixx', 'https://www.youtube.com/@vixx', 'StarLight', '["jellyfish","tier3","3gen"]'],
    ['비투비', 'BTOB', 'BTOB,비투비', 'CUBE', 'boy_group', 3, 2012, null, 'active', 3,
      '[]', 'btob', 'https://www.youtube.com/@btob', 'Melody', '["cube","tier3","3gen"]'],
    ['하이라이트', 'Highlight', 'Highlight,하이라이트', 'Around US', 'boy_group', 3, 2009, null, 'active', 3,
      '[]', 'highlight', 'https://www.youtube.com/@highlight', 'Light', '["aroundus","tier3","2gen"]'],
    ['데이식스', 'DAY6', 'DAY6,데이식스', 'JYP', 'boy_group', 3, 2015, null, 'active', 3,
      '[]', 'DAY6', 'https://www.youtube.com/@DAY6', 'My Day', '["jyp","tier3","3gen"]'],
    ['위너', 'WINNER', 'WINNER,위너', 'YG', 'boy_group', 3, 2014, null, 'active', 3,
      '[]', 'WINNER', 'https://www.youtube.com/@WINNER', 'INNER CIRCLE', '["yg","tier3","3gen"]'],
    ['아이콘', 'iKON', 'iKON,아이콘', 'YG', 'boy_group', 3, 2015, null, 'active', 3,
      '[]', 'iKON', 'https://www.youtube.com/@iKON', 'iKONIC', '["yg","tier3","3gen"]'],
    ['펜타곤', 'Pentagon', 'PTG,펜타곤', 'CUBE', 'boy_group', 4, 2016, null, 'active', 3,
      '[]', 'PENTAGON', 'https://www.youtube.com/@PENTAGON', 'Universe', '["cube","tier3","4gen"]'],
    ['에스에프나인', 'SF9', 'SF9,에스에프나인', 'FNC', 'boy_group', 4, 2016, null, 'active', 3,
      '[]', 'SF9Official', 'https://www.youtube.com/@SF9Official', 'Fantasy', '["fnc","tier3","4gen"]'],
    ['더보이즈', 'THE BOYZ', 'TBZ,더보이즈', 'Cre.Ker', 'boy_group', 4, 2017, null, 'active', 3,
      '[]', 'THEBOYZ', 'https://www.youtube.com/@THEBOYZ', 'THE B', '["creker","tier3","4gen"]'],
    ['오마이걸', 'Oh My Girl', 'OMG,오마이걸', 'WM', 'girl_group', 3, 2015, null, 'active', 3,
      '[]', 'OhmygirlOfficial', 'https://www.youtube.com/@OhmygirlOfficial', 'Miracle', '["wm","tier3","3gen"]'],
    ['드림캐쳐', 'Dreamcatcher', 'DC,드림캐쳐', 'Dreamcatcher', 'girl_group', 4, 2017, null, 'active', 3,
      '[]', 'dreamcatcher', 'https://www.youtube.com/@dreamcatcher', 'InSomnia', '["dc","tier3","4gen"]'],
    ['우주소녀', 'WJSN', 'WJSN,우주소녀', 'Starship', 'girl_group', 4, 2016, null, 'active', 3,
      '[]', 'wjsn', 'https://www.youtube.com/@wjsn', 'Luda', '["starship","tier3","4gen"]'],
    ['프로미스나인', 'fromis_9', 'fromis9,프로미스나인', 'HYBE/IST', 'girl_group', 4, 2018, null, 'active', 3,
      '[]', 'fromis_9', 'https://www.youtube.com/@fromis_9', 'Star', '["hybe","tier3","4gen"]'],
    ['스테이씨', 'STAYC', 'STAYC,스테이씨', 'HIGHUP', 'girl_group', 4, 2020, null, 'active', 3,
      '[]', 'stayc', 'https://www.youtube.com/@stayc', 'SWITH', '["highup","tier3","4gen"]'],
    ['케플러', 'Kep1er', 'Kep1er,케플러', 'WakeOne', 'girl_group', 4, 2022, null, 'active', 3,
      '[]', 'Kep1er', 'https://www.youtube.com/@Kep1er', 'Kep1ian', '["wakeone","tier3","4gen"]'],
    ['엔믹스', 'NMIXX', 'NMIXX,엔믹스', 'JYP', 'girl_group', 4, 2022, null, 'active', 3,
      '[]', 'NMIXX', 'https://www.youtube.com/@NMIXX', 'NSWER', '["jyp","tier3","4gen"]'],
    ['키스오브라이프', 'KISS OF LIFE', 'KISSOLIFE,키오라', 'KISS OF LIFE', 'girl_group', 5, 2023, null, 'active', 3,
      '[]', 'KISSOFLIFE', 'https://www.youtube.com/@KISSOFLIFE', 'KISSY', '["kissolife","tier3","5gen"]'],
    ['트리플에스', 'tripleS', 'tripleS,트리플에스', 'MODHAUS', 'girl_group', 5, 2023, null, 'active', 3,
      '[]', 'triplescosmos', 'https://www.youtube.com/@triplescosmos', 'Cosmo', '["modhaus","tier3","5gen"]'],
    ['베이비몬스터', 'BABYMONSTER', 'BABYMONSTER,베몬', 'YG', 'girl_group', 5, 2024, null, 'active', 3,
      '[]', 'BABYMONSTER', 'https://www.youtube.com/@BABYMONSTER', null, '["yg","tier3","5gen"]'],
    ['제로베이스원', 'ZEROBASEONE', 'ZB1,제로베이스원', 'WAKEONE', 'boy_group', 5, 2023, null, 'active', 3,
      '[]', 'zerobaseone', 'https://www.youtube.com/@zerobaseone', 'ZEROSE', '["wakeone","tier3","5gen"]'],
    ['보이넥스트도어', 'BOYNEXTDOOR', 'BND,보넥도', 'KOZ/HYBE', 'boy_group', 5, 2023, null, 'active', 3,
      '[]', 'boynextdoor', 'https://www.youtube.com/@boynextdoor', 'FRIEND', '["hybe","tier3","5gen"]'],
  ];
  for (const g of groups) {
    insertGroup.run(...g);
  }
  console.log(`Seeded ${groups.length} K-pop groups`);
}

export const db = drizzle(sqlite, { schema });
export * from "./schema";
