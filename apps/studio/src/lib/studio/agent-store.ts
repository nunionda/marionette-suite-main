import { create } from 'zustand';
import type { AgentWithQueue, QueueItem } from './types';

interface AgentStore {
  agents: AgentWithQueue[];
  selectedAgentId: string | null;
  simulationRunning: boolean;

  init: (agents: AgentWithQueue[]) => void;
  selectAgent: (id: string | null) => void;
  tick: () => void;
  retryItem: (agentId: string, itemId: string) => void;
  moveItem: (agentId: string, itemId: string, direction: 'up' | 'down') => void;
  togglePause: (agentId: string) => void;
  runItem: (agentId: string, itemId: string) => void;
  setSimulationRunning: (running: boolean) => void;
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
  simulationRunning: false,

  init: (agents) => set({ agents }),

  selectAgent: (id) => set({ selectedAgentId: id }),

  setSimulationRunning: (running) => set({ simulationRunning: running }),

  tick: () =>
    set((state) => {
      const updated = state.agents.map((agent) => {
        if (agent.paused) return agent;

        // Agent has a current task being processed
        if (agent.status === 'running' && agent.currentTask) {
          const isError = Math.random() < 0.1;
          const processingItem = agent.queue.find((q) => q.status === 'processing');
          const duration = 1200 + Math.floor(Math.random() * 3000);

          const completedItem: QueueItem | undefined = processingItem
            ? {
                ...processingItem,
                status: isError ? 'error' : 'done',
                durationMs: duration,
                errorMessage: isError ? 'Generation timeout — provider did not respond within 30s' : undefined,
              }
            : undefined;

          const remainingQueue = agent.queue.filter((q) => q.status !== 'processing');
          const newHistory = completedItem
            ? [completedItem, ...agent.history].slice(0, 50)
            : agent.history;

          // Pick next from queue
          const nextItem = remainingQueue.find((q) => q.status === 'pending');
          const nextQueue = nextItem
            ? remainingQueue.map((q) => (q.id === nextItem.id ? { ...q, status: 'processing' as const } : q))
            : remainingQueue;

          const nextTask = nextItem
            ? { sceneSlug: nextItem.sceneSlug, cutSlug: nextItem.cutSlug, displayId: nextItem.displayId }
            : undefined;

          return {
            ...agent,
            status: (nextTask ? 'running' : 'idle') as AgentWithQueue['status'],
            currentTask: nextTask,
            queue: nextQueue,
            history: newHistory,
            stats: {
              processed: agent.stats.processed + (completedItem && !isError ? 1 : 0),
              errors: agent.stats.errors + (isError ? 1 : 0),
              queueSize: nextQueue.filter((q) => q.status === 'pending' || q.status === 'processing').length,
            },
          };
        }

        // Agent is idle but has pending queue items — start processing
        if (agent.status === 'idle' && agent.queue.some((q) => q.status === 'pending')) {
          const nextItem = agent.queue.find((q) => q.status === 'pending')!;
          return {
            ...agent,
            status: 'running' as const,
            currentTask: { sceneSlug: nextItem.sceneSlug, cutSlug: nextItem.cutSlug, displayId: nextItem.displayId },
            queue: agent.queue.map((q) => (q.id === nextItem.id ? { ...q, status: 'processing' as const } : q)),
          };
        }

        // Agent errored — try to recover by picking next item
        if (agent.status === 'error') {
          const pendingItems = agent.queue.filter((q) => q.status === 'pending');
          if (pendingItems.length > 0) {
            const nextItem = pendingItems[0];
            return {
              ...agent,
              status: 'running' as const,
              currentTask: { sceneSlug: nextItem.sceneSlug, cutSlug: nextItem.cutSlug, displayId: nextItem.displayId },
              queue: agent.queue.map((q) => (q.id === nextItem.id ? { ...q, status: 'processing' as const } : q)),
            };
          }
        }

        return agent;
      });

      return { agents: updated };
    }),

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
}));
