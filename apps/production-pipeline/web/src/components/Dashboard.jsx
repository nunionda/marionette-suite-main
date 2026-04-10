import React, { useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import '../styles/Dashboard.css';

const ProjectCard = ({ project, onEnter }) => (
  <div className="project-card glass">
    <div className="project-card-header">
      <div>
        <h3 className="project-title">{project.title}</h3>
        <span className="project-genre">{project.genre}</span>
      </div>
      <span className="badge production">{project.status}</span>
    </div>
    <p className="project-logline">{project.logline}</p>
    <div>
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${project.progress}%` }}></div>
      </div>
      <div className="meta" style={{ marginTop: '8px' }}>
        <span>Progress: {project.progress}%</span>
        <span>Updated: {project.updated}</span>
      </div>
    </div>
    <button 
      className="tactical-btn" 
      style={{ marginTop: '12px', width: '100%' }}
      onClick={() => onEnter(project.id)}
    >
      Enter Lab
    </button>
  </div>
);

const Dashboard = ({ onEnterLab }) => {
  const { projects, addProject, deleteProject } = useContext(ProjectContext);

  const handleNewMovie = () => {
    const title = prompt("Enter the new movie title:");
    if (!title) return;
    const genre = prompt("Enter genre (e.g. Cyberpunk Thriller):") || "Unspecified";
    
    addProject({
      title,
      genre,
      logline: "New logline awaiting generation..."
    });
  };

  return (
    <div className="dashboard">
      <div className="sidebar glass">
        <div className="sidebar-section">
          <div className="sidebar-label mono">NAVIGATION</div>
          <div className="nav-item active">DASHBOARD</div>
          <div className="nav-item">ARCHIVE</div>
        </div>
        
        <div className="sidebar-section" style={{ marginTop: '32px' }}>
          <div className="sidebar-label mono">RECENT ACTIVITY</div>
          <div className="activity-feed">
            {projects.slice(0, 4).map(p => (
              <div key={p.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-info">
                  <span className="activity-project">{p.title}</span>
                  <span className="activity-desc">{p.status === 'Ready' ? 'Production Ready' : 'In Progress'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="nav-item" style={{ marginTop: 'auto' }}>SETTINGS</div>
      </div>
      <div className="main-content">
        <div className="studio-stats-grid">
          <div className="stat-card glass">
            <span className="stat-label">TOTAL PROJECTS</span>
            <span className="stat-value">{projects.length}</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-label">ANALYSES DONE</span>
            <span className="stat-value">{projects.filter(p => p.analysis_status === 'done').length}</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-label">ART BIBLES READY</span>
            <span className="stat-value">{projects.filter(p => p.art_bible_status === 'ready').length}</span>
          </div>
        </div>

        <div className="header">
          <h2 style={{ margin: 0, fontWeight: 300, fontSize: '1.5rem', letterSpacing: '0.1em' }}>
            STUDIO <span style={{ fontWeight: 800 }}>BULLETIN</span>
          </h2>
          <button className="tactical-btn primary" onClick={handleNewMovie}>+ Add Project</button>
        </div>
        <div className="bulletin-grid">
          {projects.map(p => (
            <div key={p.id} style={{ position: 'relative' }}>
               <button 
                  onClick={() => { if(window.confirm('Delete project?')) deleteProject(p.id) }}
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                >
                  ✕
                </button>
               <ProjectCard project={p} onEnter={onEnterLab} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
