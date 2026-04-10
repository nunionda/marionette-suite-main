# 📚 Screenwriting Masters: Methodology Research

세계적인 시나리오 작법서들의 핵심 구조와 이론을 데이터화하여 본 프로젝트의 AI 엔진 고도화 지표로 활용합니다.

---

## 1. Syd Field - *Screenplay: The Foundations of Screenwriting*
**핵심 개념: 패러다임 (The Paradigm / 3막 구조)**

- **구조**: Act I (Setup), Act II (Confrontation), Act III (Resolution).
- **구성 요소**: 
    - **Plot Point 1 (p.25-30)**: 주인공이 본격적인 여정에 오르는 지점.
    - **Midpoint (p.60)**: 이야기의 방향이 크게 전환되는 지점.
    - **Plot Point 2 (p.85-90)**: 절정으로 향하는 마지막 관문.
- **특이점**: 시나리오는 단순히 '이야기'가 아니라 '구조'라는 점을 강조.

## 2. Robert McKee - *Story: Style, Structure, Substance, and the Principles of Screenwriting*
**핵심 개념: 가치 변화 (Value Change) & 대항 세력 (Antagonism)**

- **구조**: 사건(Event) ➔ 씬(Scene) ➔ 비트(Beat) ➔ 시퀀스(Sequence) ➔ 장(Act) ➔ 총체(Whole).
- **구성 요소**: 
    - **Value Change**: 모든 씬은 인물의 상태가 (+ ➔ -) 또는 (- ➔ +)로 변화해야 함. 변화가 없으면 죽은 씬.
    - **Antagonism**: 주인공의 의지를 꺾는 대항 세력의 깊이가 이야기의 질을 결정.
- **특이점**: 상투성(Cliché) 타파와 '서브텍스트'의 중요성을 매우 강조.

## 3. Blake Snyder - *Save the Cat!*
**핵심 개념: 15-Beat Sheet (데이터 기반의 흥행 공식)**

- **주요 비트**:
    1. **Opening Image**: 주제를 시각적으로 압축한 시작 장면.
    2. **Theme Stated**: 이야기의 주제가 대사로 직접 언급됨 (주인공은 못 알아들음).
    3. **Catalyst**: 일상의 균열 (Inciting Incident).
    4. **Fun and Games**: 관객이 기대한 '장르적 재미'가 극대화되는 구간.
    5. **All Is Lost / Dark Night of the Soul**: 주인공의 처참한 실패와 자아 성찰.
- **특이점**: 110페이지 기준 페이지 수까지 정확히 할당하는 극도의 상업적 수치화.

## 4. John Yorke - *Into the Woods*
**핵심 개념: 대칭 구조 (Symmetry) & 프랙탈 (Fractals)**

- **구조**: 5막 구조 (Act I Home ➔ Act II Woodland ➔ Act III The Forest ➔ Act IV Road Back ➔ Act V Home Again).
- **구성 요소**: 
    - **Fractal**: 씬 하나가 전체 이야기의 구조를 거울처럼 보여주어야 함.
- **특이점**: 모든 이야기는 인간 본성의 심리학적 변화 과정을 반영한다는 철학적 접근.

---

## 🔍 Cross-Verification with `DEVELOPMENT_PLAN.md`

| 항목 | 현재 개발 계획 | 베스트셀러 기준 | 차이점 및 보완 필요성 |
| :--- | :--- | :--- | :--- |
| **구조** | 3막 8시퀀스 | 15-Beat (Snyder) / 5막 (Yorke) | 8시퀀스는 적절하나, 15비트로 씬 배분을 더 세분화해야 함 |
| **씬 품질** | 미장센/텐션 중심 | Value Change (McKee) | 씬마다 인물의 가치 변화(+/-)를 체크하는 로직 추가 필요 |
| **주제 의식** | 로그라인 단계 | Theme Stated (Snyder) | 초반 5분 내 주제를 명시적으로 흘리는 패턴 주입 필요 |
| **캐릭터** | 가치관/결핍 | Antagonism (McKee) | 주인공의 욕망만큼 대항 세력(악역)의 철학적 깊이 강화 필요 |
