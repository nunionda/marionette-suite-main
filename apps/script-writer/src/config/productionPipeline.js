/**
 * Production Pipeline Definition
 *
 * 시나리오 분석 이후 두 갈래로 분기:
 *   Track A: Production Design (기획/프리프로덕션)
 *   Track B: Video Generation (영상 생성/프로덕션)
 *
 * 두 트랙은 병렬 실행 가능하나, 의존성이 있는 노드는 순차 실행.
 *
 * Reference:
 *   - cine-analysis-system: ScriptElement[], CharacterNetwork, ProductionBreakdown
 *   - studio: CutNodeEditor (ReactFlow 8-node pipeline)
 *   - global-studios-standard: Disney 6-Stage, CINE/PREVIS/ART_DEPT agents
 */

// ─── Track A: Production Design (프로덕션 디자인) ───
// GS Agents: ART_DEPT (6 sub-agents) + PREVIS (3 sub-agents) + CASTING
// 시나리오 분석 결과를 기반으로 시각적 세계관을 구축하는 트랙

export const PRODUCTION_DESIGN_NODES = [
  // ── Phase 1: 분석 (Analysis) ──
  {
    id: 'script_analysis',
    label: 'Script Analysis',
    labelKo: '시나리오 분석',
    agent: 'CINE',
    sub: 'story_architect',
    description: '씬/캐릭터/로케이션 구조 파싱',
    inputs: ['screenplay_text'],
    outputs: ['scene_list', 'character_network', 'location_breakdown'],
    source: 'cine-analysis-system',
    modules: ['parseFountain', 'CharacterAnalyzer', 'ProductionAnalyzer'],
    phase: 'analysis',
  },
  {
    id: 'production_breakdown',
    label: 'Production Breakdown',
    labelKo: '제작 분석표',
    agent: 'PREVIS',
    sub: 'scene_breakdown_analyzer',
    description: '씬별 기술 요소 분석 (캐스트, 로케이션, VFX, 소품)',
    inputs: ['scene_list', 'character_network'],
    outputs: ['breakdown_sheet', 'vfx_requirements', 'budget_estimate'],
    source: 'cine-analysis-system',
    modules: ['ProductionAnalyzer', 'VFXEstimator', 'BudgetEstimator'],
    phase: 'analysis',
  },
  {
    id: 'character_arc',
    label: 'Character Development',
    labelKo: '캐릭터 개발',
    agent: 'CINE',
    sub: 'story_architect',
    description: '캐릭터 심리, 동기, 변화 아크 — 시나리오 분석 단계에서 캐릭터 내면을 정의',
    inputs: ['character_network', 'scene_list'],
    outputs: ['character_arcs', 'relationship_map'],
    phase: 'analysis',
  },

  // ── Phase 2: 세계관 설계 (World Building) ──
  {
    id: 'lookbook',
    label: 'Lookbook / Mood Board',
    labelKo: '룩북 / 무드보드',
    agent: 'ART_DEPT',
    sub: 'production_designer',
    description: '감독+DP+PD 비전 공유 문서: 참조 이미지, 톤, 색감, 조명, 질감 무드보드 (투자자/팀 프레젠테이션용)',
    inputs: ['screenplay_text', 'location_breakdown'],
    outputs: ['lookbook_doc', 'mood_board_images', 'tone_references'],
    phase: 'world_building',
    quality: 'concept',
  },
  {
    id: 'visual_world',
    label: 'Visual World Design',
    labelKo: '비주얼 세계관 설계',
    agent: 'ART_DEPT',
    sub: 'production_designer',
    description: '전체 영화의 색감, 톤, 시각적 언어 정의 — PD가 감독 비전을 시각적 체계로 변환',
    inputs: ['screenplay_text', 'location_breakdown', 'lookbook_doc'],
    outputs: ['color_palette', 'visual_tone', 'reference_images'],
    phase: 'world_building',
  },
  {
    id: 'color_script',
    label: 'Color Script',
    labelKo: '컬러 스크립트',
    agent: 'ART_DEPT',
    sub: 'concept_artist',
    description: '씬별 감정-색감 변화를 시각화하는 컬러 스크립트 (Pixar 방식) — 전체 영화의 감정 흐름을 색으로 매핑',
    inputs: ['scene_list', 'visual_tone', 'color_palette'],
    outputs: ['color_script_frames', 'emotional_color_map'],
    phase: 'world_building',
    quality: 'concept',
  },
  {
    id: 'character_design',
    label: 'Character Design',
    labelKo: '캐릭터 디자인',
    agent: 'ART_DEPT',
    sub: 'character_designer',
    description: '컨셉 아티스트: 캐릭터 외형/표정/포즈 시트 (Iain McCaig, Ralph McQuarrie 등)',
    inputs: ['character_network', 'visual_tone'],
    outputs: ['character_sheets'],
    phase: 'world_building',
    quality: 'concept',
    referenceArtists: ['Iain McCaig', 'Ralph McQuarrie', 'Moebius', 'Neville Page'],
  },

  // ── Phase 3: 공간/의상/소품 (Physical Design) ──
  {
    id: 'set_design',
    label: 'Set Design',
    labelKo: '세트 디자인',
    agent: 'ART_DEPT',
    sub: 'set_designer',
    description: '주요 로케이션 세트 설계 — 도면(평면도/입면도) + 컨셉 아트 (Ken Adam, Nathan Crowley 등)',
    inputs: ['location_breakdown', 'visual_tone'],
    outputs: ['set_design_docs', 'floor_plans'],
    phase: 'physical_design',
    quality: 'concept',
    referenceArtists: ['Ken Adam', 'Nathan Crowley', 'Rick Carter', 'Hannah Beachler'],
  },
  {
    id: 'set_dressing',
    label: 'Set Dressing',
    labelKo: '세트 드레싱',
    agent: 'ART_DEPT',
    sub: 'set_decorator',
    description: 'Set Decorator: 가구/소품 배치, 분위기 연출 디테일 — 세트에 생명을 불어넣는 과정',
    inputs: ['set_design_docs', 'visual_tone'],
    outputs: ['dressing_list', 'atmosphere_notes'],
    phase: 'physical_design',
    quality: 'concept',
  },
  {
    id: 'costume_design',
    label: 'Costume Design',
    labelKo: '의상 디자인',
    agent: 'ART_DEPT',
    sub: 'costume_designer',
    description: '캐릭터별 의상 바이블 — 직물/색상/실루엣 + 씬별 의상 변화 (Colleen Atwood, Ruth E. Carter 등)',
    inputs: ['character_sheets', 'visual_tone', 'scene_list'],
    outputs: ['costume_bible'],
    phase: 'physical_design',
    quality: 'concept',
    referenceArtists: ['Colleen Atwood', 'Ruth E. Carter', 'Sandy Powell', 'Eiko Ishioka'],
  },
  {
    id: 'makeup_hair',
    label: 'Makeup & Hair Design',
    labelKo: '분장/헤어 디자인',
    agent: 'ART_DEPT',
    sub: 'makeup_designer',
    description: '캐릭터별 분장/헤어 디자인 시트 — 특수분장, 에이징, 상처/문신 등 (Rick Baker, Kazuhiro Tsuji 등)',
    inputs: ['character_sheets', 'costume_bible'],
    outputs: ['makeup_design_sheets', 'prosthetics_specs'],
    phase: 'physical_design',
    quality: 'concept',
    referenceArtists: ['Rick Baker', 'Kazuhiro Tsuji', 'Ve Neill', 'Greg Nicotero'],
  },
  {
    id: 'props',
    label: 'Props & Details',
    labelKo: '소품 관리',
    agent: 'ART_DEPT',
    sub: 'property_master',
    description: 'Property Master: 핵심 소품 디자인 + 제작/구매/관리 (Daniel Simon, Annie Atkins 등)',
    inputs: ['breakdown_sheet', 'set_design_docs'],
    outputs: ['prop_list'],
    phase: 'physical_design',
    quality: 'concept',
    referenceArtists: ['Daniel Simon', 'Annie Atkins', 'Roger Christian', 'Phil Saunders'],
  },
  {
    id: 'graphic_design',
    label: 'Graphic Design',
    labelKo: '그래픽 디자인',
    agent: 'ART_DEPT',
    sub: 'graphic_artist',
    description: '작품 내 등장하는 신문/포스터/간판/로고/편지/디지털UI 등 그래픽 프랍 디자인 (Annie Atkins 등)',
    inputs: ['scene_list', 'visual_tone', 'set_design_docs'],
    outputs: ['graphic_props', 'signage_designs'],
    phase: 'physical_design',
    quality: 'concept',
    referenceArtists: ['Annie Atkins', 'Miraphora Mina', 'Eduardo Lima'],
  },

  // ── Phase 4: 프리비즈 (Pre-visualization) ──
  {
    id: 'storyboard',
    label: 'Storyboard',
    labelKo: '스토리보드',
    agent: 'PREVIS',
    sub: 'storyboard_descriptor',
    description: '기획 컨셉: 10 Masters 스타일 프레임별 구도 (봉준호, 리들리 스콧 등)',
    inputs: ['scene_list', 'set_design_docs', 'character_sheets'],
    outputs: ['storyboard_frames'],
    phase: 'previz',
    quality: 'concept',
    referenceArtists: ['Bong Joon-ho', 'Ridley Scott', 'Akira Kurosawa', 'Hayao Miyazaki'],
  },
  {
    id: 'shot_list',
    label: 'Shot List',
    labelKo: '샷 리스트',
    agent: 'PREVIS',
    sub: 'shot_list_generator',
    description: '씬별 카메라 샷 목록 (앵글, 렌즈, 무빙)',
    inputs: ['storyboard_frames', 'scene_list'],
    outputs: ['shot_list_xlsx'],
    phase: 'previz',
  },
  // Sprint 3 — Charter #24.10
  {
    id: 'lighting_design',
    label: 'Lighting Design',
    labelKo: '조명 디자인',
    agent: 'ART_DEPT',
    sub: 'gaffer_dp',
    description: '씬별 조명 계획 — 조명 방향/색온도/강도/장비 리스트 (Roger Deakins, Hoyte van Hoytema 스타일)',
    inputs: ['visual_tone', 'set_design_docs', 'storyboard_frames', 'color_script_frames'],
    outputs: ['lighting_plan', 'lighting_diagrams'],
    phase: 'previz',
    quality: 'concept',
    charter: '#24.10',
    referenceArtists: ['Roger Deakins', 'Hoyte van Hoytema', 'Emmanuel Lubezki', 'Bradford Young'],
  },
  // Sprint 3 — Charter #28
  {
    id: 'vfx_previs',
    label: 'VFX Previs',
    labelKo: 'VFX 프리비즈',
    agent: 'PREVIS',
    sub: 'vfx_supervisor',
    description: 'VFX 씬 프리비즈 — 합성/CG/환경확장/시뮬레이션 샷 분석 (ILM/Weta 스타일)',
    inputs: ['vfx_requirements', 'storyboard_frames', 'set_design_docs'],
    outputs: ['vfx_previs_shots', 'vfx_breakdown'],
    phase: 'previz',
    quality: 'concept',
    charter: '#28',
    referenceArtists: ['ILM', 'Weta Digital', 'DNEG', 'Framestore'],
  },

  // ── Phase 5: 통합 문서 (Art Bible) ──
  {
    id: 'art_bible',
    label: 'Art Bible',
    labelKo: '아트 바이블',
    agent: 'ART_DEPT',
    sub: 'art_bible_compiler',
    description: '전체 비주얼 설정 통합 문서',
    inputs: [
      'lookbook_doc', 'visual_tone', 'color_script_frames',
      'character_sheets', 'set_design_docs', 'costume_bible',
      'makeup_design_sheets', 'prop_list', 'graphic_props',
      'storyboard_frames',
    ],
    outputs: ['art_bible_doc'],
    phase: 'compilation',
  },
];

