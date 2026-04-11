import { create } from 'zustand';
import type { AgentWithQueue, QueueItem } from './types';

// Maps backend pipeline step names → agent labels
const STEP_TO_LABEL: Record<string, string> = {
  script_writer: 'Script Writer',
  concept_artist: 'Concept Artist',
  generalist: 'Generalist',
  asset_designer: 'Asset Designer',
  vfx_compositor: 'VFX Compositor',
  master_editor: 'Master Editor',
  sound_designer: 'Sound Designer',
};

interface AgentStore {
  agents: AgentWithQueue[];
  selectedAgentId: string | null;

  init: (agents: AgentWithQueue[]) => void;
  selectAgent: (id: string | null) => void;
  retryItem: (agentId: string, itemId: string) => void;
  moveItem: (agentId: string, itemId: string, direction: 'up' | 'down') => void;
  togglePause: (agentId: string) => void;
  runItem: (agentId: string, itemId: string) => void;
  /** Apply a real-time WS step update to the matching agent */
  applyWsUpdate: (step: string, status: 'running' | 'done' | 'error', durationMs?: number) => void;
  /** Reset all agents to idle when a new pipeline run starts */
  resetForPipeline: () => void;
}

function updateAgent(
  agents: AgentWithQueue[],
  agentId: string,
  updater: (agent: AgentWithQueue) => AgentWithQueue,
): AgentWithQueue[] {
  return agents.map((a) => (a.id === agentId ? updater(a) : a));
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  selectedAgentId: null,

  init: (agents) => set({ agents }),

  selectAgent: (id) => set({ selectedAgentId: id }),

  retryItem: (agentId, itemId) =>
    set((state) => ({
      agents: updateAgent(state.agents, agentId, (agent) => {
        // Move item from history back to queue as pending
        const item = agent.history.find((h) => h.id === itemId);
        if (!item) return agent;
        return {
          ...agent,
          history: agent.history.filter((h) => h.id !== itemId),
          queue: [...agent.queue, { ...item, status: 'pending' as const, errorMessage: undefined, durationMs: undefined }],
          stats: { ...agent.stats, queueSize: agent.stats.queueSize + 1 },
        };
      }),
    })),

  moveItem: (agentId, itemId, direction) =>
    set((state) => ({
      agents: updateAgent(state.agents, agentId, (agent) => {
        const pendingItems = agent.queue.filter((q) => q.status === 'pending');
        const nonPending = agent.queue.filter((q) => q.status !== 'pending');
        const idx = pendingItems.findIndex((q) => q.id === itemId);
        if (idx === -1) return agent;

        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= pendingItems.length) return agent;

        const reordered = [...pendingItems];
        [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];

        return { ...agent, queue: [...nonPending, ...reordered] };
      }),
    })),

  togglePause: (agentId) =>
    set((state) => ({
      agents: updateAgent(state.agents, agentId, (agent) => ({
        ...agent,
        paused: !agent.paused,
      })),
    })),

  runItem: (agentId, itemId) =>
    set((state) => ({
      agents: updateAgent(state.agents, agentId, (agent) => {
        const item = agent.queue.find((q) => q.id === itemId && q.status === 'pending');
        if (!item) return agent;

        // Move this item to processing position (it will be picked up on next tick)
        const withoutItem = agent.queue.filter((q) => q.id !== itemId);
        const processing = agent.queue.find((q) => q.status === 'processing');

        if (processing) {
          // Already processing something — put this item first in pending
          return {
            ...agent,
            queue: [processing, { ...item, status: 'pending' as const }, ...withoutItem.filter((q) => q.id !== processing.id)],
          };
        }

        // Nothing processing — start this item immediately
        return {
          ...agent,
          status: 'running' as const,
          currentTask: { sceneSlug: item.sceneSlug, cutSlug: item.cutSlug, displayId: item.displayId },
          queue: [{ ...item, status: 'processing' as const }, ...withoutItem],
        };
      }),
    })),

  applyWsUpdate: (step, status, durationMs) =>
    set((state) => {
      const label = STEP_TO_LABEL[step] ?? step.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        agents: state.agents.map((agent) => {
          if (agent.label !== label) return agent;
          if (status === 'running') {
            return { ...agent, status: 'running' as const };
          }
          if (status === 'done') {
            const historyItem: QueueItem = {
              id: `ws-${step}-done`,
              sceneSlug: 'sc001',
              cutSlug: 'cut001',
              displayId: `${step}/done`,
              status: 'done' as const,
              durationMs,
            };
            return {
              ...agent,
              status: 'done' as const,
              currentTask: undefined,
              stats: { ...agent.stats, processed: agent.stats.processed + 1 },
              history: [historyItem, ...agent.history].slice(0, 50),
            };
          }
          if (status === 'error') {
            return { ...agent, status: 'error' as const, currentTask: undefined };
          }
          return agent;
        }),
      };
    }),

  resetForPipeline: () =>
    set((state) => ({
      agents: state.agents.map((agent) => ({
        ...agent,
        status: 'idle' as const,
        currentTask: undefined,
        queue: [],
        history: [],
        stats: { processed: 0, errors: 0, queueSize: 0 },
      })),
    })),
}));
