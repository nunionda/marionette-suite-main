import React, { useEffect, useState } from 'react';
import { parseStoryboardFrames } from '../utils/adUtils';
import './ExportRenderView.css';

function ExportRenderView({ project }) {
  const [outline, setOutline] = useState(null);

  useEffect(() => {
    // Add a class to body for print styles
    document.body.classList.add('export-mode');
    
    // Parse Commercial Project data directly
    const rawTreatment = project.treatment || "";
    const images = project.storyboardImages || project.storyboard_images || {};
    
    const frames = parseStoryboardFrames(rawTreatment);
    const mappedScenes = frames.map(frame => ({
      sceneNumber: frame.number,
      content: frame.visual || frame.sketchPrompt || "",
      dialogue: frame.copy || "",
      camera_work: frame.camera || "",
      setting: frame.lighting || "",
      storyboardImage: images[frame.number] || null
    }));
    
    setOutline(mappedScenes);

    return () => {
      document.body.classList.remove('export-mode');
    };
  }, [project]);

  if (!outline) {
    return <div className="export-loading">Preparing Document...</div>;
  }

  return (
    <div className="export-document print-container">
      {/* Cover Page */}
      <div className="export-cover page-break">
        <h3 className="export-agency">CINEMATIC AI PRODUCTION</h3>
        <h1 className="export-title">{project.title}</h1>
        <div className="export-meta">
          <p><strong>Category:</strong> {project.category}</p>
          <p><strong>Genre:</strong> {project.genre}</p>
          <p><strong>Brand:</strong> {project.brand_name || 'N/A'}</p>
          <p><strong>Target:</strong> {project.target_audience || 'N/A'}</p>
        </div>
        
        <div className="export-brief">
          <h2>Creative Brief & Logline</h2>
          <p className="brief-content">{project.logline}</p>
          {project.advertising_goal && (
            <p className="brief-content"><strong>Goal:</strong> {project.advertising_goal}</p>
          )}
        </div>
      </div>

      {/* Storyboard Pages */}
      <div className="export-storyboard">
        <h2 className="section-title">Visual Storyboard</h2>
        <div className="storyboard-grid">
          {outline.map((scene, idx) => (
            <div key={idx} className="storyboard-panel avoid-break">
              <div className="panel-header">
                <span className="scene-number">Scene #{scene.sceneNumber || idx + 1}</span>
                <span className="scene-setting">{scene.setting || ""}</span>
              </div>
              
              <div className="panel-image-container">
                {scene.storyboardImage ? (
                  <img src={scene.storyboardImage} alt={`Scene ${idx + 1}`} className="panel-image" />
                ) : (
                  <div className="panel-image-placeholder">Image Generation Pending</div>
                )}
              </div>
              
              <div className="panel-content">
                <p><strong>Visual:</strong> {scene.content}</p>
                {scene.dialogue && <p><strong>Audio/Text:</strong> {scene.dialogue}</p>}
                {scene.camera_work && <p><strong>Camera:</strong> {scene.camera_work}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExportRenderView;
