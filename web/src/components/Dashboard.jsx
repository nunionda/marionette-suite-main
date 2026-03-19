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
      <div className="sidebar">
        <div className="brand gradient-text">AI CINEMA LAB</div>
        <div className="nav-item active">Dashboard</div>
        <div className="nav-item">Projects</div>
        <div className="nav-item">Scripting</div>
        <div className="nav-item">Mise-en-scène</div>
        <div className="nav-item" style={{ marginTop: 'auto' }}>Settings</div>
      </div>
      <div className="main-content">
        <div className="header">
          <h2 style={{ margin: 0, fontWeight: 300, fontSize: '2rem' }}>PROJECT <span style={{ fontWeight: 800 }}>BULLETIN BOARD</span></h2>
          <button className="tactical-btn" onClick={handleNewMovie}>+ New Movie</button>
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
