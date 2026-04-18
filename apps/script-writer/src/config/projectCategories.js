/**
 * Shared project category, genre, and GS pipeline definitions.
 * Used by: ProjectCreateModal, LoglineLab, StageGateChecklist, gsExporter
 *
 * GS = Global Studios Standard (Disney 6-Stage Pipeline)
 * MS = Marionette Studios (script-writer execution engine)
 */

export const CATEGORIES = [
  { id: 'Feature Film',     name: '🎥 Feature Film',       desc: '장편 극영화, 3막 구조 (90-120분)' },
  { id: 'Short Film',       name: '🎬 Short Film',         desc: '단편 영화제 출품용, 실험적 미장센 (5-40분)' },
  { id: 'Netflix Original', name: '📺 Netflix Original',   desc: '시리즈 드라마, 빈지-훅 전략 (8-10 에피소드)' },
  { id: 'Commercial',       name: '💼 Commercial / Ad',    desc: 'USP 중심 광고, A/V Two-Column (15-60초)' },
  { id: 'YouTube',          name: '▶️ YouTube / Creator',  desc: '크리에이터 콘텐츠, 리텐션 최적화 (15초-20분)' },
];

export const GENRES_BY_CATEGORY = {
  'Feature Film': [
    { id: 'Thriller',   name: '🔪 Thriller / Suspense' },
    { id: 'Drama',      name: '🫂 Human Drama' },
    { id: 'Action',     name: '💥 Action / Adventure' },
    { id: 'SF',         name: '🛸 Sci-Fi / Fantasy' },
    { id: 'Crime',      name: '🕵️ Crime / Noir' },
    { id: 'RomCom',     name: '💕 Romance / RomCom' },
  ],
  'Short Film': [
    { id: 'Narrative',    name: '📖 Narrative Drama' },
    { id: 'Experimental', name: '🎨 Experimental / Art' },
    { id: 'Documentary',  name: '📹 Documentary' },
    { id: 'Animation',    name: '✏️ Animation' },
    { id: 'Horror',       name: '👻 Horror / Thriller' },
    { id: 'Comedy',       name: '🤡 Comedy' },
  ],
  'Netflix Original': [
    { id: 'CrimeThriller', name: '🕵️ Crime / Thriller' },
    { id: 'KDrama',        name: '🇰🇷 K-Drama / Romance' },
    { id: 'SciFi',         name: '🚀 Sci-Fi / Dystopia' },
    { id: 'Period',        name: '📜 Period / Sageuk' },
    { id: 'DarkComedy',    name: '🖤 Dark Comedy' },
    { id: 'Procedural',    name: '⚖️ Legal / Procedural' },
  ],
  'Commercial': [
    { id: 'BrandFilm',    name: '✨ Brand Film' },
    { id: 'ProductDemo',  name: '📦 Product Launch' },
    { id: 'Cinematic',    name: '🎥 Cinematic Ad' },
    { id: 'Social',       name: '📱 Social / UGC' },
    { id: 'Performance',  name: '📊 Performance / DTC' },
    { id: 'CSR',          name: '🌍 CSR / Purpose' },
  ],
  'YouTube': [
    { id: 'Documentary',  name: '🎙️ Mini Documentary' },
    { id: 'Educational',  name: '📚 Tutorial / How-to' },
    { id: 'Story',        name: '📖 Narrative Story' },
    { id: 'Comedy',       name: '😂 Sketch / Comedy' },
    { id: 'ShortForm',    name: '📱 Short-form / Shorts' },
    { id: 'Vlog',         name: '🎥 Vlog / Behind-the-Scenes' },
  ],
};

// ─────────────────────────────────────────────────────────────────
// GS (Global Studios Standard) Pipeline Sync
// Disney 6-Stage × 24 Agents — Stage 1: Creative Development
// Reference: global-studios-standard/docs/disney-pipeline-standard.md
// ─────────────────────────────────────────────────────────────────

