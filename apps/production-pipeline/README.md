# 마리오네트 스튜디오 파이프라인: AI 크리에이티브 디렉터 🎬

이 프로젝트는 마리오네트 스튜디오(Marionette Studios)의 **완전 자동화 AI 기반 특수영상 제작 파이프라인**을 구축하기 위한 첫 번째 코어 모듈, **'AI 크리에이티브 디렉터(AI Creative Director)'** 에이전트 시스템입니다.

## 🎯 개발 목표

비전문가나 일반 사용자가 한 줄의 짧은 "아이디어 시놉시스"만 입력해도, 이를 기반으로 **완벽한 서사 구조를 갖춘 기획안(Storyboard)**을 도출하고, 다운스트림 AI 제너럴리스트(영상 생성기)들이 바로 사용할 수 있는 **최적화된 영문 프롬프트(Image & Video Prompt)**를 자동으로 생성하는 AI 직원을 고용(개발)하는 것입니다.

이 시스템은 이후 개발될 'AI 컨셉 아티스트', 'AI 제너럴리스트', 'AI 작곡가' 모듈 등과 완전한 연동을 목표로 설계된 **데이터의 출발점(Data Source)**입니다.

---

## ✅ 현재 개발 완료된 부분 (Core Features)

1. **AI 에이전트 핵심 로직 구현 완료 (`script_writer.py`)**
   - 최신 LLM(Gemini 2.5 Flash)을 엔진으로 사용하여 빠른 속도와 저렴한 비용으로 대본 작성.
   - Pydantic을 이용한 **구조화된 출력(Structured JSON Output)** 적용. 씬(Scene)별로 컷 분류, 행동 묘사, 대사, AI 생성용 프롬프트를 정확히 파싱.

2. **Google 웹 검색 기반 리서치 모듈 연동 (`search.py`)**
   - 아이디어(예: "티니핑 4면 전시")가 주어지면, 스토리보드를 짜기 전 Gemini Grounding Tool을 활용해 **인터넷에서 고유 세계관, 캐릭터 특징 타겟(IP)을 사전 리서치**합니다.
   - 확보된 컨텍스트(Context)를 메인 프롬프트에 주입하여, 할루시네이션 없는 정확한 기획안을 도출합니다.

3. **최신 탑티어 AI 영상 생성기 맞춤형 프롬프트 공식 적용 (`prompts.py`)**
   - **이미지 렌더링용 [NanoBanana 2 (Gemini Flash Image)] 최적화:** `주제+행동+배경+카메라+스타일`의 5단 완벽 서술형 영어 문장 적용.
   - **비디오 렌더링용 [Veo 3.1 & Sora] 최적화:** 6단 구조 서술형 문장 적용 및 매 씬마다 싱크를 위한 `[Audio] 환경음/BGM 지정` 필수 태그 적용 완료.

4. **결과물 자동 파일 저장 모듈 (`file_io.py`)**
   - 사람(기획자)이 읽기 편한 Markdown 리포트와, 다음 AI 에이전트(코드)가 읽기 편한 파이프라인 연동용 JSON 데이터를 동시에 생성하여 `output/` 폴더에 저장합니다.

---

## 🛠 시스템 사용 설명 (Getting Started)

### 1. 사전 준비 (Prerequisites)
- Python 3.9+ 및 가상환경(venv)
- 구글 Gemini API Key 발급
- 프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 아래와 같이 키를 입력합니다.
  ```env
  Gemini_Api_Key=당신의_API_키
  ```

### 2. 가상환경 세팅 및 실행
가상환경을 활성화하고 메인 코드를 실행합니다.

```bash
# 1. 프로젝트 폴더로 이동
cd /Users/daniel/dev/marionette-dev/production_pipeline

# 2. 파이썬 가상환경 활성화
source venv/bin/activate

# (선택) 필요한 패키지 설치
pip install -r requirements.txt

# 3. 크리에이티브 디렉터 엔진 실행!
python main.py --idea "여기에 원하시는 영상 기획 아이디어를 입력하세요"
```

### 3. 파이프라인 활용 (직군별 실행)
터미널에서 `--step` 옵션으로 파이프라인에 참여할 직군을 제어할 수 있습니다. 각 에이전트는 직전 단계의 산출물(JSON 파일)을 필요로 합니다.

```bash
# 1. AI 시나리오 작가(Scriptwriter): 기획안 텍스트 및 JSON 데이터 도출
python main.py --step scriptWriter --idea "주제 입력"

# 2. AI 컨셉 아티스트(Concept Artist): JSON 기획안으로 스토리보드 이미지 생성
python main.py --step conceptArtist --input "output/plans/direction_plan_XXX.json"

# 3. AI 제너럴리스트(Generalist): 컨셉 아트를 바탕으로 비디오 푸티지 생성
python main.py --step generalist --input "output/plans/direction_plan_XXX.json"

# 4. AI 에셋 디자이너(Asset Designer): 3D 프랍 및 모델 생성
python main.py --step assetDesigner --input "output/plans/direction_plan_XXX.json"

# 5. AI VFX 컴포지터(VFX Compositor): 특수효과 및 매치무브 합성
python main.py --step vfxCompositor --input "output/plans/direction_plan_XXX.json"

# 6. AI 마스터 에디터(Master Editor): 컷 편집 및 컬러 그레이딩
python main.py --step masterEditor --input "output/plans/direction_plan_XXX.json"

# 7. AI 사운드 디자이너(Sound Designer): TTS 더빙 및 BGM/SFX 믹싱
python main.py --step soundDesigner --input "output/plans/direction_plan_XXX.json"

# 8. 풀 파이프라인(Orchestrator) 원스톱 가동! (위 7단계를 모두 자동 순차 실행)
python main.py --step all --idea "주제 입력"
```

### 4. 결과물 확인
실행 후 터미널에 `✅ 스토리보드 생성 완료!` 또는 완료 메시지가 뜨면, `production_pipeline/output/` 서브 폴더들을 확인하세요.
- `output/plans/direction_plan_YYYYMMDD_HHMMSS.md`: 한눈에 볼 수 있는 깔끔한 제작 기획서.
- `output/plans/direction_plan_YYYYMMDD_HHMMSS.json`: 다음 AI 작업자에게 그대로 넘길 수 있는 파이프라인 연동용 데이터 형식.
- `output/storyboards/`: 컨셉 아티스트가 생성한 씬별 스토리보드 이미지 파일.

---

## 🔮 넥스트 파이프라인 (Next Steps)
- 본 에이전트의 JSON 결과물을 인풋으로 받아 캐릭터 시트 영상을 제작하는 **'AI 컨셉 아티스트 (NanoBanana 2 연동)'** 모듈 개발 예정.
