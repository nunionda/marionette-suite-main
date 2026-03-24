import React, { createContext, useState, useEffect } from 'react';

export const ProjectContext = createContext();

const defaultProjects = [
  {
    id: '1',
    title: 'THE ALGORITHM',
    genre: 'Techno Thriller',
    logline: "A rogue quantum algorithm alters reality, forcing a disgraced trader and a ghost hacker into a 72-hour race against extinction.",
    progress: 45,
    status: 'Development (Phase 2)',
    concept: "알고리듬이 세상을 삼킨다. 72시간의 리얼타임 레이스.",
    architecture: `[Characters Design]\n- KANG: Disgraced Quant (Cynical/Logical)\n- SOPHIE: Ghost Hacker (Nervous/Brilliant)\n- ALGORITHM: Sovereign Engine (Cold/Absolute)\n\n[Mise-en-scene]\n- Global Data Corp: Clinical white light, glass, steel.\n- Sophie's Hideout: Grungy shipping container, monitor glow.\n- Stock Exchange: Post-apocalyptic data blizzard.`,
    updated: new Date().toISOString(),
    characters: {
      protagonist: "KANG",
      antagonist: "THE ALGORITHM"
    }
  }
];

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('cinema_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse projects from local storage");
        return defaultProjects;
      }
    }
    return defaultProjects;
  });

  useEffect(() => {
    localStorage.setItem('cinema_projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = (project) => {
    setProjects(prev => [...prev, { 
      ...project, 
      id: Date.now().toString(), 
      progress: 0, 
      status: 'Development',
      updated: new Date().toISOString(),
      characters: { protagonist: '', antagonist: '' },
      script: ''
    }]);
  };

  const updateProject = (id, updates) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updated: new Date().toISOString() } : p
    ));
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