// ─── Track B: Video Generation (영상 생성) ───
// Studio CutNodeEditor의 8-node 파이프라인을 씬/컷 단위로 실행
// 각 컷이 독립적인 노드 플로우를 가짐

export const VIDEO_GENERATION_NODES = [
  // Per-cut pipeline (studio CutNodeEditor)
  {
    id: 'script_node',
    label: 'Script',
    labelKo: '스크립트',
    description: '컷별 대사/액션 텍스트',
    nodeType: 'scriptNode',
    inputs: ['cut_description'],
    outputs: ['script_text'],
    phase: 'scripting',
  },
  {
    id: 'image_prompt',
    label: 'Image Prompt',
    labelKo: '이미지 프롬프트',
    description: '포토리얼리스틱 시네마틱 프롬프트 (Track A 컨셉 아트 참고)',
    nodeType: 'imagePromptNode',
    inputs: ['script_text', 'visual_tone', 'character_sheets', 'concept_art_ref'],
    outputs: ['prompt_text'],
    phase: 'image_gen',
    note: 'Track A 컨셉 아트를 img2img 참고로 활용하여 일관된 캐릭터/배경 유지',
  },
  {
    id: 'image_gen',
    label: 'Image Generation',
    labelKo: '이미지 생성',
    description: '영화 퀄리티 포토리얼리스틱 이미지 (FLUX/DALL-E)',
    nodeType: 'imageGenNode',
    inputs: ['prompt_text'],
    outputs: ['image_candidates'],
    phase: 'image_gen',
  },
  {
    id: 'image_pick',
    label: 'Image Selection',
    labelKo: '이미지 선택',
    description: '생성된 이미지 중 최적 선택',
    nodeType: 'imagePickNode',
    inputs: ['image_candidates'],
    outputs: ['selected_image'],
    phase: 'image_gen',
  },
  {
    id: 'video_prompt',
    label: 'Video Prompt',
    labelKo: '비디오 프롬프트',
    description: '카메라 무빙, 비디오 생성 프롬프트',
    nodeType: 'videoPromptNode',
    inputs: ['selected_image', 'shot_list_xlsx'],
    outputs: ['video_prompt_text'],
    phase: 'video_gen',
  },
  {
    id: 'video_gen',
    label: 'Video Generation',
    labelKo: '비디오 생성',
    description: 'AI 비디오 생성 (Runway/Kling/Sora)',
    nodeType: 'videoGenNode',
    inputs: ['video_prompt_text'],
    outputs: ['video_clip'],
    phase: 'video_gen',
  },
  {
    id: 'audio_gen',
    label: 'Audio / TTS',
    labelKo: '오디오/나레이션',
    description: '대사 TTS + BGM + SFX',
    nodeType: 'audioNode',
    inputs: ['script_text'],
    outputs: ['audio_track'],
    phase: 'audio',
  },
  {
    id: 'final_cut',
    label: 'Final Cut',
    labelKo: '최종 컷',
    description: '비디오 + 오디오 합성, 승인',
    nodeType: 'finalCutNode',
    inputs: ['video_clip', 'audio_track'],
    outputs: ['approved_cut'],
    phase: 'assembly',
  },
];

