/* ─── Project ─── */
export type ProjectStatus = 'development' | 'production' | 'post';

export interface Project {
  id: string;
  initials: string;         // 'TDK' — naming convention prefix
  title: string;
  titleKo?: string;
  status: ProjectStatus;
  posterUrl: string;
  totalScenes: number;
  completedScenes: number;
  totalCuts: number;
  completedCuts: number;
  createdAt: string;        // ISO 8601
  direction_plan_json?: unknown; // FastAPI field: scene plan from Script Writer agent
}

/* ─── Sequence ─── */
export interface Sequence {
  id: string;
  number: number;
  title: string;
  projectId: string;
  sceneCount: number;
  completedSceneCount: number;
}

/* ─── Scene ─── */
export type SceneStatus = 'pending' | 'in_progress' | 'done';

export interface SceneMeta {
  id: string;
  slug: string;             // 'sc001'
  displayId: string;        // 'TDK_sc001'
  number: number;
  sequenceId: string;
  title: string;
  location: string;
  timeOfDay: string;
  summary: string;
  coverImageUrl: string;    // 'TDK_sc001_cover.jpg'
  cutCount: number;
  completedCutCount: number;
  status: SceneStatus;
}

export interface SceneDetail extends SceneMeta {
  synopsis?: string;
  characters: string[];
  durationSeconds: number;
  cuts: CutMeta[];
}

/* ─── Cut ─── */
export type CutStatus = 'pending' | 'generating' | 'done' | 'approved';

export interface CutMeta {
  id: string;
  slug: string;             // 'cut001'
  displayId: string;        // 'TDK_sc001_cut001'
  number: number;
  sceneId: string;
  duration: 3 | 4 | 5;     // seconds
  status: CutStatus;
  thumbnailUrl?: string;
  description?: string;
}

/* ─── Asset ─── */
export type AssetType = 'image' | 'video' | 'audio';

export interface Asset {
  id: string;
  cutId: string;
  type: AssetType;
  filename: string;         // 'TDK_sc001_cut001_img001.jpg'
  url: string;
  version: number;
  provider: string;
  approved: boolean;
}

/* ─── Agent ─── */
export type AgentType = 'image_gen' | 'video_gen' | 'audio_gen' | 'prompt' | 'analysis';
export type AgentStatus = 'idle' | 'running' | 'done' | 'error';

export interface AgentCurrentTask {
  sceneSlug: string;
  cutSlug: string;
  displayId: string;
}

export interface Agent {
  id: string;
  type: AgentType;
  projectId: string;
  status: AgentStatus;
  currentTask?: AgentCurrentTask;
  stats: {
    processed: number;
    errors: number;
    queueSize: number;
  };
}

/* ─── Queue ─── */
export type QueueItemStatus = 'pending' | 'processing' | 'done' | 'error';

export interface QueueItem {
  id: string;
  sceneSlug: string;
  cutSlug: string;
  displayId: string;
  status: QueueItemStatus;
  errorMessage?: string;
  durationMs?: number;
  audioUrl?: string;           // WAV preview URL (audio_gen agent)
  speaker?: string;            // 화자 이름 (multi-speaker TTS)
}

export interface AgentWithQueue extends Agent {
  label: string;
  paused: boolean;
  queue: QueueItem[];
  history: QueueItem[];
}

/* ─── API responses ─── */
export interface ProjectListResponse {
  projects: Project[];
}

export interface SceneListResponse {
  scenes: SceneMeta[];
  sequences: Sequence[];
  totalCount: number;
}
