import React from 'react';
import '../styles/StudioHeader.css';

const StudioHeader = ({ currentModule = 'MANAGEMENT' }) => {
  return (
    <header className="studio-header">
      <div className="studio-logo">
        <span className="logo-icon">M</span>
        <div className="logo-text">
          <h1 className="serif">Marionette Studio</h1>
          <p className="mono">AI CINEMA PRODUCTION</p>
        </div>
      </div>
      
      <nav className="studio-nav">
        <div className={`nav-pill ${currentModule === 'MANAGEMENT' ? 'active' : ''}`}>
          MANAGEMENT
        </div>
        <div className={`nav-pill ${currentModule === 'LOGIC' ? 'active' : ''}`} onClick={() => window.open(import.meta.env.VITE_SCENARIO_ANALYSIS_URL || 'http://localhost:4000', '_blank')}>
          LOGIC
        </div>
        <div className={`nav-pill ${currentModule === 'ART' ? 'active' : ''}`} onClick={() => window.open(import.meta.env.VITE_ART_DEPT_URL || 'http://localhost:3001', '_blank')}>
          ART
        </div>
      </nav>

      <div className="studio-status">
        <span className="status-dot online"></span>
        <span className="status-label mono">SYSTEM ONLINE</span>
      </div>
    </header>
  );
};

export default StudioHeader;
