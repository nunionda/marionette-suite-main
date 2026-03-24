import React, { useContext, useState } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import ProjectCreateModal from './ProjectCreateModal';
import LoglineLab from './LoglineLab';
import '../styles/Dashboard.css';

const ProjectCard = ({ project, onEnter }) => (
  <div className="project-card glass hover-glow">
    <div className="project-card-header">
      <div>
        <h3 className="project-title">{project.title}</h3>
        <span className="project-genre">{project.genre}</span>
      </div>
      <div className="card-badge category">{project.category}</div>
      <span className="badge production">{project.status || 'Active'}</span>
    </div>
    <p className="project-logline">{project.logline || 'Logline pending generation...'}</p>
    <div className="card-footer">
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${project.progress || 0}%` }}></div>
      </div>
      <div className="meta" style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{color: 'var(--accent-secondary)'}}>PROGRESS: {project.progress || 0}%</span>
        <span>{project.updated || 'Just now'}</span>
      </div>
    </div>
    <button 
      className="tactical-btn full-width" 
      onClick={() => onEnter(project.id)}
    >
      ENTER SCRIPT LAB
    </button>
  </div>
);

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
          <div className="header-top-nav">
            <div className="main-nav-tabs">
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
          <div className="brand gradient-text cinematic-title">AI CINEMA LAB</div>
          <h1 className="hero-headline">Engineer the Perfect Screenplay</h1>
          <p className="hero-subtext">
            Harness a multi-agent AI pipeline built for Hollywood's elite. <br/>
            Refine concepts, structure acts, and execute Master Scenes with tactical precision.
          </p>
          <button className="tactical-btn massive-btn glow-effect" onClick={() => setIsModalOpen(true)}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+ INITIATE NEW SCENARIO</span>
          </button>
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
            {['ALL', 'FEATURE', 'SHORT', 'DRAMA', 'AD'].map(tab => (
              <button 
                key={tab}
                className={`category-tab ${filterTab === tab ? 'active' : ''}`}
                onClick={() => setFilterTab(tab)}
              >
                {tab === 'FEATURE' ? '장편' : tab === 'SHORT' ? '단편' : tab === 'DRAMA' ? '드라마' : tab === 'AD' ? '광고' : '전체'}
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
              <div key={p.id} style={{ position: 'relative' }}>
                 <button 
                    className="delete-card-btn"
                    onClick={() => { if(window.confirm(`Delete the project: ${p.title}?`)) deleteProject(p.id) }}
                    title="Delete Project"
                  >
                    ✕
                  </button>
                 <ProjectCard project={p} onEnter={onEnterLab} />
              </div>
            ))}
          </div>
        )}
      </section>
      )}
    </div>
  );
};

export default Dashboard;
