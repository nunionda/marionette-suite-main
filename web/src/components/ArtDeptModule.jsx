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
  const [useFreeModel, setUseFreeModel] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const runPipeline = async () => {
    setStatus('RUNNING');
    setCompletedAgents(new Set());
    setActiveAgentIndex(-1);
    setLogs([]);

    const payload = {
      title: project.title,
      genre: project.genre,
      concept: project.logline,
      vision: project.vision || '',
      analysisId: project.id,
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
          <p className="mono">12-AGENT PRODUCTION PIPELINE</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label className="free-model-toggle mono">
            <input 
              type="checkbox" 
              checked={useFreeModel} 
              onChange={(e) => setUseFreeModel(e.target.checked)} 
            />
            FREE MODEL
          </label>
          <button 
            className={`tactical-btn ${status === 'RUNNING' ? 'working' : ''}`}
            onClick={runPipeline}
            disabled={status === 'RUNNING'}
          >
            {status === 'RUNNING' ? 'EXECUTING...' : 'LAUNCH PIPELINE'}
          </button>
        </div>
      </div>

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
