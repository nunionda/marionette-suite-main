# 🛠️ Implementation Plan: Cinematic Engine v2.0 (UI & Narrative Integration)

기존 코어 엔진을 넘어 미디어 카테고리, 장르 모듈, 고도화 서사 전략을 웹 UI에 통합하기 위한 기술 구현 계획입니다.

---

## 🏗️ 아키텍처 변경 및 신규 기능

### 1. 프로젝트 설정 UI 고도화 [MOD]
- **대상**: `src/components/Dashboard.jsx` (프로젝트 생성 모달)
- **기능**: **카테고리 선택(단편/넷플릭스/광고)** 및 **장르 선택(스릴러/드라마/SF/코미디)** 드롭다운 추가.
- **구현**: 생성된 프로젝트 메타데이터에 `category`, `genre` 값을 할당.

### 2. 동적 규칙 주입 로직 (Rule Injection) [NEW]
- **대상**: `src/hooks/useAgentEngine.js`
- **기능**: `getRules(category, genre)` 유틸리티 함수 구현.
- **로직**: 선택된 카테고리와 장르에 해당하는 규칙 파일을 `.agents/rules/`에서 읽어와 마스터 씬의 시스템 프롬프트에 실시간 주입.

### 3. 어드밴스드 서사 컨트롤 패널 [NEW]
- **대상**: `src/components/ProjectDetail.jsx`
- **기능**: 
  - **Binge-Hook Toggle**: 에피소드 엔딩에서 클리프행어 생성을 강제하는 옵션.
  - **Cliché Subversion Slider**: 클리셰 타파 강도(낮음/중간/높음) 조절.
- **UI**: 사이드바 하단에 택티컬 스타일의 토글 스위치 배치.

---

## 🛠️ 단계별 구현 로직

1. **규칙 파일 구조화**: 
   - `CATEGORIES.md`, `GENRES.md`, `CLICHE_STRATEGY.md`의 내용을 개별 파일로 분산하여 AI가 읽기 쉬운 형태로 정제.
2. **데이터 스키마 확장**: 
   - `project.json` 등의 저장 구조에 카테고리 및 장르 필드 추가.
3. **UI 컴포넌트 개발**: 
   - 프로젝트 생성 시 카테고리별 아이콘과 설명을 포함한 셀렉션 UI 개발.
   - `ProjectDetail` 페이지에 '서사 설정' 패널 추가.
4. **에이전트 프롬프트 리팩토링**: 
   - `generateScenario` 함수를 카테고리별 템플릿(예: 광고용 2-Column Template)을 사용하도록 수정.

---

## ✅ 검증 계획 (Verification)

### 자동화 테스트
- [ ] '넷플릭스 + SF' 모드 선택 시, 실제로 송출되는 프롬프트에 '클리프행어'와 '세계관 구축' 키워드가 포함되는지 검증.

### 수동 테스트
- [ ] '광고' 카테고리 프로젝트 생성 후, 결과물이 **2단 구성(A/V Table)** 표준 포맷으로 출력되는지 확인.
- [ ] '넷플릭스 오리지널' 파일럿 작성 시, S#1의 오프닝 훅이 기획안에 따라 생성되는지 확인.
