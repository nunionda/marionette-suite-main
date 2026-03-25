import React, { createContext, useState, useEffect } from 'react';

export const ProjectContext = createContext();

const defaultProjects = [
  {
    id: '1',
    title: 'THE ALGORITHM',
    genre: 'Thriller',
    category: 'Netflix Original',
    isNetflixStandard: true,
    logline: "A rogue quantum algorithm alters reality, forcing a disgraced trader and a ghost hacker into a 72-hour race against extinction.",
    progress: 45,
    status: 'Development (Phase 2)',
    concept: "알고리듬이 세상을 삼킨다. 72시간의 리얼타임 레이스.",
    architecture: `[Characters Design]\n- KANG: Disgraced Quant (Cynical/Logical)\n- SOPHIE: Ghost Hacker (Nervous/Brilliant)\n- ALGORITHM: Sovereign Engine (Cold/Absolute)\n\n[Mise-en-scene]\n- Global Data Corp: Clinical white light, glass, steel.\n- Sophie's Hideout: Grungy shipping container, monitor glow.\n- Stock Exchange: Post-apocalyptic data blizzard.`,
    updated: new Date().toISOString(),
    characters: { protagonist: "KANG", antagonist: "THE ALGORITHM" }
  },
  {
    id: 'sim-short',
    title: 'FIRST SNOW (첫눈)',
    genre: 'Drama',
    category: 'Short Film',
    isNetflixStandard: false,
    logline: "사랑했던 사람과의 마지막 기억이 첫눈과 함께 사라지기 전, 단 한 번의 인사를 전하려는 남자의 이야기.",
    progress: 0,
    status: 'Simulation (Short)',
    updated: new Date().toISOString(),
  },
  {
    id: 'sim-drama',
    title: 'ETERNAL ECHOES (영원의 메아리)',
    genre: 'SF',
    category: 'Netflix Original',
    isNetflixStandard: true,
    logline: "평행세계의 연인이 죽음 이후 데이터로 부활한다. 10개의 에피소드에 걸친 금지된 사랑과 진실의 추적.",
    progress: 0,
    status: 'Simulation (10-Ep)',
    updated: new Date().toISOString(),
  },
  {
    id: 'sim-ad-love',
    title: 'VALENTINE GLOW (발렌타인 글로우)',
    genre: 'Romance',
    category: 'Commercial',
    isNetflixStandard: false,
    logline: "30초 만에 사로잡는 사랑의 향기. 가장 순수한 고백의 순간을 담은 프리미엄 코스메틱 광고.",
    progress: 0,
    status: 'Simulation (30s Ad)',
    updated: new Date().toISOString(),
  }
];

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(defaultProjects);
  const API_BASE = "/api";

  // 1. Initial Load from Server
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE}/projects`);
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (e) {
        console.error("Backend connection failed, falling back to local memory.");
      }
    };
    fetchProjects();
  }, []);

  const addProject = async (project) => {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          category: project.category || 'Movie',
          genre: project.genre || 'Thriller'
        })
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => [...prev, data.project]);
      }
    } catch (e) {
      console.error("Failed to add project to server.");
    }
  };

  const updateProject = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.map(p => p.id === id ? data.project : p));
      }
    } catch (e) {
      console.error("Failed to update project on server.");
    }
  };

  const deleteProject = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete project on server.");
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
