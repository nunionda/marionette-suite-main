import type { AgentWithQueue, AgentType, AgentStatus, QueueItem } from './types';
import { makeSceneSlug, makeCutSlug, makeCutDisplayId } from './naming';

interface AgentConfig {
  type: AgentType;
  label: string;
  initialStatus: AgentStatus;
  queueSize: number;
  processed: number;
  errors: number;
}

// Ordered to match pipeline flow: PRE-PRODUCTION → MAIN PRODUCTION → POST-PRODUCTION
// prompt  = Scripter + Cinematographer  (DirectionPlan JSON + prompt refinement)
// image_gen = ConceptArtist + CastingDirector + LocationScout (storyboard / ref images)
// analysis  = Script analysis + image review + quality pick
// video_gen = Previsualizer + Generalist   (video clip generation)
// audio_gen = SoundDesigner + Composer + MixingEngineer (audio pipeline)
const AGENT_CONFIGS: AgentConfig[] = [
  { type: 'prompt',     label: 'Prompt Engine',     initialStatus: 'running', queueSize: 10, processed: 62, errors: 0 },
  { type: 'image_gen',  label: 'Image Generator',   initialStatus: 'running', queueSize: 12, processed: 47, errors: 2 },
  { type: 'analysis',   label: 'Scene Analysis',    initialStatus: 'done',    queueSize: 0,  processed: 89, errors: 3 },
  { type: 'video_gen',  label: 'Video Generator',   initialStatus: 'idle',    queueSize: 8,  processed: 23, errors: 1 },
  { type: 'audio_gen',  label: 'Audio Generator',   initialStatus: 'error',   queueSize: 6,  processed: 31, errors: 5 },
];

function makeQueueItems(
  initials: string,
  count: number,
  startScene: number,
): QueueItem[] {
  return Array.from({ length: count }, (_, i) => {
    const sceneNum = startScene + Math.floor(i / 3);
    const cutNum = (i % 20) + 1;
    const sceneSlug = makeSceneSlug(sceneNum);
    const cutSlug = makeCutSlug(cutNum);
    return {
      id: `q-${sceneSlug}-${cutSlug}-${i}`,
      sceneSlug,
      cutSlug,
      displayId: makeCutDisplayId(initials, sceneNum, cutNum),
      status: 'pending' as const,
    };
  });
}

function makeHistory(initials: string, count: number): QueueItem[] {
  return Array.from({ length: count }, (_, i) => {
    const sceneNum = Math.floor(i / 4) + 1;
    const cutNum = (i % 20) + 1;
    const sceneSlug = makeSceneSlug(sceneNum);
    const cutSlug = makeCutSlug(cutNum);
    const isError = i % 7 === 0;
    return {
      id: `h-${sceneSlug}-${cutSlug}-${i}`,
      sceneSlug,
      cutSlug,
      displayId: makeCutDisplayId(initials, sceneNum, cutNum),
      status: isError ? 'error' as const : 'done' as const,
      durationMs: isError ? undefined : 1200 + Math.floor(Math.random() * 3000),
      errorMessage: isError ? 'Generation timeout — provider did not respond within 30s' : undefined,
    };
  });
}

export function makeMockAgents(projectId: string, initials: string): AgentWithQueue[] {
  return AGENT_CONFIGS.map((cfg, idx) => {
    const queue = makeQueueItems(initials, cfg.queueSize, 3 + idx * 2);
    const history = makeHistory(initials, cfg.processed > 8 ? 8 : cfg.processed);

    // For running agents, set a current task from the first queue item
    const currentTask =
      cfg.initialStatus === 'running' && queue.length > 0
        ? { sceneSlug: queue[0].sceneSlug, cutSlug: queue[0].cutSlug, displayId: queue[0].displayId }
        : cfg.initialStatus === 'error' && queue.length > 0
          ? { sceneSlug: queue[0].sceneSlug, cutSlug: queue[0].cutSlug, displayId: queue[0].displayId }
          : undefined;

    // If running/error, first queue item is processing/error
    if (cfg.initialStatus === 'running' && queue.length > 0) {
      queue[0].status = 'processing';
    }
    if (cfg.initialStatus === 'error' && queue.length > 0) {
      queue[0].status = 'error';
      queue[0].errorMessage = 'Generation failed — model returned invalid output';
    }

    return {
      id: `${projectId}-agent-${cfg.type}`,
      type: cfg.type,
      projectId,
      status: cfg.initialStatus,
      label: cfg.label,
      paused: false,
      currentTask,
      stats: {
        processed: cfg.processed,
        errors: cfg.errors,
        queueSize: cfg.queueSize,
      },
      queue,
      history,
    };
  });
}
