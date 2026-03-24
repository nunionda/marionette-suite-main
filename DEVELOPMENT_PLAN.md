# 🎬 cine-script-writer: Development Plan & Architecture

본 문서는 **할리우드 상업 영화 시나리오 작성 프로세스**를 기반으로 설계된 `cine-script-writer`의 AI 에이전트 파이프라인 아키텍처 및 개발 계획 문서입니다.

## 1. 개요 (Overview)
`cine-script-writer`는 인간 작가의 직관적 아이디어를 산업 표준 규격의 완성된 대본(Screenplay)으로 변환하는 **다중 에이전트 기반 시나리오 전문 집필 엔진**입니다. 이 시스템은 전통적인 영상 작법의 7단계 프로세스를 AI 파이프라인과 1:1로 매핑하여 압도적인 서사적 완성도와 미장센을 도출합니다.

---

## 2. 시나리오 작성 프로세스 매핑 (Pipeline Architecture)

### ◾ Stage 1: Concept Engineering (기획 및 로그라인)
- **전통적 단계**: 아이디어 선정 ➔ 주제 정의 ➔ 방향 설정 ➔ 로그라인 도출
- **AI Agent**: `Logline Engine (Script Doctor)`
- **역할**: 사용자의 투박한 아이디어를 받아 `[아이러니] + [전술적 디테일] + [보편적 감정]` 공식에 대입. 넷플릭스 1티어 기준 및 한국 텐트폴 (천만 관객) 흥행 소구점(K-카타르시스)을 충족하는 날카로운 **하이 컨셉 로그라인**으로 정제합니다.

### ◾ Stage 2: Narrative Architecture (시놉시스 및 캐릭터 개발)
- **전통적 단계**: 시놉시스 작성 ➔ 입체적 캐릭터 구축
- **AI Agent**: `Architect AI`
- **역할**: 로그라인을 바탕으로 1~3페이지 분량의 **시놉시스**를 작성하고, 갈등을 주도할 매력적인 인물들의 **캐릭터 시트(가치관, 결핍, 욕망)**를 JSON 형태로 설계합니다. (Fact-base 리서치 시스템 구조 연동)

### ◾ Stage 3: Deep Treatment (트리트먼트 및 비트 시트)
- **전통적 단계**: 스토리라인 구성 ➔ 트리트먼트 (Step Outline)
- **AI Agent**: `Treatment Engine`
- **역할**: 주인공의 여정을 헐리우드 3막 8시퀀스 구조에 맞게 배열하고, 150여 개의 씬으로 쪼개어 **씬별 한 줄 요약(Step Outline)**과 **트리트먼트(산문 형태의 확장본)**를 출력합니다.

### ◾ Stage 4: Scene Execution (대본 집필)
- **전통적 단계**: 씬 헤더, 지문(Action Line), 대사(Dialogue) 작성
- **AI Agent**: `Scenario Writer` + `Style Guide`
- **역할**: 트리트먼트를 바탕으로 글로벌 상업 영화 표준 포맷(Master Scene Format)의 실제 대본을 5씬 단위로 연속 생성합니다.
  - **지문 (Action Line)**: 봉준호/데이빗 핀처 스타일의 극단적 미장센과 치밀한 택티컬 텐션 강조.
  - **대사 (Dialogue)**: 서브텍스트(Subtext)가 살아있는 긴장감 넘치는 대사 구성.

---

## 4. 미디어 카테고리별 특화 파이프라인 (Media Categories)

`cine-script-writer`는 프로젝트 생성 시 선택한 카테고리에 따라 에이전트의 페르소나와 출력 포맷을 동적으로 전환합니다.

- **[숏필름] 단편영화 모드**: 단일 테마와 강렬한 미장센 중심 (5~20p).
- **[시리즈] 넷플릭스 오리지널 모드**: 빈지워치(Binge-watch) 유발 및 복합 플롯, 글로벌 감각의 서사 (8~10부작 시즌제).
- **[광고] 비즈니스 모드**: USP 중심의 전략적 메시지 및 2단(A/V) 포매팅 (15/30/60s).

---

## 5. 장르별 특화 모듈 (Genre Modules)

에이전트는 선택된 장르에 따라 서사적 '톤 앤 매너'를 즉각적으로 전환합니다.

- **[스릴러/액션]**: 정보 제한, 택티컬 텐션, 짧고 강렬한 호흡.
- **[휴먼 드라마]**: 함축적 대사(Subtext), 인물의 깊은 내면 묘사, 여운 중심.
- **[SF/미스테리]**: 논리적 세계관, 비일상적 비주얼 임합트, 복선의 치밀한 배치.
- **[코미디/풍자]**: 아이러니, 타이밍, 셋업-페이오프 구조 강화.

---

## 7. 고도화된 서사 전략 (Advanced Narrative Strategy)

`cine-script-writer`는 단순한 텍스트 생성을 넘어, 산업 표준의 '흥행 공식'을 기술적으로 구현합니다.

- **빈지-훅 설계 (Binge-Hook Design)**: 넷플릭스 오리지널 표준에 따라 파일럿 에피소드의 오프닝 5분과 엔딩 클리프행어를 서사적으로 강제 설계합니다. ([상세보기](file:///Users/daniel/dev/antigravity-dev/cine-script-writer/docs/narrative/PILOT_HOOK_DESIGN.md))
- **클리셰 서브버전 (Cliché Subversion)**: 뻔한 장르적 관습을 인지하고 이를 리얼리티나 아이러니로 뒤집는 'Anti-Slop' 모듈을 가동합니다. ([상세보기](file:///Users/daniel/dev/antigravity-dev/docs/narrative/CLICHE_STRATEGY.md))
- **마스터클래스 프레임워크 (Masterclass Frameworks)**: Syd Field(3막), Robert McKee(가치 변화), Blake Snyder(15비트)의 핵심 이론을 엔진 로직에 결합하여 산업 표준 이상의 서사 완성도를 보장합니다. ([연구 분석 문서](file:///Users/daniel/dev/antigravity-dev/cine-script-writer/docs/research/RESEARCH_SCREENWRITING_MASTERS.md))

---

## 8. 핵심 개발 마일스톤 (Milestones)

- **Phase 1 (기반 작업)**: 프로젝트 폴더트리 표준화 및 통합 `package.json` 세팅. [ 완료 ]
- **Phase 2 (에이전트 이식)**: Logline Engine 및 Architect AI 이식 및 고도화. [ 완료 ]
- **Phase 3 (웹 콘솔 UI 연동)**: 파이프라인 4단계 콘솔 대시보드 개발. [ 완료 ]
- **Phase 4 (검증 시스템)**: Review Agent 추가 및 제작 실현 가능성 평가. [ 완료 ]
- **Phase 5 (카테고리/장르 확장)**: 단편/넷플릭스/광고 및 장르별 스타일 가이드 UI 연동. [ 완료 ]
- **Phase 6 (서사 전략 엔진)**: 빈지-훅, 클리셰 서브버전 및 마스터클래스 비트 시트 자동 제안 시스템 구축. [ 계획중 ]
- **Phase 7 (백엔드 고도화)**: Elysia.js + PostgreSQL 기반의 시나리오 데이터 아카이빙 및 멀티 유저 협업 환경 구축. [ 완료 ]

이 개발 계획 문서는 `cine-script-writer`를 가장 진보된 AI 시나리오 스튜디오로 발전시키는 청사진 역할을 합니다.
