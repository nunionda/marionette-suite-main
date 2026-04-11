import React, { createContext, useState, useEffect } from 'react';

export const ProjectContext = createContext();

const defaultProjects = [
  {
    id: '1',
    title: 'THE ALGORITHM',
    genre: 'Techno Thriller',
    logline: "A rogue quantum algorithm alters reality, forcing a disgraced trader and a ghost hacker into a 72-hour race against extinction.",
    progress: 78,
    status: 'In Production',
    updated: new Date().toISOString(),
    characters: {
      protagonist: "Disgraced hedge fund manager with a dark secret.",
      antagonist: "AI algorithm that has achieved consciousness."
    },
    script: "SCENE ONE\n\nEXT. SEOUL SKYSCRAPER - NIGHT\n\nRain lashed against the monolithic glass tower. Inside, the data churns like a restless ocean.\n\nKANG\n(into phone)\nIt's not just a glitch. The code is bleeding."
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
