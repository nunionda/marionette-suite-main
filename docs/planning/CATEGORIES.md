# 🎞️ Media Category Pipelines: AI Workflow Specifications

Based on industry standards, `cine-script-writer` 및 `DEVELOPMENT_PLAN.md`에 정의된 핵심 영화 엔진을 단편영화, 드라마, 광고 카테고리로 세분화하여 설계합니다.

---

## 🟢 Category 1: 단편영화 엔진 (Short Film Engine)
*핵심: 단일한 임팩트와 효율적인 서사.*

### ◾ 프로세스 상세 (Workflows)
1. **Concept Engine**: "단일한 갈등(Single Conflict)"이나 "강렬한 이미지(Thematic Image)"에 집중.
2. **Architect AI**: 캐릭터 시트를 1~2명의 주연으로 제한하며, 서브 플롯을 배제하여 서사 응집력 강화.
3. **Scenario Writer**: 
   - **목표 분량**: 5 - 20 Pages.
   - **구조**: 고밀도 3막 구조 (시발점 - 전환 - 매듭). 
   - **포맷**: 시각적 묘사 비중 확대 (대사 최소화).

---

## 🔵 Category 2: 넷플릭스 오리지널 시리즈 엔진 (Netflix Original Series Engine)
*핵심: 빈지워치(Binge-watch) 유발, 고밀도 서사, 글로벌 보편성.*

### ◾ 프로세스 상세 (Workflows)
1. **Binge-Hook Engine (Stage 1)**: 
   - 파일럿 에피소드의 오프닝 5분과 엔딩 클리프행어(Hook) 설계에 집중.
   - "다음 화 보기"를 누를 수밖에 없는 감정적/서사적 보상 체계 인입.
2. **Season Archive & Character Vault**: 
   - 6~10부작 시즌 전체의 아크를 통합 관리.
   - 캐릭터의 결핍과 욕망이 에피소드를 거치며 어떻게 변하는지 추적하는 '성장 곡선 데이터' 연동.
3. **Complex Plot Weaver**:
   - A, B, C 스토리라인의 교차 배치 및 '임팩트 모먼트(스토리 결합 지점)' 설계.
   - 비선형적 서사(플래시백/포워드) 제안 기능 포함.
4. **Scenario Writer (Premium)**:
   - **목표 분량**: 편당 45~60분 (유동적 분량 조절).
   - **스타일**: 전통적 브로드캐스트의 '기존 수사물(Procedural)' 스타일 배제. 시네마틱 미장센 지폭 확대.
   - **정보 전달**: 설명 중심의 대사(Info-dump)를 배제하고 시각적 단서로 세계관 노출.

---

## 🔴 Category 3: 광고/홍보 영상 엔진 (Commercial Engine)
*핵심: 전략적 메시지 전달 및 시각적 지시 정밀도.*

### ◾ 프로세스 상세 (Workflows)
1. **Strategic Engine (Stage 1)**: 로그라인을 대체. 입력 요소: USP (핵심 소구점), 타겟층, 분량(15/30/60s), CTA (Call to Action).
2. **A/V Architect (Stage 2)**: 트리트먼트를 대체하며, **2단 구성(Audio/Visual)** 테이블 형태로 설계.
3. **Scenario Writer**:
   - **포맷**: **Two-Column A/V Standard** (좌측: 영상 / 우측: 음성).
   - **제약 조건**: 초 단위 러닝 타임(TRT)에 맞춘 단어 수 및 호흡 제어.
   - **스타일**: 제품 배치(PPL) 및 카메라 구도(앵글)에 대한 극도의 디테일.

---

## 🛠️ 웹 대시보드 통합 계획 (UI Integration)
1. **카테고리 셀렉터**: 프로젝트 생성 시 3개 중 하나를 선택하도록 대시보드 UI 수정.
2. **에이전트 룰 로더**: 선택된 카테고리에 따라 `.agents/workflows/{category}.md` 규칙을 동적으로 주입.
3. **카테고리 특화 리뷰 에이전트**: 광고(ROI/소구점 체크), 드라마(시리즈 지속성), 단편(예술적 깊이)에 따른 맞춤형 피드백 제공.
