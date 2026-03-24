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

## 3. 핵심 개발 마일스톤 (Milestones)

- **Phase 1 (기반 작업)**: 프로젝트 폴더트리 표준화 (`src/` 구조 이관 완료) 및 통합 `package.json` 세팅.
- **Phase 2 (에이전트 이식)**: Logline Engine 및 Architect AI의 시스템 프롬프트를 `/src/.agents/rules/` 하위에 이식 및 고도화.
- **Phase 3 (웹 콘솔 UI 연동)**: React/Vite 기반의 `cine-script-writer` 프론트엔드에서 파이프라인 4단계를 시각적으로 트래킹할 수 있는 콘솔 대시보드 개발.
- **Phase 4 (검증 시스템)**: 도출된 시나리오가 "제작 실현 가능성"과 "예산/스펙터클 비례성"을 통과하는지 평가하는 Review Agent 추가.

이 개발 계획 문서는 `cine-script-writer`를 가장 진보된 AI 시나리오 스튜디오로 발전시키는 청사진 역할을 합니다.
