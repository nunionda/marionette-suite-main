import React, { useState, useContext } from 'react';
import './styles/Theme.css';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import AdProjectDetail from './components/AdProjectDetail';
import DramaProjectDetail from './components/DramaProjectDetail';
import { ProjectProvider, ProjectContext } from './context/ProjectContext';

function AppContent() {
  const { projects } = useContext(ProjectContext);
  const [currentProject, setCurrentProject] = useState(null);

  const handleEnterLab = (id) => {
    const project = projects.find(p => p.id === id);
    setCurrentProject(project);
  };

  const activeProject = projects.find(p => p.id === currentProject?.id) || currentProject;
  const isAd = activeProject?.category === 'Commercial';
  const isDrama = activeProject?.category === 'Netflix Original';

  return (
    <div className="App">
      {!currentProject ? (
        <Dashboard onEnterLab={handleEnterLab} />
      ) : isAd ? (
        <AdProjectDetail 
          project={activeProject} 
          onBack={() => setCurrentProject(null)} 
        />
      ) : isDrama ? (
        <DramaProjectDetail
          project={activeProject}
          onBack={() => setCurrentProject(null)}
        />
      ) : (
        <ProjectDetail 
          project={activeProject} 
          onBack={() => setCurrentProject(null)} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;
