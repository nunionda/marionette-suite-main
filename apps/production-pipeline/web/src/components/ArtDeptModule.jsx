import React, { useState, useEffect, useRef } from 'react';
import '../styles/ArtDeptModule.css';

const AGENTS = [
  { key: 'analyst', name: 'Script Analyst', avatar: 'SA' },
  { key: 'logline', name: 'Logline Engine', avatar: 'LE' },
  { key: 'pd', name: 'Prod. Designer', avatar: 'PD' },
  { key: 'ad', name: 'Art Director', avatar: 'AD' },
  { key: 'set', name: 'Set Designer', avatar: 'SD' },
  { key: 'deco', name: 'Set Decorator', avatar: 'SC' },
  { key: 'props', name: 'Property Master', avatar: 'PM' },
  { key: 'setlist', name: 'Set List Mgr', avatar: 'SL' },
  { key: 'ledger', name: 'Props Ledger', avatar: 'PL' },
  { key: 'costume', name: 'Costume Analyst', avatar: 'CA' },
  { key: 'budget', name: 'Budget Estimator', avatar: 'BE' },
  { key: 'bible', name: 'Bible Compiler', avatar: 'BC' },
];

const ArtDeptModule = ({ project }) => {
  const [status, setStatus] = useState('IDLE');
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1);
  const [completedAgents, setCompletedAgents] = useState(new Set());
  const [logs, setLogs] = useState([]);
  const [useFreeModel, setUseFreeModel] = useState(true);
  const [scriptAnalysis, setScriptAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setIsAnalyzing(true);
    setLogs([{ type: 'info', text: `[SYSTEM] Processing script: ${file.name}...` }]);

    try {
      // Step 1: Parse PDF
      const formData = new FormData();
      formData.append('file', file);
      
      const parseRes = await fetch('http://localhost:3001/api/pdf/parse', {
        method: 'POST',
        body: formData
      });
      if (!parseRes.ok) throw new Error('PDF parsing failed');
      const { text } = await parseRes.json();
      
      setLogs(prev => [...prev, { type: 'info', text: '[SYSTEM] PDF extraction complete. Starting semantic analysis...' }]);

      // Step 2: Semantic Analysis
      const analyzeRes = await fetch('http://localhost:3001/api/pdf/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!analyzeRes.ok) throw new Error('Script analysis failed');
      const analysis = await analyzeRes.json();
      
      setScriptAnalysis(analysis);
      setLogs(prev => [...prev, { type: 'success', text: `[SUCCESS] Analysis complete. Detected ${analysis.locations.length} locations and ${analysis.characters.length} characters.` }]);
    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, { type: 'error', text: err.message }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runPipeline = async () => {
    setStatus('RUNNING');
    setCompletedAgents(new Set());
    setActiveAgentIndex(-1);
    setLogs(prev => [...prev, { type: 'header', text: '// STARTING 12-AGENT PRODUCTION BIBLE...' }]);

    const payload = {
      title: scriptAnalysis?.title || project.title,
      genre: scriptAnalysis?.genre || project.genre,
      concept: scriptAnalysis?.summary || project.logline,
      vision: project.vision || '',
      analysisData: {
        ...project.analysisData,
        scriptBrief: scriptAnalysis
      },
      useFreeModel
    };

    try {
      const response = await fetch('http://localhost:3001/api/pipeline/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Pipeline failed to initiate');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7);
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleSSE(currentEvent, data);
            } catch (e) {}
          }
        }
      }
      setStatus('COMPLETE');
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
      setLogs(prev => [...prev, { type: 'error', text: err.message }]);
    }
  };

  const handleSSE = (event, data) => {
    switch (event) {
      case 'agent-start':
        setActiveAgentIndex(data.index);
        setLogs(prev => [...prev, { type: 'header', text: `// ${data.name.toUpperCase()}` }]);
        break;
      case 'chunk':
        setLogs(prev => {
          const last = prev[prev.length - 1];
          if (last && last.type === 'text') {
            return [...prev.slice(0, -1), { ...last, text: last.text + data.text }];
          }
          return [...prev, { type: 'text', text: data.text }];
        });
        break;
      case 'agent-done':
        setCompletedAgents(prev => new Set([...prev, data.index]));
        break;
      case 'error':
        setLogs(prev => [...prev, { type: 'error', text: data.message }]);
        break;
    }
  };

  return (
    <div className="art-dept-module glass">
      <div className="module-header">
        <div className="module-info">
          <h2 className="serif">Art Orchestrator</h2>
          <p className="mono">PDF SCRIPT ANALYSIS & PRODUCTION</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="step-badge mono">{scriptAnalysis ? 'STEP 2' : 'STEP 1'}</div>
          {!scriptAnalysis ? (
            <div className="upload-zone">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handlePdfUpload} 
                id="pdf-upload" 
                hidden 
              />
              <label htmlFor="pdf-upload" className={`tactical-btn ${isAnalyzing ? 'working' : ''}`}>
                {isAnalyzing ? 'ANALYZING SCRIPT...' : 'IMPORT PDF SCRIPT'}
              </label>
            </div>
          ) : (
            <button 
              className="tactical-btn secondary" 
              onClick={() => { setScriptAnalysis(null); setPdfFile(null); }}
            >
              RESET
            </button>
          )}
          
          <button 
            className={`tactical-btn ${status === 'RUNNING' ? 'working' : ''}`}
            onClick={runPipeline}
            disabled={status === 'RUNNING' || !scriptAnalysis}
            style={{ opacity: !scriptAnalysis ? 0.3 : 1 }}
          >
            {status === 'RUNNING' ? 'EXECUTING...' : 'LAUNCH BIBLE'}
          </button>
        </div>
      </div>

      {scriptAnalysis && (
        <div className="analysis-preview-native glass">
          <div className="preview-grid">
            <div className="preview-item">
              <span className="label mono">GENRE</span>
              <span className="value">{scriptAnalysis.genre}</span>
            </div>
            <div className="preview-item">
              <span className="label mono">LOCATIONS</span>
              <div className="tags">
                {scriptAnalysis.locations.map((l, i) => <span key={i} className="tag">{l}</span>)}
              </div>
            </div>
            <div className="preview-item">
              <span className="label mono">CHARACTERS</span>
              <div className="tags">
                {scriptAnalysis.characters.map((c, i) => <span key={i} className="tag">{c}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pipeline-track-native">
        {AGENTS.map((agent, i) => (
          <React.Fragment key={agent.key}>
            <div className={`node-native ${activeAgentIndex === i ? 'active' : ''} ${completedAgents.has(i) ? 'done' : ''}`}>
              <div className="node-dot"></div>
              <span className="node-tag mono">{agent.key}</span>
            </div>
            {i < AGENTS.length - 1 && <div className="node-line"></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="log-console-native glass">
        {logs.length === 0 && <div className="console-placeholder mono">AWAITING PIPELINE EXECUTION...</div>}
        {logs.map((log, i) => (
          <div key={i} className={`log-entry ${log.type}`}>
            {log.text}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default ArtDeptModule;