// ─── Track C: Post-production Audio (Charter #49, #51, #52) ───
// Sprint 6 [AI-AUD]: structured spec-document nodes. Produces JSON plans
// that an audio engineer or external AI tool (Coqui/Bark/Suno/MusicGen)
// consumes. No server-side audio synthesis.
export const AUDIO_POST_NODES = [
  {
    id: 'adr_dubbing',
    label: 'ADR / Dubbing',
    labelKo: '후시녹음·더빙',
    agent: 'POST_SOUND',
    sub: 'adr_supervisor',
    description: '재녹음 필요 라인 파악 + lip-sync/우선순위/감정 태그 + 국제 더빙 타겟',
    inputs: ['scene_list', 'script_text'],
    outputs: ['adr_plan'],
    phase: 'audio',
    quality: 'spec',
    charter: '#49',
  },
  {
    id: 'foley',
    label: 'Foley',
    labelKo: '폴리',
    agent: 'POST_SOUND',
    sub: 'foley_supervisor',
    description: '씬별 Foley 큐 시트 (발걸음/의상/소품/특수음)',
    inputs: ['scene_list', 'storyboard_frames'],
    outputs: ['foley_cue_sheet'],
    phase: 'audio',
    quality: 'spec',
    charter: '#51',
  },
  {
    id: 'music_composition',
    label: 'Music Composition',
    labelKo: '음악 작곡',
    agent: 'POST_SOUND',
    sub: 'composer',
    description: '테마 정의 + 큐 시트 + 인스트루멘테이션 + 레퍼런스 스코어',
    inputs: ['scene_list', 'character_arcs', 'emotional_color_map'],
    outputs: ['score_brief', 'cue_sheet'],
    phase: 'audio',
    quality: 'spec',
    charter: '#52',
  },
];

