# 마리오네트 스튜디오 — AI 영상 제작 파이프라인 아키텍처

> 버전: v2.0 | 2026-03-19
> 실제 영화 제작 파이프라인을 기반으로 설계된 AI 에이전트 체계

---

## 파이프라인 전체 구조

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        🎬 PRE-PRODUCTION                                │
│                                                                         │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────┐   ┌─────────────┐  │
│  │Scripter  │ → │ConceptArtist │ → │Previsualizer │ → │CastingDir   │  │
│  │시나리오작가│   │컨셉아티스트   │   │프리비즈       │   │캐스팅디렉터  │  │
│  │          │   │              │   │              │   │             │  │
│  │대본→JSON  │   │스토리보드     │   │3D프리비즈     │   │캐릭터시트    │  │
│  │파싱      │   │이미지생성     │   │카메라블로킹    │   │레퍼런스보드   │  │
│  └──────────┘   └──────────────┘   └──────────────┘   └─────────────┘  │
│                                                                         │
│  ┌──────────────┐                                                       │
│  │LocationScout │                                                       │
│  │로케이션스카우트│                                                       │
│  │              │                                                       │
│  │배경레퍼런스   │                                                       │
│  │환경컨셉아트   │                                                       │
│  └──────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        🎥 MAIN PRODUCTION                               │
│                                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                │
│  │Cinematographer│ → │Generalist   │ → │AssetDesigner │                │
│  │촬영감독(DP)   │   │제너럴리스트  │   │에셋디자이너   │                │
│  │              │   │              │   │              │                │
│  │카메라설정     │   │AI비디오생성   │   │3D모델/프랍    │                │
│  │조명설계      │   │Veo3.0렌더링   │   │텍스처/머티리얼 │                │
│  │샷리스트      │   │푸티지생성     │   │환경에셋       │                │
│  └──────────────┘   └──────────────┘   └──────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        🎞️ POST-PRODUCTION                               │
│                                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                │
│  │VFXCompositor │ → │MasterEditor  │ → │Colorist      │                │
│  │VFX컴포지터   │   │편집감독       │   │컬러리스트     │                │
│  │              │   │              │   │              │                │
│  │합성/로토     │   │컷편집/구성    │   │컬러그레이딩   │                │
│  │매치무브      │   │FFMPEG병합     │   │LUT적용       │                │
│  │크로마키      │   │트랜지션       │   │톤매핑        │                │
│  └──────────────┘   └──────────────┘   └──────────────┘                │
│                                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                │
│  │SoundDesigner │ → │Composer      │ → │MixingEngineer│                │
│  │사운드디자이너 │   │작곡가         │   │믹싱엔지니어   │                │
│  │              │   │              │   │              │                │
│  │TTS더빙       │   │BGM/스코어    │   │최종오디오믹싱  │                │
│  │SFX/폴리      │   │AI작곡        │   │마스터링       │                │
│  │환경음        │   │Suno/Udio     │   │영상+음향합본   │                │
│  └──────────────┘   └──────────────┘   └──────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. PRE-PRODUCTION (기획/프리프로덕션)

> 촬영 전 모든 준비 작업. 대본 분석, 시각화, 캐릭터/환경 설계.

### 1.1 Scripter (시나리오 작가) ✅ 구현 완료
- **역할**: 완성된 마스터 씬 포맷 대본을 파싱하여 DirectionPlan JSON으로 변환
- **입력**: ep1_draft_v2.md + characters.json + outline.md
- **출력**: DirectionPlan JSON (씬별 image_prompt, video_prompt 포함)
- **API**: Gemini 2.5 Flash (구조화 출력)
- **파일**: `src/agents/scripter.py`

### 1.2 ConceptArtist (컨셉 아티스트) ✅ 구현 완료
- **역할**: 각 씬의 핵심 프레임을 스토리보드 이미지로 생성
- **입력**: DirectionPlan JSON → image_prompt
- **출력**: 씬별 PNG 이미지 (웹툰 스타일, 2.35:1 CinemaScope)
- **API**: Gemini 2.5 Flash Image (NanoBanana)
- **파일**: `src/agents/concept_artist.py`

