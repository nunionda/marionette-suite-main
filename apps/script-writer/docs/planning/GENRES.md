# 🎭 Genre Modules: Narrative Logic & Tone Guides

`cine-script-writer`는 카테고리(단편/드라마/광고) 위에 **장르 모듈**을 중첩하여 에이전트의 문체와 서사 전략을 제어합니다.

---

## 🔪 1. 스릴러/액션 모듈 (Thriller & Action)
*핵심: 긴장감 유지, 점진적 폭로, 택티컬 텐션.*

### ◾ 에이전트 전략
- **Pacing**: 짧고 간결한 문장(Action Lines)을 사용하여 물리적 박동감 구현.
- **Suspense**: '정보의 비대칭성'을 활용. 관객은 알지만 인물은 모르는(Dramatic Irony) 씬 설계.
- **Action**: 동작의 디테일(눈의 움직임, 호흡, 금속의 마찰음)을 강조하는 미장센 지폭.
- **Standard**: 씬의 끝을 항상 '질문'이나 '위협'으로 마쳐 다음 씬으로의 전환(Hook) 강화.

---

## 🫂 2. 휴먼 드라마 모듈 (Human Drama)
*핵심: 서브텍스트, 감정적 여운, 일상의 미학.*

### ◾ 에이전트 전략
- **Dialogue**: 말하지 않아도 느껴지는 '함축적 의미(Subtext)' 위주의 대사 구성.
- **Rhythm**: 침묵(Pause)과 지문(Beat)을 활용하여 대사 사이의 감량 공백 설계.
- **Theme**: 캐릭터의 내면적 결핍과 보편적인 인간관계(가족, 상실, 성장)의 연결성 강조.
- **Style**: 인디/예술 영화 스타일의 정적인 미장센 및 인물의 표정 묘사 집중.

---

## 🛸 3. SF/미스테리 모듈 (SF & Mystery)
*핵심: 논리적 세계관, 비일상적 경이로움, 윤리적 딜레마.*

### ◾ 에이전트 전략
- **World-Building**: 기술적 개연성과 사회적 파장을 결합한 '구체적인 세계관' 설정 주입.
- **Brain-teasing**: 복선(Foreshadowing)과 반전(Twist)의 논리적 배치.
- **Cinematics**: 거대 건축물, 진보된 기술, 이질적인 생명체 등 비주얼 임팩트 중심의 묘사.
- **Dialogue**: 전문 용어와 일상어의 적절한 배합 (Tech-Speak balance).

---

## 🤡 4. 코미디/풍자 모듈 (Comedy & Satire)
*핵심: 아이러니, 타이밍, 셋업-페이오프.*

### ◾ 에이전트 전략
- **Timing**: 대사와 행동의 충돌(Slapstick) 또는 기대의 배반(Irony)을 통한 웃음 유발.
- **Persona**: 인물의 과장된 단점이나 독특한 말버릇(Catchphrase) 부각.
- **Structure**: 3단 반복(Rule of Three) 및 셋업-페이오프 시스템 적용.
- **Tone**: 촌철살인의 풍자(Satire) 또는 따뜻한 일상 유머(Sitcom style) 선택적 적용.

---

## 🛠️ 장르 엔진 구현 계획 (Integration Area)
1. **Genre System Prompts**: 각 장르별 스타일 가이드를 `.agents/rules/genre/` 하위에 분산 배치.
2. **Dynamic Prompt Injection**: 프로젝트 생성 시 선택한 장르 규칙을 `Scenario Writer` 에이전트의 컨텍스트에 실시간 주입.
3. **Tone Consistency API**: 전체 시나리오의 톤 앤 매너가 선택한 장르에서 이탈하지 않는지 감시하는 'Tone Guardian' 로직 구현.