// ─── 두 트랙의 연결점 (Handoff Points) ───
// Production Design → Video Generation으로 데이터가 흐르는 지점

// ─── 두 트랙의 연결점 (Handoff Points) ───
// Track A (컨셉 아트, concept quality) → Track B (포토리얼리스틱, production quality)
// 컨셉 아트는 img2img 참고 이미지 또는 프롬프트 컨텍스트로 활용

export const TRACK_HANDOFFS = [
  { from: 'visual_world',     to: 'image_prompt',   data: 'visual_tone',       description: '색감/톤 → 포토리얼 프롬프트에 반영',       qualityShift: 'concept → production' },
  { from: 'color_script',     to: 'image_prompt',   data: 'emotional_color_map', description: '씬별 컬러 스크립트 → 이미지 색감 결정',   qualityShift: 'concept → production' },
  { from: 'character_design', to: 'image_prompt',   data: 'character_sheets',  description: '컨셉 캐릭터 시트 → img2img 참고로 활용',  qualityShift: 'concept → production' },
  { from: 'set_design',       to: 'image_prompt',   data: 'set_design_docs',   description: '컨셉 세트 디자인 → 배경 이미지 생성 참고', qualityShift: 'concept → production' },
  { from: 'costume_design',   to: 'image_prompt',   data: 'costume_bible',     description: '컨셉 의상 바이블 → 캐릭터 의상에 반영',    qualityShift: 'concept → production' },
  { from: 'makeup_hair',      to: 'image_prompt',   data: 'makeup_design_sheets', description: '분장/헤어 디자인 → 캐릭터 외형에 반영', qualityShift: 'concept → production' },
  { from: 'graphic_design',   to: 'image_prompt',   data: 'graphic_props',     description: '그래픽 프랍 → 세트 내 디테일에 반영',       qualityShift: 'concept → production' },
  { from: 'storyboard',       to: 'video_prompt',   data: 'storyboard_frames', description: '스토리보드 구도 → 카메라 앵글/무빙 결정',   qualityShift: 'concept → production' },
  { from: 'shot_list',        to: 'video_prompt',   data: 'shot_list_xlsx',    description: '샷 리스트 → 카메라 무빙/렌즈 결정',        qualityShift: 'direct' },
  { from: 'lighting_design', to: 'image_prompt',   data: 'lighting_plan',     description: '조명 계획 → 이미지 광원/색온도 반영',       qualityShift: 'concept → production' },
  { from: 'vfx_previs',      to: 'video_prompt',   data: 'vfx_breakdown',     description: 'VFX 브레이크다운 → 합성 샷 생성 시 참고',   qualityShift: 'concept → production' },
];

