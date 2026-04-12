import React, { useState, useContext } from 'react';
import './styles/Theme.css';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import AdProjectDetail from './components/AdProjectDetail';
import DramaProjectDetail from './components/DramaProjectDetail';
import YouTubeProjectDetail from './components/YouTubeProjectDetail';
import ExportRenderView from './components/ExportRenderView';
import SceneDetailView from './components/SceneDetailView';
import { ProjectProvider, ProjectContext } from './context/ProjectContext';

function AppContent() {
  const { projects } = useContext(ProjectContext);
  const [currentProjectId, setCurrentProjectId] = React.useState(() => {
    return localStorage.getItem('lastProjectId') || null;
  });
  const [activeSceneId, setActiveSceneId] = React.useState(null);
  // isSyncing: true only while we're waiting for the first projects load
  // Resolves immediately once projects array is populated (or confirmed empty)
  const [isSyncing, setIsSyncing] = React.useState(true);

  React.useEffect(() => {
    if (projects.length > 0) {
      setIsSyncing(false);
    } else {
      // Backend returned 0 projects OR fetch hasn't completed yet — give a short grace window
      const timer = setTimeout(() => setIsSyncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [projects]);

  // Handle Export Rendering Route
  const path = window.location.pathname;
  if (path.startsWith('/render/project/')) {
    const renderProjectId = path.split('/').pop();
    const renderProject = projects.find(p => String(p.id) === String(renderProjectId));
    if (!renderProject && !isSyncing) {
      return <div style={{ color: "white" }}>Project Not Found for Export</div>;
    }
    if (!renderProject) return null; // wait while syncing
    return <ExportRenderView project={renderProject} />;
  }

  const handleEnterLab = (id) => {
    setCurrentProjectId(id);
    localStorage.setItem('lastProjectId', id);
  };

  const activeProject = projects.find(p => String(p.id) === String(currentProjectId));
  
  const handleBack = () => {
    setCurrentProjectId(null);
    localStorage.removeItem('lastProjectId');
  };
  const isAd = activeProject?.category === 'Commercial';
  const isDrama = activeProject?.category === 'Netflix Original';
  const isYouTube = activeProject?.category === 'YouTube';

  return (
    <div className="App">
      {isSyncing && currentProjectId ? (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: 'var(--accent-primary)', gap: '16px', letterSpacing: '3px', fontSize: '0.8rem' }}>
          <div style={{ width: '32px', height: '32px', border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          RESTORING SESSION...
        </div>
      ) : activeSceneId && activeProject ? (
        <SceneDetailView
          project={activeProject}
          sceneId={activeSceneId}
          onBack={() => setActiveSceneId(null)}
        />
      ) : !activeProject ? (
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
      ) : isYouTube ? (
        <YouTubeProjectDetail
          project={activeProject}
          onBack={handleBack}
        />
      ) : (
        <ProjectDetail
          project={activeProject}
          onBack={handleBack}
          onSceneOpen={(sceneId) => setActiveSceneId(sceneId)}
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
