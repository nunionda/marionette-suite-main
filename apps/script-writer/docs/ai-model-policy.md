# AI 모델 정책 & 주간 업데이트 플랜

> **정책:** 개발 중 = 무료 모델만. 최종 완성 후 = 유료 전환.  
> **마지막 업데이트:** 2026-04-12 | **다음 리뷰:** 2026-04-19

---

## 1. 텍스트 (LLM)

### 무료 → 유료 전환 맵

| 무료 (개발 중) | → | 유료 (출시 후) | 시나리오 |
|--------------|---|-------------|---------|
| `google/gemini-2.5-flash` | → | `claude-sonnet-4-5` | 한국어 창작, 장편 시나리오 |
| `google/gemini-2.5-flash` | → | `claude-opus-4-5` | 최고 품질 필요 시 (검토, 최종 정제) |
| `groq/llama-3.3-70b-versatile` | → | `claude-haiku-4-5-20251001` | JSON 파이프라인, 빠른 초안 |
| `google/gemini-2.5-flash` | → | `gpt-4o` | 영문 광고 카피, 멀티모달 |

### 개발 중 활성 폴백 체인 (`server/src/ai.ts`)

```
google/gemini-2.5-flash
→ google/gemini-2.0-flash-001
→ google/gemini-2.0-flash-lite-001
→ groq/llama-3.3-70b-versatile
→ (502 에러)
```

### 출시 후 활성 폴백 체인

```
google/gemini-2.5-flash (무료 우선)
→ anthropic/claude-3-5-sonnet (유료, 고품질)
→ anthropic/claude-haiku-4-5 (유료, 빠름)
→ groq/llama-3.3-70b-versatile (무료, 긴급 폴백)
```

---

## 2. 이미지 생성

### artificialanalysis.ai ELO 리더보드 (2026-04-12 기준)