// ─── Phase 순서 정의 ───

export const DESIGN_PHASES = [
  { id: 'analysis',        label: 'Analysis',        labelKo: '분석',        icon: '🔍', color: 'var(--gold)' },
  { id: 'world_building',  label: 'World Building',  labelKo: '세계관 구축', icon: '🌍', color: 'var(--gold)' },
  { id: 'physical_design', label: 'Physical Design',  labelKo: '물리 설계',  icon: '🏗️', color: 'var(--gold)' },
  { id: 'previz',          label: 'Pre-Visualization',labelKo: '프리비즈',   icon: '📐', color: 'var(--gold)' },
  { id: 'compilation',     label: 'Art Bible',        labelKo: '통합 문서',  icon: '📕', color: 'var(--gold)' },
];

export const VIDEO_PHASES = [
  { id: 'scripting',  label: 'Scripting',   labelKo: '스크립트',    icon: '📝', color: 'var(--gold-dim)' },
  { id: 'image_gen',  label: 'Image Gen',   labelKo: '이미지 생성', icon: '🖼️', color: 'var(--gold-dim)' },
  { id: 'video_gen',  label: 'Video Gen',   labelKo: '비디오 생성', icon: '🎬', color: 'var(--gold-dim)' },
  { id: 'audio',      label: 'Audio',       labelKo: '오디오',      icon: '🔊', color: 'var(--gold-dim)' },
  { id: 'assembly',   label: 'Assembly',    labelKo: '어셈블리',    icon: '✅', color: 'var(--gold-dim)' },
];

