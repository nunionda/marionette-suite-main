import { create } from 'zustand';
import type { Project, SceneMeta } from '@/lib/studio/types';

interface StudioState {
  /* Current context */
  currentProject: Project | null;
  currentScene: SceneMeta | null;

  /* Actions */
  setCurrentProject: (project: Project | null) => void;
  setCurrentScene: (scene: SceneMeta | null) => void;
}

export const useStudioStore = create<StudioState>(set => ({
  currentProject: null,
  currentScene: null,
  setCurrentProject: project => set({ currentProject: project }),
  setCurrentScene: scene => set({ currentScene: scene }),
}));