### 1.3 Previsualizer (프리비주얼라이저) 🆕 신규
- **역할**: 스토리보드 이미지를 기반으로 카메라 블로킹 및 간단한 3D 프리비즈 생성
- **입력**: DirectionPlan JSON + 스토리보드 이미지
- **출력**: 프리비즈 영상 (낮은 해상도 카메라 무빙 시뮬레이션)
- **API**: Veo 3.0 (이미지→비디오, 저해상도 빠른 생성)
- **구현 상태**: 개발 예정

### 1.4 CastingDirector (캐스팅 디렉터) 🆕 신규
- **역할**: characters.json 기반으로 각 캐릭터의 비주얼 레퍼런스 시트 생성
- **입력**: characters.json → 외양 묘사, 캐스팅 참고배우
- **출력**: 캐릭터별 정면/측면/전신 레퍼런스 시트 이미지
- **API**: Gemini Flash Image (캐릭터 일관성 유지 프롬프트)
- **구현 상태**: 개발 예정

### 1.5 LocationScout (로케이션 스카우트) 🆕 신규
- **역할**: 각 씬의 배경(setting) 기반으로 환경 컨셉아트 및 레퍼런스 이미지 생성
- **입력**: DirectionPlan JSON → setting, time_of_day
- **출력**: 씬별 환경 컨셉아트 (배경 전용, 캐릭터 없이)
- **API**: Gemini Flash Image / Imagen 4
- **구현 상태**: 개발 예정

---

## 2. MAIN PRODUCTION (본 프로덕션/촬영)

> AI 비디오/3D 에셋 생성. 실제 촬영에 해당하는 단계.

### 2.1 Cinematographer (촬영 감독 / DP) 🆕 신규
- **역할**: DirectionPlan의 camera_angle을 분석하여 촬영 설정을 최적화하고 video_prompt를 강화
- **입력**: DirectionPlan JSON → camera_angle, setting, time_of_day
- **출력**: 강화된 video_prompt (조명 설계, 렌즈 선택, 카메라 무빙 디테일 추가)
- **API**: Gemini 2.5 Flash (텍스트 생성으로 프롬프트 리파이닝)
- **구현 상태**: 개발 예정

### 2.2 Generalist (제너럴리스트) ✅ 구현 완료
- **역할**: 최종 video_prompt를 기반으로 AI 비디오 클립 생성
- **입력**: DirectionPlan JSON → video_prompt (Cinematographer가 강화한 버전)
- **출력**: 씬별 MP4 비디오 클립 (8초)
- **API**: Veo 3.0 (비동기 폴링)
- **파일**: `src/agents/generalist.py`

### 2.3 AssetDesigner (에셋 디자이너) ⚠️ Mock
- **역할**: 캐릭터, 프랍, 환경의 3D 모델 생성
- **입력**: DirectionPlan JSON → character_settings, worldview_settings
- **출력**: 3D 모델 파일 (.obj/.glb)
- **API**: Meshy / Tripo3D (개발 예정)
- **파일**: `src/agents/asset_designer.py`

---

## 3. POST-PRODUCTION (후반 작업)

> 촬영된 영상의 편집, VFX, 사운드, 컬러 그레이딩.

### 3.1 VFXCompositor (VFX 컴포지터) ⚠️ Mock
- **역할**: CG 합성, 크로마키, 매치무브, 로토스코핑
- **입력**: 비디오 클립 + 3D 에셋
- **출력**: VFX 합성된 비디오
- **API**: OpenCV + FFMPEG (개발 예정)
- **파일**: `src/agents/vfx_compositor.py`

