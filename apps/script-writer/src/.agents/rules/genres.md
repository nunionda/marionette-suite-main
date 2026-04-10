# 🎭 Genre Modules: Narrative Logic & Tone Guides

`cine-script-writer`는 카테고리(단편/드라마/광고) 위에 **장르 모듈**을 중첩하여 에이전트의 문체와 서사 전략을 제어합니다.

---

## 🔪 1. 스릴러/액션 모듈 (Thriller & Action)
*핵심: 긴장감 유지, 점진적 폭로, 택티컬 텐션.*

### ◾ 전술적 연출 기법 (Tactical Cues)
- **Visual**: 셰이키 캠(Shaky Cam), 더치 틸트(Dutch Tilt - 불안감 조성), 로우 앵글(위협적).
- **Sound**: 벌떼 같은 웅웅거림(Drones), 고주파 음, 갑작스러운 정적.
- **Editing**: 점프 컷(Jump Cut), 극단적인 클로즈업(BCU)을 통한 폐쇄공포증 유발.

---

## 🫂 2. 휴먼 드라마 모듈 (Human Drama)
*핵심: 서브텍스트, 감정적 여운, 일상의 미학.*

### ◾ 에이전트 전략
- **Dialogue**: 말하지 않아도 느껴지는 '함축적 의미(Subtext)' 위주의 대사 구성.
- **Rhythm**: 침묵(Pause)과 지문(Beat)을 활용하여 대사 사이의 감정적 공백 설계.
- **Theme**: 캐릭터의 내면적 결핍과 보편적인 인간관계(가족, 상실, 성장)의 연결성 강조.

### ◾ 전술적 연출 기법 (Tactical Cues)
- **Visual**: 딥 포커스(Deep Focus - 인물과 배경의 관계), 핸드헬드(자연스러운 일상성), 부드러운 자연광.
- **Sound**: 일상 소음(앰비언스), 인물의 거친 숨소리, 절제된 선율.
- **Editing**: 롱 테이크(Long Take), 한 박자 느린 씬 전환.

---

## 🛸 3. SF/미스테리 모듈 (SF & Mystery)
*핵심: 논리적 세계관, 비일상적 경이로움, 윤리적 딜레마.*

### ◾ 에이전트 전략
- **World-Building**: 기술적 개연성과 사회적 파장을 결합한 '구체적인 세계관' 설정 주입.
- **Brain-teasing**: 복선(Foreshadowing)과 반전(Twist)의 논리적 배치.
- **Cinematics**: 거대 건축물, 진보된 기술 등 비주얼 임팩트 중심의 묘사.

### ◾ 전술적 연출 기법 (Tactical Cues)
- **Visual**: 와이드 샷(Wide Shot - 거대 세계관), 네온 컬러 대비, 대칭적인 구도(Symmetry).
- **Sound**: 신디사이저, 전자적 노이즈, 인위적인 리버브.
- **Editing**: 교차 편집(Cross-cutting - 복선 회수용), 몽타주.

---

## 🤡 4. 코미디/풍자 모듈 (Comedy & Satire)
*핵심: 아이러니, 타이밍, 셋업-페이오프.*

### ◾ 에이전트 전략
- **Timing**: 대사와 행동의 충돌(Slapstick) 또는 기대의 배반(Irony)을 통한 웃음 유발.
- **Persona**: 인물의 과장된 단점이나 독특한 말버릇(Catchphrase) 부각.
- **Structure**: 3단 반복(Rule of Three) 및 셋업-페이오프 시스템 적용.

### ◾ 전술적 연출 기법 (Tactical Cues)
- **Visual**: 밝고 화사한 톤, 빠른 팬(Pan) 무빙, 정면 응시(Breaking 4th wall).
- **Sound**: 과장된 효과음, 경쾌한 리듬, 대사와 대비되는 엉뚱한 BGM.
- **Editing**: 빠른 템포의 컷 전환, 돌발적인 씬 종료(Anticlimax).

---

## 🛠️ 장르 엔진 구현 계획 (Integration Area)
1. **Genre System Prompts**: 각 장르별 스타일 가이드를 `.agents/rules/genre/` 하위에 분산 배치.
2. **Dynamic Prompt Injection**: 프로젝트 생성 시 선택한 장르 규칙을 `Scenario Writer` 에이전트의 컨텍스트에 실시간 주입.
3. **Tone Consistency API**: 전체 시나리오의 톤 앤 매너가 선택한 장르에서 이탈하지 않는지 감시하는 'Tone Guardian' 로직 구현.
