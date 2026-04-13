import React, { useState, useContext } from 'react';
import './styles/Theme.css';
import Dashboard from './components/Dashboard';
import ProjectHub from './components/ProjectHub';
import WritingRoom from './components/WritingRoom';
import ProductionDeck from './components/ProductionDeck';
import ProjectDetail from './components/ProjectDetail';
import AdProjectDetail from './components/AdProjectDetail';
import DramaProjectDetail from './components/DramaProjectDetail';
import YouTubeProjectDetail from './components/YouTubeProjectDetail';
import ExportRenderView from './components/ExportRenderView';
import { ProjectProvider, ProjectContext } from './context/ProjectContext';

/**
 * App routing — state-based page navigation.
 *
 * Flow:
 *   Dashboard → ProjectHub (phase overview)
 *                ├── WritingRoom (screenplay development, 5 steps)
 *                ├── ProductionDeck (scene/cut management + pipeline)
 *                └── ProjectDetail (legacy flat view, for Ad/Drama/YouTube)
 *
 * Feature Film / Short Film projects use the new hub+sub-page flow.
 * Other categories (Ad, Drama, YouTube) keep their existing detail views.
 */

function AppContent() {
  const { projects } = useContext(ProjectContext);
  const [currentProjectId, setCurrentProjectId] = React.useState(() => {
    return localStorage.getItem('lastProjectId') || null;
  });
  // Sub-page navigation: null = hub, 'writing' = WritingRoom, 'production' = ProductionDeck, 'pipeline' = ProductionDeck(pipeline), 'legacy' = old ProjectDetail
  const [subPage, setSubPage] = useState(null);
  const [subPageParam, setSubPageParam] = useState(null); // e.g. initial step key
  const [isSyncing, setIsSyncing] = React.useState(true);

  React.useEffect(() => {
    // Check if we can find the saved project in the current project list
    if (currentProjectId) {
      const found = projects.find(p => String(p.id) === String(currentProjectId));
      if (found) {
        setIsSyncing(false);
      }
      // else: keep syncing until found or timeout
    } else {
      if (projects.length > 0) setIsSyncing(false);
    }
  }, [projects, currentProjectId]);

  // Safety timeout — always stop syncing after 3s
  React.useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Handle Export Rendering Route
  const path = window.location.pathname;
  if (path.startsWith('/render/project/')) {
    const renderProjectId = path.split('/').pop();
    const renderProject = projects.find(p => String(p.id) === String(renderProjectId));
    if (!renderProject && !isSyncing) {
      return <div style={{ color: "white" }}>Project Not Found for Export</div>;
    }
    if (!renderProject) return null;
    return <ExportRenderView project={renderProject} />;
  }

  const handleEnterLab = (id) => {
    setCurrentProjectId(id);
    setSubPage(null);
    setSubPageParam(null);
    localStorage.setItem('lastProjectId', id);
  };

  const activeProject = projects.find(p => String(p.id) === String(currentProjectId));

  const handleBack = () => {
    setCurrentProjectId(null);
    setSubPage(null);
    setSubPageParam(null);
    localStorage.removeItem('lastProjectId');
  };

  const handleBackToHub = () => {
    setSubPage(null);
    setSubPageParam(null);
  };

  const handleNavigate = (page, param) => {
    setSubPage(page);
    setSubPageParam(param || null);
  };

  // All categories now use the Hub flow
  const useNewFlow = !!activeProject;

  return (
    <div className="App">
      {isSyncing && currentProjectId ? (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-floor)', color: 'var(--gold)', gap: '16px', letterSpacing: '3px', fontSize: '0.8rem' }}>
          <div style={{ width: '32px', height: '32px', border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          RESTORING SESSION...
        </div>
      ) : !activeProject ? (
        <Dashboard onEnterLab={handleEnterLab} />
      ) : useNewFlow ? (
        // ─── New Hub-based flow (Feature Film / Short Film) ───
        subPage === 'writing' ? (
          <WritingRoom
            project={activeProject}
            onBack={handleBackToHub}
            onNavigate={handleNavigate}
            initialStep={subPageParam}
          />
        ) : subPage === 'production' ? (
          <ProductionDeck
            project={activeProject}
            onBack={handleBackToHub}
            initialView="pipeline"
          />
        ) : subPage === 'pipeline' ? (
          <ProductionDeck
            project={activeProject}
            onBack={handleBackToHub}
            initialView="pipeline"
          />
        ) : subPage === 'legacy' ? (
          <ProjectDetail
            project={activeProject}
            onBack={handleBackToHub}
          />
        ) : (
          <ProjectHub
            project={activeProject}
            onBack={handleBack}
            onNavigate={handleNavigate}
          />
        )
      ) : null}
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