### 3.2 MasterEditor (편집 감독) ✅ 구현 완료
- **역할**: 비디오 클립을 순서대로 병합 (컷 편집)
- **입력**: output/videos/*.mp4
- **출력**: 하나의 마스터 MP4 파일
- **API**: FFMPEG (로컬)
- **파일**: `src/agents/master_editor.py`

### 3.3 Colorist (컬러리스트) 🆕 신규
- **역할**: 영상에 LUT 적용, 컬러 그레이딩, 톤 매핑
- **입력**: 마스터 MP4
- **출력**: 컬러 그레이딩된 최종 MP4
- **API**: FFMPEG LUT 필터 + Pillow (프레임 단위 처리)
- **구현 상태**: 개발 예정

### 3.4 SoundDesigner (사운드 디자이너) ✅ 구현 완료
- **역할**: 대사(Dialogue) TTS 생성, SFX/폴리 설계
- **입력**: DirectionPlan JSON → dialogue
- **출력**: 씬별 대사 WAV 파일
- **API**: Gemini TTS (PCM→WAV 변환)
- **파일**: `src/agents/sound_designer.py`

### 3.5 Composer (작곡가) 🆕 신규
- **역할**: global_audio_concept + 씬별 [Audio] 태그 기반으로 BGM/스코어 생성
- **입력**: DirectionPlan JSON → global_audio_concept, video_prompt의 [Audio] 태그
- **출력**: BGM 트랙 (MP3/WAV)
- **API**: Suno v4.5 / Udio (개발 예정)
- **구현 상태**: 개발 예정

### 3.6 MixingEngineer (믹싱 엔지니어) 🆕 신규
- **역할**: 대사 + BGM + SFX를 최종 믹싱, 비디오와 오디오 합본
- **입력**: 마스터 MP4 + 대사 WAV + BGM + SFX
- **출력**: 최종 영상 (비디오 + 오디오 합본 MP4)
- **API**: FFMPEG (오디오 스트림 머지)
- **구현 상태**: 개발 예정

---

## 에이전트 요약 (13명의 AI 크루)

| # | 단계 | 에이전트 | 한국어 | 상태 | API |
|---|------|---------|--------|------|-----|
| 1 | PRE | Scripter | 시나리오 작가 | ✅ 완료 | Gemini Flash |
| 2 | PRE | ConceptArtist | 컨셉 아티스트 | ✅ 완료 | Gemini Flash Image |
| 3 | PRE | Previsualizer | 프리비주얼라이저 | 🆕 예정 | Veo 3.0 |
| 4 | PRE | CastingDirector | 캐스팅 디렉터 | 🆕 예정 | Gemini Flash Image |
| 5 | PRE | LocationScout | 로케이션 스카우트 | 🆕 예정 | Gemini Flash Image |
| 6 | MAIN | Cinematographer | 촬영 감독 | 🆕 예정 | Gemini Flash |
| 7 | MAIN | Generalist | 제너럴리스트 | ✅ 완료 | Veo 3.0 |
| 8 | MAIN | AssetDesigner | 에셋 디자이너 | ⚠️ Mock | Meshy (예정) |
| 9 | POST | VFXCompositor | VFX 컴포지터 | ⚠️ Mock | OpenCV (예정) |
| 10 | POST | MasterEditor | 편집 감독 | ✅ 완료 | FFMPEG |
| 11 | POST | Colorist | 컬러리스트 | 🆕 예정 | FFMPEG LUT |
| 12 | POST | SoundDesigner | 사운드 디자이너 | ✅ 완료 | Gemini TTS |
| 13 | POST | Composer | 작곡가 | 🆕 예정 | Suno (예정) |
| 14 | POST | MixingEngineer | 믹싱 엔지니어 | 🆕 예정 | FFMPEG |

**완료: 5 / Mock: 2 / 신규 개발 예정: 7**

---

## 데이터 플로우

```
[대본.md] → Scripter → [DirectionPlan.json]
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
    ConceptArtist      CastingDirector    LocationScout
    [storyboard.png]   [character_sheet]  [location_ref]
           │
           ▼
    Previsualizer → [previs.mp4]
           │
           ▼
    Cinematographer → [enhanced_video_prompt]
           │
           ▼
    Generalist → [scene_XXX.mp4]      AssetDesigner → [3d_assets]
           │                                │
           ▼                                ▼
    VFXCompositor → [vfx_scene_XXX.mp4]
           │
           ▼
    MasterEditor → [master.mp4]        Colorist → [graded.mp4]
           │                                │
           ▼                                ▼
    SoundDesigner → [dialogue.wav]     Composer → [bgm.wav]
           │                                │
           └────────────┬───────────────────┘
                        ▼
                 MixingEngineer → [FINAL_OUTPUT.mp4]
```

---

## 참고 자료

- [7 Stages of Film Production - Celtx](https://blog.celtx.com/stages-of-film-production/)
- [VFX Pipeline Stages - LucidLink](https://www.lucidlink.com/blog/vfx-pipeline)
- [AI Filmmaking Pipeline 2026 - DeepFiction](https://www.deepfiction.ai/blog/ai-filmmaking-pipeline-script-to-screen-2026)
- [Film Crew Hierarchy - Assemble](https://www.onassemble.com/blog/the-definitive-film-crew-hierarchy-chart)
