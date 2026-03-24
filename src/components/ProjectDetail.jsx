import React, { useState, useContext, useEffect, useRef } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import '../styles/ProjectDetail.css';

// Using Vite's raw import to get the agent rules
import loglineRule from '../.agents/rules/logline_engine.md?raw';
import architectRule from '../.agents/rules/architect_ai.md?raw';
import treatmentRule from '../.agents/rules/treatment_engine.md?raw';
import scenarioRule from '../.agents/rules/scenario_writer.md?raw';
import reviewRule from '../.agents/rules/production_review.md?raw';

import { useAgentEngine } from '../hooks/useAgentEngine';

const ProjectDetail = ({ project, onBack }) => {
  const { updateProject } = useContext(ProjectContext);
  const [activeTab, setActiveTab] = useState('CONCEPT');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openRouterApiKey') || '');
  
  // Concept Form State
  const [conceptBrief, setConceptBrief] = useState(project.conceptBrief || '');
  const [conceptDirection, setConceptDirection] = useState(project.conceptDirection || '글로벌 텐트폴 및 한국 상업 영화 표준');
  
  // Pipeline State
  const [pipelineData, setPipelineData] = useState({
    concept: project.concept || '',
    architecture: project.architecture || '',
    treatment: project.treatment || '',
    scenario: project.scenario || '',
    review: project.review || ''
  });

  const outputRef = useRef(null);

  // Sync state if project prop changes
  useEffect(() => {
    setPipelineData({
      concept: project.concept || '',
      architecture: project.architecture || '',
      treatment: project.treatment || '',
      scenario: project.scenario || '',
      review: project.review || ''
    });
    setConceptBrief(project.conceptBrief || '');
    setConceptDirection(project.conceptDirection || '글로벌 텐트폴 및 한국 상업 영화 표준');
  }, [project]);

  const handleDataChange = (field, value) => {
    setPipelineData(prev => ({ ...prev, [field]: value }));
  };

  // 1. Instantiate Application Layer (Engine Hook)
  const { executeAgent, isGenerating } = useAgentEngine(apiKey, handleDataChange);

  // 2. Manage View Side Effects (Auto-Scroll)
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [pipelineData, activeTab]);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('openRouterApiKey', key);
  };

  const saveToContext = () => {
    updateProject(project.id, { 
      ...pipelineData, 
      conceptBrief, 
      conceptDirection 
    });
    alert("Project Data Saved!");
  };

  // Agent UseCase Triggers
  const generateConcept = () => {
    if (!conceptBrief.trim()) {
      alert("⚠️ 아이디어 및 주제를 먼저 입력해주세요.");
      return;
    }
    
    executeAgent(
      loglineRule, 
      `사용자 브리프(아이디어/주제):\n${conceptBrief}\n\n기획 방향성:\n${conceptDirection}\n\n이 아이디어와 방향성을 바탕으로 글로벌 스펙터클과 한국 관객의 카타르시스를 모두 충족하는 완벽한 하이컨셉을 도출하세요.`, 
      'concept'
    );
  };

  const generateArchitecture = () => {
    if (!pipelineData.concept) { alert("Please generate the Concept first."); return; }
    executeAgent(architectRule, `Logline/Concept:\\n${pipelineData.concept}\\n\\n이 컨셉을 바탕으로 핵심 캐릭터 시트와 역동적인 3막 시놉시스를 설계하세요.`, 'architecture');
  };

  const generateTreatment = () => {
    if (!pipelineData.architecture) { alert("Please generate Architecture first."); return; }
    executeAgent(treatmentRule, `Synopsis & Characters:\\n${pipelineData.architecture}\\n\\n이를 헐리우드 3막 8시퀀스 구조에 맞게 배열하고 단계별 트리트먼트를 작성하세요.`, 'treatment');
  };

  const generateScenario = () => {
    if (!pipelineData.treatment) { alert("Please generate Treatment first."); return; }
    executeAgent(scenarioRule, `Treatment:\\n${pipelineData.treatment}\\n\\n극단적 미장센과 택티컬 텐션을 살려 실제 대본(Master Scene Format)을 작성하세요.`, 'scenario');
  };

  const generateReview = () => {
    if (!pipelineData.scenario) { alert("Please generate Scenario first."); return; }
    executeAgent(reviewRule, `Full Screenplay Segment:\\n${pipelineData.scenario}\\n\\n이 시나리오가 실제 영화로 제작될 때의 실현 가능성, 예산 효율성, 상업적 매력을 제작자 및 투자자 관점에서 냉정하게 리뷰하세요.`, 'review');
  };

  const tabs = ['CONCEPT', 'ARCHITECTURE', 'TREATMENT', 'SCENARIO', 'REVIEW'];

  return (
    <div className="project-detail">
      <div className="back-btn" onClick={onBack}>
        ← BACK TO DASHBOARD
      </div>
      
      <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 8px 0' }}>{project.title}</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>{project.genre} • <span style={{ color: 'var(--accent-primary)' }}>{project.status || 'Active'}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>🔑 OPENROUTER API KEY</span>
          <input 
            type="password" 
            placeholder="sk-or-v1-..." 
            value={apiKey} 
            onChange={(e) => saveApiKey(e.target.value)} 
            style={{ width: '220px', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', outline: 'none' }}
          />
          <div style={{ width: '1px', height: '24px', background: 'var(--surface-border)', margin: '0 8px' }}></div>
          <button className="tactical-btn" onClick={saveToContext} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💾</span> 프로젝트 전체 저장
          </button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
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
        <div className="section-card glass" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              {activeTab === 'CONCEPT' ? 'Logline Engine' : 
               activeTab === 'ARCHITECTURE' ? 'Architect AI' : 
               activeTab === 'TREATMENT' ? 'Treatment Engine' : 
               activeTab === 'SCENARIO' ? 'Scenario Writer' : 'Production Review'}
            </h2>
            <button 
              className="tactical-btn" 
              onClick={() => {
                if(activeTab === 'CONCEPT') generateConcept();
                if(activeTab === 'ARCHITECTURE') generateArchitecture();
                if(activeTab === 'TREATMENT') generateTreatment();
                if(activeTab === 'SCENARIO') generateScenario();
                if(activeTab === 'REVIEW') generateReview();
              }}
              disabled={isGenerating}
              style={{ background: isGenerating ? 'transparent' : 'var(--accent-primary)', color: isGenerating ? 'var(--accent-primary)' : 'black', padding: '12px 24px', fontWeight: 'bold' }}
            >
              {isGenerating ? 'Generating Stream...' : `⚡ Run ${activeTab} AI`}
            </button>
          </div>
          
          {/* Concept Input Form (Only visible in CONCEPT tab) */}
          {activeTab === 'CONCEPT' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px', padding: '20px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>[단계 1] 아이디어 및 주제 (Brief)</label>
                <textarea 
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--surface-border)', padding: '12px', color: 'white', borderRadius: '4px', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                  value={conceptBrief}
                  onChange={(e) => setConceptBrief(e.target.value)}
                  placeholder="예: 해커가 재벌 회장의 뇌파 금고를 턴다"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>[단계 2] 기획 방향성 (Direction)</label>
                <textarea 
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--surface-border)', padding: '12px', color: 'white', borderRadius: '4px', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                  value={conceptDirection}
                  onChange={(e) => setConceptDirection(e.target.value)}
                />
              </div>
            </div>
          )}

          <div style={{ color: 'var(--text-dim)', marginBottom: '8px', fontSize: '0.9rem' }}>
            ▾ {activeTab} Engine Output Window ▾
          </div>
          
          <textarea 
            ref={outputRef}
            className="logline-editor" 
            style={{ flexGrow: 1, resize: 'none', background: 'rgba(0,0,0,0.3)', marginTop: '16px', lineHeight: '1.6', fontSize: '1.05rem', padding: '20px' }}
            value={pipelineData[activeTab.toLowerCase()]}
            onChange={(e) => handleDataChange(activeTab.toLowerCase(), e.target.value)}
            disabled={isGenerating}
            placeholder={`Output for ${activeTab} will appear here...`}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
