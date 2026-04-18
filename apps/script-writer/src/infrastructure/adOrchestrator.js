/**
 * AD ORCHESTRATOR v2.0
 * Context-aware prompt templates for the Commercial Pipeline.
 * Injects duration/platform/adType/format structure into every stage.
 */

// ── Shared context builder ──────────────────────────────────────
function buildContext({ role, language, adType, duration, platform, formatStructure }) {
  return `
[Role]: ${role || 'CD'}
[Language]: ${language || 'KO'}
[Ad Type]: ${adType || 'BrandFilm'}
[Duration]: ${duration || '30s'}
[Platform]: ${platform || 'TV'}
[Category]: Commercial

[FORMAT STRUCTURE]:
${formatStructure || '(no preset selected)'}
`.trim();
}

// ── 1. BRIEFING (Campaign Brief) ────────────────────────────────
export const getBriefingPrompt = (conceptBrief, roleContext, opts = {}) => {
  const ctx = typeof roleContext === 'string' ? roleContext : buildContext(roleContext);
  return `[Task]: CAMPAIGN BRIEFING PHASE
${ctx}

[INPUT — Raw Idea]:
${conceptBrief}

[INSTRUCTIONS]:
위 아이디어를 바탕으로 프로 대행사 수준의 크리에이티브 브리프를 작성하세요.

반드시 포함할 항목:
1. **Big Idea** — 캠페인 핵심 컨셉 한 문장
2. **USP (Unique Selling Proposition)** — 경쟁사 대비 차별점
3. **Target Audience** — 인구통계 + 심리적 프로파일
4. **Tone & Mood** — 감각적 묘사 (색감, 온도, 질감)
5. **Key Message** — 소비자 머릿속에 남길 단 하나의 문장
6. **CTA (Call to Action)** — 구체적 행동 유도
7. **Duration/Platform 적합성** — 선택된 포맷과 플랫폼에 대한 전략적 제안

[IMPORTANT]: ${opts.duration || '30s'} 포맷의 구조적 제약을 고려하세요.
${opts.platform === 'Instagram' || opts.platform === 'TikTok' ? '[PLATFORM NOTE]: 세로형(9:16) 플랫폼입니다. 비주얼 설계 시 세로 구도 중심으로 제안하세요.' : ''}`;
};

// ── 2. ARCHITECTURE (Copywriting) ───────────────────────────────
export const getArchitecturePrompt = (pipelineData, roleContext, isCD, opts = {}) => {
  const ctx = typeof roleContext === 'string' ? roleContext : buildContext(roleContext);
  const storyboardContext = isCD && pipelineData.treatment ? `\n[Storyboard Context]:\n${pipelineData.treatment.slice(0, 500)}` : '';
  const adType = opts.adType || 'BrandFilm';

  const toneGuide = {
    BrandFilm: '시적·철학적 VO. 브랜드 매니페스토 톤.',
    ProductDemo: '직접적·기능 중심. USP 반복. 스펙/숫자 강조.',
    Cinematic: '내러티브 VO. 캐릭터 감정 중심.',
    Social: '구어체·직접 대화. "너도 이랬지?" 패턴. 짧고 강렬.',
    Performance: '설득적·긴급. "지금", "한정", "무료" 행동 유도.',
    Testimonial: '진정성·실제 말투. 대본 느낌 제거.',
  }[adType] || '전문적이고 임팩트 있는 카피.';

  return `[Task]: COPYWRITING & IDEATION PHASE
${ctx}${storyboardContext}

[INPUT — Campaign Brief]:
${pipelineData.concept || '(brief not yet generated)'}

[INSTRUCTIONS]:
**최소 시안 3종**을 제안하세요. 각 시안은 완전히 다른 방향성을 가져야 합니다.

각 시안 구성:
- **Headline** (헤드라인 / 1줄)
- **Body Copy** (바디카피 / 2-4줄)
- **Tagline / Slogan** (슬로건)
- **VO Script** (보이스오버 스크립트 — 선택된 Duration에 맞춘 분량)

[TONE GUIDE]: ${toneGuide}
${isCD ? '[CD MODE]: 컨셉 아티스트의 시각적 방향성과 카피를 전략적으로 조율하세요.' : ''}
[DURATION NOTE]: ${opts.duration || '30s'} 기준으로 카피 분량을 조절하세요.`;
};

