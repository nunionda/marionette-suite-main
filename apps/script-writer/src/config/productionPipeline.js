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

  // ── Phase 2: 세계관 설계 (World Building) ──
  {
    id: 'visual_world',
    label: 'Visual World Design',
    labelKo: '비주얼 세계관 설계',
    agent: 'ART_DEPT',
    sub: 'production_designer',
    description: '전체 영화의 색감, 톤, 시각적 언어 정의',
    inputs: ['screenplay_text', 'location_breakdown'],
    outputs: ['color_palette', 'visual_tone', 'reference_images'],
    phase: 'world_building',
  },
  {
    id: 'character_design',
    label: 'Character Design',
    labelKo: '캐릭터 디자인',
    agent: 'ART_DEPT',
    sub: 'character_designer',
    description: '캐릭터 외형, 표정, 포즈 시트',
    inputs: ['character_network', 'visual_tone'],
    outputs: ['character_sheets'],
    phase: 'world_building',
  },
  {
    id: 'character_arc',
    label: 'Character Development',
    labelKo: '캐릭터 개발',
    agent: 'CINE',
    sub: 'story_architect',
    description: '캐릭터 심리, 동기, 변화 아크',
    inputs: ['character_network', 'scene_list'],
    outputs: ['character_arcs', 'relationship_map'],
    phase: 'world_building',
  },

  // ── Phase 3: 공간/의상/소품 (Physical Design) ──
  {
    id: 'set_design',
    label: 'Set Design',
    labelKo: '세트 디자인',
    agent: 'ART_DEPT',
    sub: 'set_designer',
    description: '주요 로케이션 세트 설계도',
    inputs: ['location_breakdown', 'visual_tone'],
    outputs: ['set_design_docs', 'floor_plans'],
    phase: 'physical_design',
  },
  {
    id: 'set_dressing',
    label: 'Set Dressing',
    labelKo: '세트 드레싱',
    agent: 'ART_DEPT',
    sub: 'set_decorator',
    description: '세트 소품 배치, 분위기 연출 디테일',
    inputs: ['set_design_docs', 'visual_tone'],
    outputs: ['dressing_list', 'atmosphere_notes'],
    phase: 'physical_design',
  },
  {
    id: 'costume_design',
    label: 'Costume Design',
    labelKo: '의상 디자인',
    agent: 'ART_DEPT',
    sub: 'costume_designer',
    description: '캐릭터별 의상, 시대별/씬별 변화',
    inputs: ['character_sheets', 'visual_tone', 'scene_list'],
    outputs: ['costume_bible'],
    phase: 'physical_design',
  },
  {
    id: 'props',
    label: 'Props & Details',
    labelKo: '소품 관리',
    agent: 'ART_DEPT',
    sub: 'property_master',
    description: '핵심 소품 목록, 의미, 연출 계획',
    inputs: ['breakdown_sheet', 'set_design_docs'],
    outputs: ['prop_list'],
    phase: 'physical_design',
  },

  // ── Phase 4: 프리비즈 (Pre-visualization) ──
  {
    id: 'storyboard',
    label: 'Storyboard',
    labelKo: '스토리보드',
    agent: 'PREVIS',
    sub: 'storyboard_descriptor',
    description: '주요 씬 프레임별 구도, 카메라 앵글',
    inputs: ['scene_list', 'set_design_docs', 'character_sheets'],
    outputs: ['storyboard_frames'],
    phase: 'previz',
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

  // ── Phase 5: 통합 문서 (Art Bible) ──
  {
    id: 'art_bible',
    label: 'Art Bible',
    labelKo: '아트 바이블',
    agent: 'ART_DEPT',
    sub: 'art_bible_compiler',
    description: '전체 비주얼 설정 통합 문서',
    inputs: [
      'visual_tone', 'character_sheets', 'set_design_docs',
      'costume_bible', 'prop_list', 'storyboard_frames',
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
    description: 'AI 이미지 생성용 시네마틱 프롬프트',
    nodeType: 'imagePromptNode',
    inputs: ['script_text', 'visual_tone', 'character_sheets'],
    outputs: ['prompt_text'],
    phase: 'image_gen',
  },
  {
    id: 'image_gen',
    label: 'Image Generation',
    labelKo: '이미지 생성',
    description: 'AI 이미지 생성 (Midjourney/DALL-E/Flux)',
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

// ─── 두 트랙의 연결점 (Handoff Points) ───
// Production Design → Video Generation으로 데이터가 흐르는 지점

export const TRACK_HANDOFFS = [
  { from: 'visual_world',     to: 'image_prompt',   data: 'visual_tone',       description: '색감/톤이 이미지 프롬프트에 반영' },
  { from: 'character_design', to: 'image_prompt',   data: 'character_sheets',  description: '캐릭터 시트가 일관된 캐릭터 생성에 사용' },
  { from: 'set_design',       to: 'image_prompt',   data: 'set_design_docs',   description: '세트 디자인이 배경 이미지 생성에 반영' },
  { from: 'costume_design',   to: 'image_prompt',   data: 'costume_bible',     description: '의상 설정이 캐릭터 이미지에 반영' },
  { from: 'storyboard',       to: 'video_prompt',   data: 'storyboard_frames', description: '스토리보드 구도가 카메라 앵글 결정' },
  { from: 'shot_list',        to: 'video_prompt',   data: 'shot_list_xlsx',    description: '샷 리스트가 카메라 무빙 결정' },
];

// ─── Phase 순서 정의 ───

export const DESIGN_PHASES = [
  { id: 'analysis',        label: 'Analysis',        labelKo: '분석',        icon: '🔍', color: '#3b82f6' },
  { id: 'world_building',  label: 'World Building',  labelKo: '세계관 구축', icon: '🌍', color: '#8b5cf6' },
  { id: 'physical_design', label: 'Physical Design',  labelKo: '물리 설계',  icon: '🏗️', color: '#f59e0b' },
  { id: 'previz',          label: 'Pre-Visualization',labelKo: '프리비즈',   icon: '📐', color: '#10b981' },
  { id: 'compilation',     label: 'Art Bible',        labelKo: '통합 문서',  icon: '📕', color: '#ef4444' },
];

export const VIDEO_PHASES = [
  { id: 'scripting',  label: 'Scripting',   labelKo: '스크립트',    icon: '📝', color: '#3b82f6' },
  { id: 'image_gen',  label: 'Image Gen',   labelKo: '이미지 생성', icon: '🖼️', color: '#8b5cf6' },
  { id: 'video_gen',  label: 'Video Gen',   labelKo: '비디오 생성', icon: '🎬', color: '#f59e0b' },
  { id: 'audio',      label: 'Audio',       labelKo: '오디오',      icon: '🔊', color: '#10b981' },
  { id: 'assembly',   label: 'Assembly',    labelKo: '어셈블리',    icon: '✅', color: '#ef4444' },
];

// ─── 카테고리별 활성 노드 ───

export const ACTIVE_NODES_BY_CATEGORY = {
  'Feature Film': {
    design: ['script_analysis', 'production_breakdown', 'visual_world', 'character_design', 'character_arc', 'set_design', 'set_dressing', 'costume_design', 'props', 'storyboard', 'shot_list', 'art_bible'],
    video: ['script_node', 'image_prompt', 'image_gen', 'image_pick', 'video_prompt', 'video_gen', 'audio_gen', 'final_cut'],
  },
  'Short Film': {
    design: ['script_analysis', 'visual_world', 'character_design', 'set_design', 'storyboard', 'art_bible'],
    video: ['script_node', 'image_prompt', 'image_gen', 'image_pick', 'video_prompt', 'video_gen', 'audio_gen', 'final_cut'],
  },
  'Netflix Original': {
    design: ['script_analysis', 'production_breakdown', 'visual_world', 'character_design', 'character_arc', 'set_design', 'set_dressing', 'costume_design', 'props', 'storyboard', 'shot_list', 'art_bible'],
    video: ['script_node', 'image_prompt', 'image_gen', 'image_pick', 'video_prompt', 'video_gen', 'audio_gen', 'final_cut'],
  },
  'Commercial': {
    design: ['script_analysis', 'visual_world', 'set_design', 'storyboard'],
    video: ['script_node', 'image_prompt', 'image_gen', 'image_pick', 'video_prompt', 'video_gen', 'audio_gen', 'final_cut'],
  },
  'YouTube': {
    design: ['script_analysis', 'visual_world', 'storyboard'],
    video: ['script_node', 'image_prompt', 'image_gen', 'image_pick', 'video_prompt', 'video_gen', 'audio_gen', 'final_cut'],
  },
};