export const GS_PIPELINE = {
  'Feature Film': {
    stage: 'Stage 1: Creative Development',
    division: 'Div 1',
    agents: ['CINE', 'PREVIS', 'ART_DEPT'],
    deliverables: [
      { id: 'logline',     agent: 'CINE',     sub: 'story_architect',  label: 'Logline',              source: 'logline',       format: 'text' },
      { id: 'synopsis',    agent: 'CINE',     sub: 'story_architect',  label: 'Synopsis (1p/3p)',      source: 'concept',       format: 'pdf' },
      { id: 'treatment',   agent: 'CINE',     sub: 'scene_writer',     label: 'Treatment (15-30p)',    source: 'treatment',     format: 'pdf' },
      { id: 'screenplay',  agent: 'CINE',     sub: 'scene_writer',     label: 'Screenplay Draft',      source: 'scenario',      format: 'pdf' },
      { id: 'coverage',    agent: 'CINE',     sub: 'pitch_master',     label: 'Script Coverage',       source: 'review',        format: 'pdf' },
      { id: 'pitch_deck',  agent: 'CINE',     sub: 'pitch_master',     label: 'Pitch Deck (5p)',       source: null,            format: 'pptx' },
    ],
    gate: 'G1',
    gateChecklist: [
      'Screenplay follows standard format (120p ±10%)',
      'Treatment conveys genre, tone, theme, commercial appeal',
      'Synopsis 1p and 3p versions complete',
      'All deliverables bilingual (KO primary, EN secondary)',
    ],
  },
  'Short Film': {
    stage: 'Stage 1: Creative Development',
    division: 'Div 1',
    agents: ['CINE', 'PREVIS'],
    deliverables: [
      { id: 'logline',     agent: 'CINE',     sub: 'story_architect',  label: 'Logline',              source: 'logline',       format: 'text' },
      { id: 'synopsis',    agent: 'CINE',     sub: 'story_architect',  label: 'Synopsis',              source: 'concept',       format: 'pdf' },
      { id: 'treatment',   agent: 'CINE',     sub: 'scene_writer',     label: 'Treatment',             source: 'treatment',     format: 'pdf' },
      { id: 'screenplay',  agent: 'CINE',     sub: 'scene_writer',     label: 'Screenplay Draft',      source: 'scenario',      format: 'pdf' },
      { id: 'coverage',    agent: 'CINE',     sub: 'pitch_master',     label: 'Script Coverage',       source: 'review',        format: 'pdf' },
    ],
    gate: 'G1',
    gateChecklist: [
      'Screenplay 5-40 pages',
      'Strong single-theme focus',
      'Festival submission readiness',
    ],
  },
  'Netflix Original': {
    stage: 'Stage 1: Creative Development',
    division: 'Div 1',
    agents: ['CINE'],
    deliverables: [
      { id: 'logline',     agent: 'CINE',     sub: 'story_architect',  label: 'Logline',              source: 'logline',       format: 'text' },
      { id: 'bible',       agent: 'CINE',     sub: 'story_architect',  label: 'Series Bible',          source: 'bible',         format: 'pdf' },
      { id: 'episode_arc', agent: 'CINE',     sub: 'story_architect',  label: 'Episode Arc (10ep)',     source: 'episodes',      format: 'pdf' },
      { id: 'teleplay',    agent: 'CINE',     sub: 'scene_writer',     label: 'Pilot Teleplay',        source: 'script',        format: 'pdf' },
      { id: 'coverage',    agent: 'CINE',     sub: 'pitch_master',     label: 'Binge Audit',           source: 'review',        format: 'pdf' },
    ],
    gate: 'G1',
    gateChecklist: [
      'Series Bible has world, characters, season arc',
      'Episode arc covers 8-10 episodes with binge-hooks',
      'Pilot teleplay meets Netflix format standards',
    ],
  },
  'Commercial': {
    stage: 'Stage 1: Creative Development',
    division: 'Div 1',
    agents: ['CINE'],
    deliverables: [
      { id: 'brief',       agent: 'CINE',     sub: 'story_architect',  label: 'Creative Brief',        source: 'concept',       format: 'pdf' },
      { id: 'copy',        agent: 'CINE',     sub: 'scene_writer',     label: 'Copy Deck',             source: 'architecture',  format: 'pdf' },
      { id: 'art_dir',     agent: 'CINE',     sub: 'scene_writer',     label: 'Art Direction',          source: 'treatment',     format: 'pdf' },
      { id: 'av_script',   agent: 'CINE',     sub: 'scene_writer',     label: 'A/V Script',             source: 'scenario',      format: 'pdf' },
      { id: 'storyboard',  agent: 'CINE',     sub: 'pitch_master',     label: 'Storyboard',             source: 'visuals',       format: 'pdf' },
      { id: 'compliance',  agent: 'CINE',     sub: 'pitch_master',     label: 'Brand Compliance',       source: 'review',        format: 'pdf' },
    ],
    gate: 'G1',
    gateChecklist: [
      'Creative brief includes USP, target audience, KPI',
      'A/V script in two-column format',
      'Storyboard minimum 5 key frames',
      'Brand compliance audit passed',
    ],
  },
  'YouTube': {
    stage: 'Stage 1: Creative Development',
    division: 'Div 1',
    agents: ['CINE'],
    deliverables: [
      { id: 'concept',     agent: 'CINE',     sub: 'story_architect',  label: 'Content Brief',          source: 'hook',          format: 'text' },
      { id: 'script',      agent: 'CINE',     sub: 'scene_writer',     label: 'Full Script',            source: 'script',        format: 'pdf' },
      { id: 'post',        agent: 'CINE',     sub: 'scene_writer',     label: 'Edit Cue Sheet',         source: 'edit',          format: 'pdf' },
      { id: 'seo',         agent: 'CINE',     sub: 'pitch_master',     label: 'SEO Package',            source: 'seo',           format: 'pdf' },
    ],
    gate: 'G1',
    gateChecklist: [
      'Hook script under 15 seconds',
      'Script has Pattern Interrupt markers every 2-3 min',
      'SEO package includes 3 title options + 20 tags',
      'Thumbnail concept defined',
    ],
  },
};