// ── 3. TREATMENT (Director's Note / Storyboard) ─────────────────
export const getTreatmentPrompt = (visualContext, roleContext, opts = {}) => {
  const ctx = typeof roleContext === 'string' ? roleContext : buildContext(roleContext);
  const duration = opts.duration || '30s';

  const frameCount = { '15s': 5, '30s': 10, '60s': 15, 'BrandFilm': 20 }[duration] || 10;

  return `[Task]: DIRECTOR'S NOTE / STORYBOARDING PHASE
${ctx}

[INPUT — Concept & Copy]:
${visualContext || '(no previous content)'}

[INSTRUCTIONS]:
선택된 Duration(${duration})의 구조에 맞춰 **${frameCount}개 프레임**의 스토리보드를 설계하세요.

${opts.formatStructure ? `[TIMING STRUCTURE]:\n${opts.formatStructure}\n` : ''}

각 프레임은 반드시 아래 형식을 사용하세요:
\`\`\`
[FRAME N]
- **Visual**: (상세 시각 묘사 — 인물, 배경, 오브젝트, 컬러)
- **Lighting**: (조명 스타일 — 키라이트/필라이트/백라이트)
- **Camera**: (앵글, 무빙, 렌즈)
- **Mood**: (전체적인 분위기/컬러 톤)
- **[IMAGE_PROMPT]**: (이미지 생성용 프롬프트 — 영어, 상세)
\`\`\`

[PACING]: 컷당 평균 ${duration === '15s' ? '1.5초' : duration === '30s' ? '1.5-2초' : '2-3초'} 리듬감 유지.
${opts.platform === 'Instagram' || opts.platform === 'TikTok' ? '[VERTICAL]: 9:16 세로 구도 기준으로 미장센을 설계하세요. 상하 Safe Zone 15% 여백.' : ''}
${opts.platform === 'Cinema' ? '[CINEMASCOPE]: 2.39:1 와이드 구도 기준. 좌우 프레이밍 활용.' : ''}`;
};

// ── 4. SCENARIO (Final A/V Script) ──────────────────────────────
export const getScenarioPrompt = (treatment, roleContext, opts = {}) => {
  const ctx = typeof roleContext === 'string' ? roleContext : buildContext(roleContext);
  const duration = opts.duration || '30s';

  const trtGuide = {
    '15s': 'Total Runtime: 15초. 단어 수 약 30-40단어(KO) / 35-45 words(EN).',
    '30s': 'Total Runtime: 30초. 단어 수 약 70-80단어(KO) / 75-85 words(EN).',
    '60s': 'Total Runtime: 60초. 단어 수 약 140-160단어(KO) / 150-170 words(EN).',
    'BrandFilm': 'Total Runtime: 2-3분. 단어 수 자유. 내러티브 VO 호흡 중심.',
  }[duration] || 'Total Runtime: 30초.';

  return `[Task]: FINAL A/V PRODUCTION SCRIPT
${ctx}

[INPUT — Storyboard / Director's Note]:
${treatment || '(no storyboard yet)'}

[INSTRUCTIONS]:
현장 투입용 **표준 2단(A/V) 테이블 스크립트**를 작성하세요.

반드시 아래 테이블 형식을 사용하세요:

| 시간 | Visual (영상) | Audio (음성/SFX/BGM) |
|------|---------------|---------------------|
| 0:00-0:03 | (미장센 상세 묘사) | (SFX: ___ / BGM: ___ / VO: "___") |
| ... | ... | ... |

[TRT CONSTRAINT]: ${trtGuide}
[PACING]: 각 컷의 초 단위 TRT를 명시하세요.

Visual 컬럼 포함 항목: 카메라 앵글, 인물 동작, 소품 배치, 조명 변화, 텍스트 수퍼(Supers)
Audio 컬럼 포함 항목: SFX(효과음), BGM(배경음악 톤/템포), VO("대사 전문"), Narration

${opts.platform === 'Instagram' || opts.platform === 'TikTok' ? '[PLATFORM]: 무음 재생 대비 텍스트 수퍼/자막 위치를 Visual 컬럼에 반드시 명시하세요.' : ''}
${opts.platform === 'YouTube' ? '[PLATFORM]: 5초 스킵 구간(0:00-0:05)에 반드시 브랜드명과 핵심 메시지를 배치하세요.' : ''}`;
};