> 출처: [artificialanalysis.ai/image/leaderboard/text-to-image](https://artificialanalysis.ai/image/leaderboard/text-to-image) — 블라인드 사용자 투표 기반 ELO 점수

| 순위 | 모델 (공식명) | 벤치마크 별칭 | ELO | 유형 | 특이사항 |
|-----|-------------|------------|-----|------|---------|
| #1 | **GPT Image 1.5 (high)** | GPT 1.5 | 1265 | 유료 (OpenAI) | 텍스트 포함 이미지 최강 |
| #2 | **Gemini 3.1 Flash Image Preview** | 나노바나나2 | 1258 | Google (무료 추정) | Gemini Pro 3.0 Flash 변형, API 무료 티어 확인 필요 |
| #3 | **Gemini 3 Pro Image** | 나노바나나 프로 | 1215 | Google (유료) | Gemini Pro 3.0 풀 버전, 최고품질 |
| #4 | **FLUX.2 [max]** | — | 1201 | 유료 (Black Forest Labs) | 시네마틱 구도 우수 |
| #5 | **Seedream 4.0** | — | 1185 | 유료 (ByteDance) | 아시아 스타일 우수 |
| OSS #1 | **FLUX.2 [dev] Turbo** | — | 1163 | 오픈소스 | 무료 self-host 가능 |

### 무료 → 유료 전환 맵

| 무료 (개발 중) | API 엔드포인트 | → | 유료 (출시 후) | 시나리오 |
|--------------|-------------|---|-------------|---------|
| **Pollinations.ai** | `https://image.pollinations.ai/prompt/{text}` | → | **GPT Image 1.5** | 광고 텍스트 포함 이미지 (ELO #1) |
| **Gemini 3.1 Flash Image Preview** | Gemini API 무료 티어 | → | **Gemini 3 Pro Image** | 시네마틱 스토리보드 (ELO #3) |
| **Pollinations.ai** | 무료 | → | **FLUX.2 [max]** | 영화적 구도 고품질 (ELO #4) |
| **Stable Diffusion 3.5** | fal.ai 무료 티어 | → | **Seedream 4.0** | 아시아·한국 콘텐츠 (ELO #5) |
| **Pollinations.ai** | 무료 | → | **Imagen 4 (Google)** | 고해상도 제품샷 |

### 무료 모델 상세

| 모델 | 엔드포인트 | ELO/품질 | 제한 |
|------|-----------|---------|------|
| **Gemini 3.1 Flash Image Preview** | Gemini API 무료 티어 | ELO 1258 ★★★★★ | 무료 티어 한도 (확인 필요) |
| **Pollinations.ai** | `https://image.pollinations.ai/prompt/{encoded_text}?width=800&height=450` | ★★★☆☆ | 없음 (광고 워터마크) |
| **FLUX.2 [dev] Turbo** | fal.ai / HuggingFace | ELO 1163 ★★★★☆ | self-host 가능, 무료 |
| **Flux Schnell** | fal.ai / Replicate 무료 티어 | ★★★★☆ | 월 일정 크레딧 |
| **Stable Diffusion 3.5 Medium** | `https://fal.run/fal-ai/stable-diffusion-v35-medium` | ★★★☆☆ | fal.ai 무료 티어 |

### 유료 모델 상세 (출시 후)

| 시나리오 | 모델 | ELO | 프로바이더 | 가격 | 특징 |
|---------|------|-----|---------|------|------|
| **광고 텍스트 포함 이미지** | GPT Image 1.5 | 1265 | OpenAI API | 미정 | **ELO 1위.** 텍스트 렌더링 최고, GPT 통합 |
| **시네마틱 스토리보드** | Gemini 3 Pro Image | 1215 | Google AI / Vertex | 미정 | **ELO 3위.** 나노바나나 프로 |
| **고품질 영화적 구도** | FLUX.2 [max] | 1201 | Black Forest Labs / fal.ai | 미정 | **ELO 4위.** Flux 최상위 티어 |
| **아시아·한국 콘텐츠** | Seedream 4.0 | 1185 | ByteDance / fal.ai | 미정 | **ELO 5위.** 아시아 스타일 우수 |
| **고해상도 제품샷** | Imagen 4 | — | Google Vertex AI | $0.04–0.10/장 | 장문 프롬프트 지원, 포토리얼 |
| **광고 인물 사진** | Flux Pro 1.1 | — | Replicate | $0.055/장 | 인물 사실감, 다양한 인종 표현 |
| **빠른 썸네일 이터레이션** | Flux Schnell | — | fal.ai | $0.003/장 | 초당 1–2장, 컨셉 테스트용 |

> **주의:** Midjourney는 REST API 없음 → 제외  
> **나노바나나2** = Gemini 3.1 Flash Image Preview (artificialanalysis.ai 별칭) — Gemini Pro 3.0 계열 Flash 변형  
> **나노바나나 프로** = Gemini 3 Pro Image (artificialanalysis.ai 별칭) — Gemini Pro 3.0 풀 버전  
> **GPT 1.5** = GPT Image 1.5 (high) by OpenAI — 현재 ELO 1위 (2026-04-12)

---

## 3. 비디오 생성

### 무료 → 유료 전환 맵

| 무료 (개발 중) | → | 유료 (출시 후) | 시나리오 |
|--------------|---|-------------|---------|
| **Pika 2.0 무료 티어** | → | **Runway Gen-4.5** | 광고 영상, 시네마틱 클립 |
| **HuggingFace AnimateDiff** | → | **Veo 3.1 (Google)** | 포토리얼 장면 |
| **Luma Dream Machine 무료** | → | **Kling AI 2.0** | YouTube 쇼츠, SNS 쇼트폼 |
| **HuggingFace AnimateDiff** | → | **Seedance 2.0** | 한국어 프롬프트 이해, 아시아 콘텐츠 |

> ⚠️ **Sora 종료 확정 (2026-03-24 발표):** 웹앱 2026-04-26, API 2026-09-24 종료. → **대체: Runway Gen-4.5 또는 Seedance 2.0**

### 무료 모델 상세

| 모델 | 접근 방법 | 품질 | 제한 |
|------|---------|------|------|
| **Pika 2.0 무료** | pika.art 웹 + 제한적 API | ★★★☆☆ | 월 일정 크레딧 |
| **AnimateDiff** | HuggingFace Inference API | ★★☆☆☆ | 느림, 공유 인프라 |
| **Luma Dream Machine** | lumalabs.ai 무료 티어 | ★★★☆☆ | 월 30 크레딧 |

### 유료 모델 상세 (출시 후)

| 시나리오 | 모델 | API 엔드포인트 | 가격 | 특징 |
|---------|------|-------------|------|------|
| **광고 영상 (표준)** | Runway Gen-4.5 | `https://api.runwayml.com/v1/generate` | $0.10–0.50/초 | Sora 대체 1순위. 텍스트→비디오·이미지→비디오 |
| **포토리얼 장면** | Veo 3.1 | Google Vertex AI | $0.12–0.30/10초 | 물리 사실감, Google 생태계 |
| **YouTube 쇼츠 / SNS** | Kling AI 2.0 | kling.kuaishou.com API | ~$0.03/초 | 한국어 지원, 쇼트폼 최적화 |
| **한국어 프롬프트 / 아시아 콘텐츠** | Seedance 2.0 | fal.ai (`/fal-ai/seedance`) | $0.022–0.25/초 | Sora 대체 2순위. 멀티샷 생성, 오디오 입력 지원 |
| **빠른 컨셉 테스트** | Luma Dream Machine | lumalabs.ai API | $0.02/초 | 속도 우선, 프리뷰용 |

#### Seedance 2.0 + Claude 파이프라인 (스크립트→비디오)

```
[시나리오 텍스트]
    → Claude (장면 분해 + 프롬프트 정제 → JSON)
    → Seedance 2.0 API (fal.ai)
    → 클립 생성 → 품질 평가 (Claude 멀티모달)
    → 프롬프트 재조정 반복
```
- Claude가 내러티브 의도 해석 + 카메라 앵글/조명/무드 주석 생성
- Seedance가 렌더링 담당
- 공식 통합 문서는 없지만 REST API로 직접 연결 가능

---

## 4. 음성 (TTS)

### 무료 → 유료 전환 맵

| 무료 (개발 중) | → | 유료 (출시 후) | 시나리오 |
|--------------|---|-------------|---------|
| **Google Cloud TTS 무료** | → | **ElevenLabs Premium** | 영어 내레이션, 감정 표현 |
| **Google Cloud TTS 무료** | → | **NAVER Clova Voice** | 한국어 내레이션 최고 품질 |
| **ElevenLabs 무료 1만자** | → | **OpenAI TTS HD** | 한영 혼합 (코드스위칭) |
| **Kokoro TTS (로컬)** | → | **ElevenLabs Voice Cloning** | 맞춤 보이스, 브랜드 나레이션 |

### 무료 모델 상세

| 모델 | 엔드포인트 | 무료 한도 | 한국어 | 영어 |
|------|-----------|---------|--------|------|
| **Google Cloud TTS** | `https://texttospeech.googleapis.com/v1/text:synthesize` | 월 **400만자** (Neural2 기준) | ★★★★☆ | ★★★★☆ |
| **ElevenLabs 무료** | `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` | 월 **1만자** | ★★★★☆ | ★★★★★ |
| **Minimax Speech** | minimax.io API | 제한적 무료 | ★★★☆☆ | ★★★☆☆ |
| **Kokoro TTS** | HuggingFace Spaces | 무제한 (로컬) | ★★☆☆☆ | ★★★★☆ |

### 유료 모델 상세 (출시 후)

| 시나리오 | 모델 | 가격 | 특징 |
|---------|------|------|------|
| **한국어 내레이션** | NAVER Clova Voice | 월 100만자 무료 → 유료 | 한국어 전용 최고품질. 억양·속도 자연스러움 |
| **영어 감성 내레이션** | ElevenLabs Turbo v2.5 | $0.3/1000자 | 감정 표현력 최고. 24개 언어 지원 |
| **한영 혼합 (코드스위칭)** | OpenAI TTS HD | $30/1M자 | 한영 전환 자연스러움 |
| **맞춤 보이스 클로닝** | ElevenLabs Professional | $99/월 | 5초 샘플→목소리 복제. 브랜드 전용 보이스 |
| **대규모 배치 처리** | Azure Speech Services | $16/1M자 | 엔터프라이즈급. 배치 처리 비용 효율 |
| **한국어 감성 (고급)** | NAVER Clova Voice 프리미엄 | 별도 계약 | 방송급 품질. 다양한 화자 스타일 |

---

## 5. 주간 업데이트 프로세스

### 매주 일요일 15분 체크리스트

**확인할 사이트:**

| 사이트 | 모달리티 | 확인 포인트 |
|-------|---------|-----------|
| [artificialanalysis.ai](https://artificialanalysis.ai) | 텍스트 | quality/speed/price 순위 변화 |
| [artificialanalysis.ai/text-to-image](https://artificialanalysis.ai/text-to-image) | 이미지 | ELO 순위, 새 모델 진입 |
| [lmarena.ai](https://lmarena.ai) | 텍스트 | Chatbot Arena ELO 변화 |
| [openrouter.ai/rankings](https://openrouter.ai/rankings) | 텍스트 | 무료 모델 추가/제거 |
| [huggingface.co/spaces/open-llm-leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) | 텍스트 | 오픈소스 신규 모델 |
| [fal.ai/models](https://fal.ai/models) | 이미지/비디오 | 신규 모델·가격 변경 |
| [replicate.com/explore](https://replicate.com/explore) | 이미지/비디오 | Trending 모델 |

**업데이트 트리거:**

| 상황 | 조치 |
|------|------|
| 현재 무료 모델 deprecated | 즉시 대체 모델로 교체 |
| 더 나은 무료 모델 출시 | 폴백 체인 앞쪽에 추가 |
| 무료 → 유료 정책 변경 | 해당 모델 비활성화, 대안 탐색 |
| 더 나은 유료 모델 출시 | 이 문서 유료 섹션 표 업데이트 |
| 가격 변경 | 가격 컬럼 업데이트 |

---

## 6. 변경 이력

| 날짜 | 변경 내용 |
|------|---------|
| 2026-04-12 | 초기 정책 수립. 텍스트/이미지/비디오/음성 무료→유료 전환 맵 작성. |
| 2026-04-12 | 이미지 섹션 업데이트: artificialanalysis.ai ELO 리더보드 추가. GPT Image 1.5 (#1 Elo 1265), 나노바나나2=Gemini 3.1 Flash (#2 Elo 1258), 나노바나나 프로=Gemini 3 Pro (#3 Elo 1215), FLUX.2 [max] (#4), Seedream 4.0 (#5) 반영. |

---

## 7. 유료 전환 시 코드 변경 사항

### `server/src/ai.ts`

```typescript
// [DEV MODE] 주석 제거 후 아래 수정
const fallbackModels = [
  requestedModel || "google/gemini-2.5-flash",
  "google/gemini-2.0-flash-001",
  "groq/llama-3.3-70b-versatile",
  // --- 아래 주석 해제 ---
  "anthropic/claude-3-5-sonnet-20241022",
  "anthropic/claude-haiku-4-5-20251001",
  // "openai/gpt-4o",
];
```

### 추가할 환경변수 (`.env`)

```env
# 텍스트
ANTHROPIC_API_KEY=       # console.anthropic.com
OPENAI_API_KEY=          # platform.openai.com

# 이미지
REPLICATE_API_KEY=       # replicate.com (Flux Pro, Flux Ultra)
FAL_KEY=                 # fal.ai (Flux Schnell, SD3.5)

# 비디오
RUNWAY_API_KEY=          # runway.com
KLING_API_KEY=           # kling.kuaishou.com

# 음성
ELEVENLABS_API_KEY=      # elevenlabs.io
NAVER_CLOVA_API_KEY=     # naver cloud console
GOOGLE_TTS_API_KEY=      # Google Cloud Console (이미 GEMINI_API_KEY로 부분 커버)
```
