import React, { useState, useContext } from 'react';
import './styles/Theme.css';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import { ProjectProvider, ProjectContext } from './context/ProjectContext';

function AppContent() {
  const { projects } = useContext(ProjectContext);
  const [currentProject, setCurrentProject] = useState(null);

  const handleEnterLab = (id) => {
    // Make sure we get the freshest data from context when entering
    const project = projects.find(p => p.id === id);
    setCurrentProject(project);
  };

  return (
    <div className="App">
      {!currentProject ? (
        <Dashboard onEnterLab={handleEnterLab} />
      ) : (
        <ProjectDetail 
          project={projects.find(p => p.id === currentProject.id) || currentProject} 
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
