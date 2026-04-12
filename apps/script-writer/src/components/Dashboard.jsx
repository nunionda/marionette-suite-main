import React, { useContext, useState } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import ProjectCreateModal from './ProjectCreateModal';
import LoglineLab from './LoglineLab';
import '../styles/Dashboard.css';

const CATEGORY_META = {
  'Feature Film':      { color: '#C3A05A', label: 'FEATURE FILM' },
  'Short Film':        { color: '#06B6D4', label: 'SHORT FILM' },
  'Netflix Original':  { color: '#E50914', label: 'DRAMA' },
  'Commercial':        { color: '#F97316', label: 'COMMERCIAL' },
  'YouTube':           { color: '#FF4444', label: 'YOUTUBE' },
};

const ProjectCard = ({ project, onEnter, onDelete }) => {
  const meta = CATEGORY_META[project.category] || { color: '#8B5CF6', label: project.category };
  return (
    <div className="project-card glass hover-glow" style={{ '--cat-color': meta.color, borderLeft: `3px solid ${meta.color}` }}>
      {/* Top strip: category badge + status + delete */}
      <div className="card-top-strip">
        <span className="card-cat-badge" style={{ background: `${meta.color}22`, color: meta.color, border: `1px solid ${meta.color}44` }}>
          {meta.label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="card-status-badge">{project.status || 'ACTIVE'}</span>
          <button
            className="delete-card-btn"
            onClick={() => { if (window.confirm(`Delete "${project.title}"?`)) onDelete(project.id); }}
            title="Delete Project"
          >✕</button>
        </div>
      </div>

      {/* Title area — fixed 2-line clamp */}
      <div className="card-title-area">
        <h3 className="project-title">{project.title}</h3>
        <span className="project-genre">{project.genre}</span>
      </div>

      {/* Logline — 3-line clamp */}
      <p className="project-logline">{project.logline || 'Logline pending generation...'}</p>

      {/* Footer */}
      <div className="card-footer">
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${project.progress || 0}%`, background: meta.color }}></div>
        </div>
        <div className="card-meta-row">
          <span style={{ color: meta.color }}>PROGRESS {project.progress || 0}%</span>
          <span className="card-updated">{project.updated || 'Just now'}</span>
        </div>
      </div>

      <button className="tactical-btn full-width" onClick={() => onEnter(project.id)}>
        ENTER SCRIPT LAB
      </button>
    </div>
  );
};

const Dashboard = ({ onEnterLab }) => {
  const { projects, addProject, deleteProject } = useContext(ProjectContext);
  const [activeMainTab, setActiveMainTab] = useState('PRODUCTIONS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL');

  const getGroupedCategory = (cat) => {
    if (cat === 'Feature Film') return 'FEATURE';
    if (cat === 'Short Film') return 'SHORT';
    if (cat === 'Netflix Original') return 'DRAMA';
    if (cat === 'Commercial') return 'AD';
    if (cat === 'YouTube') return 'YOUTUBE';
    return 'OTHER';
  };

  const filteredProjects = filterTab === 'ALL' 
    ? projects 
    : projects.filter(p => getGroupedCategory(p.category) === filterTab);

  const handleCreateProject = (data) => {
    addProject({
      ...data,
      logline: "Initializing core narrative engine for " + data.category + "...",
      progress: 0
    });
  };

  return (
    <div className="dashboard-container">
      <ProjectCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateProject}
      />
      
      {/* 🎭 HOMEPAGE HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content glass-dark">
          <div className="brand gradient-text cinematic-title">AI CINEMA LAB</div>
          <h1 className="hero-headline">Engineer the Perfect Screenplay</h1>
          <p className="hero-subtext">
            Harness a multi-agent AI pipeline built for Hollywood's elite. <br/>
            Refine concepts, structure acts, and execute Master Scenes with tactical precision.
          </p>
          <button className="tactical-btn massive-btn glow-effect" onClick={() => setIsModalOpen(true)}>
            + INITIATE NEW SCENARIO
          </button>
          <div className="main-nav-tabs hero-nav-tabs">
            <button
              className={`nav-tab ${activeMainTab === 'PRODUCTIONS' ? 'active' : ''}`}
              onClick={() => setActiveMainTab('PRODUCTIONS')}
            >
              PRODUCTIONS
            </button>
            <button
              className={`nav-tab ${activeMainTab === 'LOGLINE_LAB' ? 'active' : ''}`}
              onClick={() => setActiveMainTab('LOGLINE_LAB')}
            >
              LOGLINE LAB
            </button>
          </div>
        </div>
      </section>

      {activeMainTab === 'LOGLINE_LAB' ? (
        <LoglineLab />
      ) : (
        <section className="projects-section">
          <div className="section-header">
          <h2 style={{ margin: 0, fontWeight: 300, fontSize: '2rem', letterSpacing: '4px' }}>
            ACTIVE <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>PRODUCTIONS</span>
          </h2>
          <div className="category-tabs">
            {['ALL', 'FEATURE', 'SHORT', 'DRAMA', 'AD', 'YOUTUBE'].map(tab => (
              <button
                key={tab}
                className={`category-tab ${filterTab === tab ? 'active' : ''}`}
                onClick={() => setFilterTab(tab)}
              >
                {tab === 'FEATURE' ? '장편' : tab === 'SHORT' ? '단편' : tab === 'DRAMA' ? '드라마' : tab === 'AD' ? '광고' : tab === 'YOUTUBE' ? '▶ 유튜브' : '전체'}
              </button>
            ))}
          </div>
        </div>
        
        {projects.length === 0 ? (
          <div className="empty-state">
            <p className="gradient-text">No active scripts. Initiate a new scenario above.</p>
          </div>
        ) : (
          <div className="bulletin-grid">
            {filteredProjects.map(p => (
              <ProjectCard key={p.id} project={p} onEnter={onEnterLab} onDelete={deleteProject} />
            ))}
          </div>
        )}
      </section>
      )}
      <ProjectCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateProject}
      />
    </div>
  );
};

export default Dashboard;
