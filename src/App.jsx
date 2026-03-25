import React, { useState, useContext } from 'react';
import './styles/Theme.css';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import AdProjectDetail from './components/AdProjectDetail';
import DramaProjectDetail from './components/DramaProjectDetail';
import { ProjectProvider, ProjectContext } from './context/ProjectContext';

function AppContent() {
  const { projects } = useContext(ProjectContext);
  const [currentProjectId, setCurrentProjectId] = React.useState(() => {
    return localStorage.getItem('lastProjectId') || null;
  });

  const handleEnterLab = (id) => {
    setCurrentProjectId(id);
    localStorage.setItem('lastProjectId', id);
  };

  const activeProject = projects.find(p => p.id === currentProjectId);
  
  const handleBack = () => {
    setCurrentProjectId(null);
    localStorage.removeItem('lastProjectId');
  };
  const isAd = activeProject?.category === 'Commercial';
  const isDrama = activeProject?.category === 'Netflix Original';

  return (
    <div className="App">
      {!activeProject ? (
        <Dashboard onEnterLab={handleEnterLab} />
      ) : isAd ? (
        <AdProjectDetail 
          project={activeProject} 
          onBack={handleBack} 
        />
      ) : isDrama ? (
        <DramaProjectDetail
          project={activeProject}
          onBack={handleBack}
        />
      ) : (
        <ProjectDetail 
          project={activeProject} 
          onBack={handleBack} 
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
