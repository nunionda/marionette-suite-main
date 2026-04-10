# Project: AI Cinema Lab
이 프로젝트는 안티그래비티 워크플로우를 활용한 영화 시나리오 전문 집필 환경입니다.

## 🎬 Integrated Cinema Engine Workflow
본 프로젝트는 4개의 핵심 모듈이 유기적으로 결합되어 작동합니다:

1.  **Logline Engine** ([loglineMaker.md](file:///Users/daniel/dev/antigravity-dev/marionette-dev/project/.agents/rules/loglineMaker.md)): 사용자의 초기 아이디어를 하이 컨셉 로그라인으로 정제합니다.
2.  **Style Guide** ([style_guide.md](file:///Users/daniel/dev/antigravity-dev/marionette-dev/project/.agents/rules/style_guide.md)): 글로벌 영화 표준 스타일의 톤앤매너와 미장센 규격을 정의합니다.
3.  **Scenario Writer** ([scenario_writer.md](file:///Users/daniel/dev/antigravity-dev/marionette-dev/project/.agents/workflows/scenario_writer.md)): 정제된 로그라인과 스타일 가이드를 바탕으로 실제 시나리오를 집필합니다.
4.  **Research Database** (`./survey/`): 실제 사이버 범죄 사건, 북한 해커 조직(라자루스 등) 정보, 최신 해킹 기술 조사를 바탕으로 캐릭터 설정과 사건의 **사실적 근거(Fact-base)**를 제공합니다.

---

### 어떻게 시작하나요?
1. 안티그래비티 터미널 혹은 채팅창에 다음 형식을 입력하세요: 
   > 제목: [제목]
   > 장르: [장르]
   > 로그라인: "[주인공]이 [사건]으로 인해 [목표]를 이루기 위해 [갈등]을 해결해 나가는 이야기"
   > 지침: 상업 영화 표준 규격(Master Scene Format)을 준수하고,

2. 에이전트가 다음 순서에 따라 작업을 수행합니다:
   - **Step 1**: `loglineMaker.md`를 사용하여 로그라인을 '하이 컨셉'으로 업그레이드.
   - **Step 2**: 에이전트 스스로 `./survey/` 폴더 내의 리서치 자료를 분석하여, 사건 전개와 캐릭터 설정의 **사실적 개연성과 디테일**을 확보.
   - **Step 3**: `scenario_writer.md` Phase 1~3를 실행하여 기획안, 캐릭터(`characters.json`), 씬 로그(`scene_logs_150.md`) 생성.
   - **Step 4**: `style_guide.md`를 참조하여 `scenario_writer.md` Phase 4의 본 집필(5씬 단위) 시작.

### 🎥 Production Standards
- **Global Production Standard**: 영화의 각 시퀀스는 강렬한 오프닝과 결말로 구성. GLOBAL 보편적 감정 + 특수한 택티컬 디테일의 교차.
- **Tactical Tension**: 사실적이고 긴박한 액션 및 테크 요소 묘사.
- **Mise-en-scène**: 대비 및 시각적 상징성을 지문에 적극 반영.

---
> **Tip**: 시나리오 작성 시, 반드시 씬별 1줄 로그가 포함된 `scene_logs_150.md`를 기반으로 일관성을 유지하세요.