// ── 5. REVIEW (Brand & Impact Audit) ────────────────────────────
export const getReviewPrompt = (scenario, roleContext, opts = {}) => {
  const ctx = typeof roleContext === 'string' ? roleContext : buildContext(roleContext);

  return `[Task]: BRAND & IMPACT AUDIT
${ctx}

[INPUT — Final A/V Script]:
${scenario || '(no script yet)'}

[INSTRUCTIONS]:
완성된 스크립트를 아래 항목별로 냉정하게(Brutally Honest) 평가하세요.

**1. Brand Alignment (브랜드 정합성)**
- USP가 명확히 전달되는가?
- 브랜드 톤앤매너 일관성

**2. Emotional Impact (감정 임팩트)**
- AIDA 각 단계가 감정적으로 작동하는가?
- 감정 곡선의 피크와 밸리 분석

**3. Platform Fitness (플랫폼 적합도)**
- ${opts.platform || 'TV'} 플랫폼에 최적화되었는가?
${opts.platform === 'Instagram' || opts.platform === 'TikTok' ? '- 세로형(9:16) 비주얼이 적절한가? 무음 대비 자막은 충분한가?' : ''}
${opts.platform === 'YouTube' ? '- 5초 내 브랜드 노출이 되어 있는가?' : ''}
- 비율/포맷이 플랫폼 규격에 맞는가?

**4. Pacing & TRT (리듬 & 러닝타임)**
- ${opts.duration || '30s'} 제약 조건 내에 들어오는가?
- 컷당 평균 시간이 적절한가?

**5. CTA Effectiveness (CTA 실효성)**
- CTA가 명확하고 행동 유도력이 있는가?

[SCORING]: 각 항목을 10점 만점으로 채점하고 총평을 작성하세요.

[IMPORTANT]: 분석 완료 시 마지막에 반드시 아래 JSON 형식을 [ANALYSIS_JSON] 태그와 함께 포함하세요.

[ANALYSIS_JSON]
{
  "emotionalArc": [{"name": "Hook", "valence": 0}, {"name": "Interest", "valence": 0}, {"name": "Desire", "valence": 0}, {"name": "CTA", "valence": 0}],
  "characterMap": [{"subject": "BRAND", "A": 0, "B": 0}, {"subject": "CONSUMER", "A": 0, "B": 0}],
  "beatProgress": [{"completed": 1, "total": 1}]
}`;
};

// ── 6. REFINEMENT (Brief Optimizer) ─────────────────────────────
export const getRefinementPrompt = (conceptBrief, creativeRole, language, contextInfo, opts = {}) => {
  const isCD = creativeRole === 'CD';
  return `[Task]: Refine and Synthesize the Campaign Brief.
[Role]: ${isCD ? 'Strategic Orchestrator / Creative Director' : creativeRole === 'COPY' ? 'Copywriter' : 'Concept Artist'} (${creativeRole})
[Language]: ${language}
[Duration]: ${opts.duration || '30s'}
[Platform]: ${opts.platform || 'TV'}
[Ad Type]: ${opts.adType || 'BrandFilm'}

${contextInfo}

[Current Brief]:
${conceptBrief}

[INSTRUCTIONS]:
${isCD
    ? '모든 전문가(CW, CA)의 결과물을 브랜드 목적에 맞게 통합하고 전략적으로 조율하세요.'
    : creativeRole === 'COPY'
      ? '카피라이터 관점에서 메시지의 리듬감, 톤앤매너, 슬로건 방향성을 제안하세요.'
      : '시각적 방향성, 컬러 팔레트, 촬영 스타일을 제안하세요.'}

출력 형식:
### [REFINED BRIEF]
- **Core Concept**: (한 문장)
- **Target**: (타겟)
- **USP**: (핵심 소구점)
- **Tone & Mood**: (감각적 묘사)

### [CD STRATEGY]
- (전략적 제안)

### [TACTICAL QUESTIONS]
- (기획 고도화를 위한 질문)`;
};
