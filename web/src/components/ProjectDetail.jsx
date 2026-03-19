import React, { useState, useContext, useEffect } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import '../styles/ProjectDetail.css';

const ProjectDetail = ({ project, onBack }) => {
  const { updateProject } = useContext(ProjectContext);
  const [activeTab, setActiveTab] = useState('LOGLINE');
  
  // Local state for smooth editing
  const [logline, setLogline] = useState(project.logline);
  const [protagonist, setProtagonist] = useState(project.characters?.protagonist || '');
  const [antagonist, setAntagonist] = useState(project.characters?.antagonist || '');
  const [script, setScript] = useState(project.script || '');

  // Sync local state if project prop changes
  useEffect(() => {
    setLogline(project.logline);
    setProtagonist(project.characters?.protagonist || '');
    setAntagonist(project.characters?.antagonist || '');
    setScript(project.script || '');
  }, [project]);

  const handleSaveLogline = () => {
    updateProject(project.id, { logline });
    alert("Logline saved!");
  };

  const handleSaveArchitecture = () => {
    updateProject(project.id, { characters: { protagonist, antagonist } });
    alert("Architecture saved!");
  };

  const handleSaveScript = () => {
    updateProject(project.id, { script });
    alert("Script saved!");
  };

  return (
    <div className="project-detail">
      <div className="back-btn" onClick={onBack}>
        ← BACK TO DASHBOARD
      </div>
      
      <div className="detail-header">
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 8px 0' }}>{project.title}</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>{project.genre} • <span style={{ color: 'var(--accent-primary)' }}>{project.status}</span></p>
      </div>

      <div className="tabs">
        {['LOGLINE', 'ARCHITECTURE', 'SCRIPT'].map(tab => (
          <div 
            key={tab} 
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="content">
        {activeTab === 'LOGLINE' && (
          <div className="section-card glass">
            <h2 className="section-title">Logline Engine</h2>
            <textarea 
              className="logline-editor" 
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
            />
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
              <button className="tactical-btn">Auto-Generate</button>
              <button className="tactical-btn" onClick={handleSaveLogline} style={{ borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}>Save & Lock</button>
            </div>
          </div>
        )}

        {activeTab === 'ARCHITECTURE' && (
          <div className="section-card glass">
            <h2 className="section-title">Character & World Building</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="glass" style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Protagonist</h4>
                <textarea 
                  style={{ width: '100%', height: '80px', background: 'transparent', border: 'none', color: 'var(--text-dim)', resize: 'none' }}
                  value={protagonist}
                  onChange={(e) => setProtagonist(e.target.value)}
                  placeholder="Describe protagonist..."
                />
              </div>
              <div className="glass" style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Antagonist</h4>
                 <textarea 
                  style={{ width: '100%', height: '80px', background: 'transparent', border: 'none', color: 'var(--text-dim)', resize: 'none' }}
                  value={antagonist}
                  onChange={(e) => setAntagonist(e.target.value)}
                  placeholder="Describe antagonist..."
                />
              </div>
            </div>
             <button className="tactical-btn" onClick={handleSaveArchitecture} style={{ marginTop: '24px' }}>Save Architecture</button>
          </div>
        )}

        {activeTab === 'SCRIPT' && (
          <div className="section-card">
            <h2 className="section-title">Master Scene Format</h2>
            <textarea 
                className="script-view"
                style={{ width: '100%', minHeight: '400px', resize: 'vertical' }}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Start writing scene..."
            />
            <button className="tactical-btn" onClick={handleSaveScript} style={{ marginTop: '24px' }}>Save Script</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