// Charter [AI-AUD] Post-production audio phases (Sprint 6 nodes slot here)
export const AUDIO_POST_PHASES = [
  { id: 'audio', label: 'Post Sound', labelKo: '포스트 사운드', icon: '🎙️', color: 'var(--gold-dim)' },
];

// ─── 카테고리별 활성 노드 ───

export const ACTIVE_NODES_BY_CATEGORY = {
  'Feature Film': {
    design: ['script_analysis', 'production_breakdown', 'lookbook', 'visual_world', 'color_script', 'character_design', 'character_arc', 'set_design', 'set_dressing', 'costume_design', 'makeup_hair', 'props', 'graphic_design', 'storyboard', 'shot_list', 'lighting_design', 'vfx_previs', 'art_bible'],
    video: ['script_node', 'image_prompt', 'image_gen', 'image_pick', 'video_prompt', 'video_gen', 'audio_gen', 'final_cut'],
  },
  'Short Film': {
    design: ['script_analysis', 'lookbook', 'visual_world', 'character_design', 'set_design', 'costume_design', 'storyboard', 'art_bible'],
    video: ['script_node', 'image_prompt', 'image_gen', 'image_pick', 'video_prompt', 'video_gen', 'audio_gen', 'final_cut'],
  },
  'Netflix Original': {
    design: ['script_analysis', 'production_breakdown', 'lookbook', 'visual_world', 'color_script', 'character_design', 'character_arc', 'set_design', 'set_dressing', 'costume_design', 'makeup_hair', 'props', 'graphic_design', 'storyboard', 'shot_list', 'lighting_design', 'vfx_previs', 'art_bible'],
    video: ['script_node', 'image_prompt', 'image_gen', 'image_pick', 'video_prompt', 'video_gen', 'audio_gen', 'final_cut'],
  },
  'Commercial': {
    design: ['script_analysis', 'lookbook', 'visual_world', 'set_design', 'costume_design', 'storyboard'],
    video: ['script_node', 'image_prompt', 'image_gen', 'image_pick', 'video_prompt', 'video_gen', 'audio_gen', 'final_cut'],
  },
  'YouTube': {
    design: ['script_analysis', 'visual_world', 'storyboard'],
    video: ['script_node', 'image_prompt', 'image_gen', 'image_pick', 'video_prompt', 'video_gen', 'audio_gen', 'final_cut'],
  },
};
