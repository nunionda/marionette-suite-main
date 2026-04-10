/**
 * AD ORCHESTRATOR
 * Stores all systemic prompt templates and context injection logic for the Commercial Pipeline.
 * Decouples React UI from AI Engine orchestration rules.
 */

export const getBriefingPrompt = (conceptBrief, roleContext) => {
  return `[Task]: BRIEFING PHASE. 
  아이디어: ${conceptBrief}
  ${roleContext}
  위 브리프를 바탕으로 전략적 빅 아이디어와 캠페인 핵심 메시지를 도출하세요.`;
};

export const getArchitecturePrompt = (pipelineData, roleContext, isCD) => {
  const storyboardContext = isCD && pipelineData.treatment ? `\n[Storyboard Sketch Context]:\n${pipelineData.treatment}` : '';
  return `[Task]: COPYWRITING & SYNTHESIS PHASE. 
  컨셉: ${pipelineData.concept}
  ${roleContext}${storyboardContext}
  헤드라인, 바디카피, 브랜드 슬로건을 포함한 다수의 카피 시안을 제안하세요. 
  ${isCD ? '컨셉 아티스트의 시각적 방향성을 카피에 녹여내어 전략적으로 조율하세요.' : ''}`;
};

export const getTreatmentPrompt = (visualContext, roleContext) => {
  return `[Task]: STORYBOARDING PHASE. 
  컨셉/카피: ${visualContext}
  ${roleContext}
  AIDA 구조에 맞춰 각 초수별 시각적 구성과 리듬감을 설계하세요. 
  각 프레임은 반드시 [FRAME 1], [FRAME 2] 형식을 사용하세요.`;
};

export const getScenarioPrompt = (treatment, roleContext) => {
  return `[Task]: FINAL A/V SCRIPT. 
  스토리보드: ${treatment}
  ${roleContext}
  현장 투입용 표준 2단 테이블 스크립트를 작성하세요. 
  Visual(미장센)과 Audio(SFX/VO)를 분리하세요.`;
};

export const getReviewPrompt = (scenario, roleContext) => {
  return `[Task]: BRAND & IMPACT AUDIT. 
  완료된 시나리오:\n${scenario}
  ${roleContext}
  브랜드 가이드라인 준수 여부와 'Brutally Honest'한 소출 기대 효과를 냉정하게 평가하세요. 
  타겟 소비자에게 전달될 실질적인 메시지 파워를 검증하세요.

  [IMPORTANT]: 분석 완료 시 마지막에 반드시 아래 JSON 형식을 [ANALYSIS_JSON] 태그와 함께 포함하세요. 
  
  [ANALYSIS_JSON] 
  {
    "emotionalArc": [{"name": "Start", "valence": 5}, {"name": "USP", "valence": 8}, {"name": "CTA", "valence": 10}],
    "characterMap": [{"subject": "BRAND", "A": 90, "B": 80}, {"subject": "CONSUMER", "A": 65, "B": 45}],
    "beatProgress": [{"completed": 1, "total": 1}]
  }`;
};

export const getRefinementPrompt = (conceptBrief, creativeRole, language, contextInfo) => {
  const isCD = creativeRole === 'CD';
  return `
[Task]: Refine and Synthesize the following Campaign Brief.
[Role]: ${isCD ? 'Strategic Orchestrator / Creative Director' : creativeRole === 'COPY' ? 'Copywriter' : 'Concept Artist'} (${creativeRole})
[Context]: Output structured strategic advice and a refined version of the brief. ${isCD ? 'Harmonize the Copy and Storyboard inputs into this final direction.' : 'Focus on your specific role perspective.'}
${contextInfo}
[Language]: ${language}

Current Brief: ${conceptBrief}

Follow the standards in ## 🏛️ STRATEGIC ORCHESTRATION (CD Persona) and ## 🧠 BRIEFING_OPTIMIZER (CD Persona).
`;
};
