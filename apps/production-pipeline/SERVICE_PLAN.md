# 마리오네트 스튜디오 — 서비스 계획서 (Service Blueprint)

> 작성일: 2026-03-19 | 버전: v1.0
> 프로젝트: AI 기반 완전 자동화 영상 콘텐츠 제작 파이프라인

---

## 1. 프로젝트 현황 진단 (As-Is)

### 1.1 코어 아키텍처

```
[사용자 아이디어 입력]
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Orchestrator Agent (✅ 구현 완료)                        │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌─────────┐ │
│  │Step 1   │→│Step 2    │→│Step 3     │→│Step 4   │ │
│  │Script   │  │Concept   │  │Generalist │  │Asset    │ │
│  │Writer   │  │Artist    │  │(Video)    │  │Designer │ │
│  │✅ REAL   │  │⚠️ MOCK   │  │⚠️ MOCK    │  │⚠️ MOCK  │ │
│  └─────────┘  └──────────┘  └───────────┘  └─────────┘ │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐              │
│  │Step 5   │→│Step 6    │→│Step 7     │              │
│  │VFX      │  │Master    │  │Sound      │              │
│  │Compositor│  │Editor    │  │Designer   │              │
│  │⚠️ MOCK   │  │✅ FFMPEG  │  │⚠️ MOCK    │              │
│  └─────────┘  └──────────┘  └───────────┘              │
└─────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ Web Dashboard │ (React + Vite, ✅ UI 완료, ⚠️ 백엔드 미연동)
└──────────────┘
```

### 1.2 모듈별 상태 요약

| # | 에이전트 | 상태 | 실제 구현 | 연동 API | 비고 |
|---|---------|------|----------|---------|------|
| 1 | ScriptWriter | ✅ Production | Gemini 2.5-flash + 구조화 출력 + 웹 리서치 | Google Gemini | 핵심 엔진 완료 |
| 2 | ConceptArtist | ⚠️ Skeleton | 스키마/IO만 구현, 이미지는 Mock | 미연동 | Imagen 3 / NanoBanana 2 연동 필요 |
| 3 | Generalist | ⚠️ Skeleton | 스키마/IO만 구현, 비디오는 Mock | 미연동 | Veo 3.1 / Sora 연동 필요 |
| 4 | AssetDesigner | ⚠️ Skeleton | Mock .obj 파일 생성 | 미연동 | 3D 생성 API 선정 필요 |
| 5 | VFXCompositor | ⚠️ Skeleton | Mock 합성 파일 생성 | 미연동 | 컴포지팅 엔진 필요 |
| 6 | MasterEditor | ✅ Partial | FFMPEG 기반 비디오 컨캣 실구현 | FFMPEG | 업스트림 실제 영상 필요 |
| 7 | SoundDesigner | ⚠️ Skeleton | Mock .wav 파일 생성 | 미연동 | TTS/BGM/SFX API 필요 |
| 8 | Orchestrator | ✅ Real | 7단계 순차 실행 파이프라인 | 내부 | 완료 |
| - | Web Dashboard | ✅ UI Only | React UI + localStorage | 없음 | 백엔드 API 미연동 |

### 1.3 보유 자산

- **콘텐츠 IP**: "비트 세이버 (Bit-Savior: The Last Code)" — 금융 테크노 스릴러
- **리서치 데이터**: 북한 라자루스 해커 조직, 미국 정부 대응 체계, LLM 해킹 사례 등 심층 자료 5건+
- **AI 벤치마크**: 2026 최신 영상 생성 AI (Veo 3.1, Sora, Kling, Runway 등) 비교 분석 완료
- **프롬프트 공식**: 이미지 5단 구조, 비디오 6단 구조 + [Audio] 태그 최적화 완료

---

## 2. 서비스 비전 (To-Be)

### 2.1 원스톱 AI 영상 제작 SaaS

**"한 줄의 아이디어 → 완성된 영상 콘텐츠"**

비전문가가 짧은 시놉시스 하나만 입력하면, 7명의 AI 크루가 자동으로 기획서 → 스토리보드 → 영상 → VFX → 편집 → 사운드까지 처리하여 바로 사용 가능한 영상 콘텐츠를 산출하는 완전 자동화 플랫폼.

### 2.2 타겟 시장

| 세그먼트 | 사용 시나리오 | 가치 제안 |
|---------|-------------|----------|
| 1인 크리에이터 | 유튜브/릴스 콘텐츠 대량 생산 | 제작 비용 90% 절감, 시간 95% 단축 |
| 광고 에이전시 | 클라이언트 프레젠테이션용 영상 시안 | 프리비즈(Pre-viz) 속도 혁신 |
| 영화/드라마 제작사 | 프리프로덕션 스토리보드 및 VFX 프리비즈 | 사전 시각화로 의사결정 가속 |
| 교육/기업 | 교육용 영상, 기업 홍보 콘텐츠 | 전문 제작팀 없이 고품질 영상 |
| IP 홀더 | 캐릭터/세계관 기반 파생 콘텐츠 | IP 활용 콘텐츠 자동 확장 |

---

## 3. 기술 개발 로드맵

### Phase 1: Core Pipeline 완성 (4주)
> 목표: 7개 에이전트 모듈 모두 실제 API 연동하여 end-to-end 파이프라인 동작

#### Week 1-2: 이미지 & 비디오 생성

| 작업 | 세부 내용 | API | 우선순위 |
|-----|---------|-----|---------|
| ConceptArtist 구현 | Gemini Imagen 3 / Flash Image API 연동, 씬별 스토리보드 이미지 자동 생성 | Google Imagen 3 | P0 |
| Generalist 구현 | Veo 3.1 API 연동, 이미지→비디오 변환 로직, 프롬프트 최적화 | Google Veo 3.1 | P0 |
| Sora 폴백 연동 | Veo 실패 시 Sora API 폴백, 비용 최적화 라우팅 | OpenAI Sora | P1 |

#### Week 3: 후반 작업 에이전트

| 작업 | 세부 내용 | API | 우선순위 |
|-----|---------|-----|---------|
| SoundDesigner 구현 | BGM 자동 생성 (Suno/Udio API), TTS 더빙 (ElevenLabs), SFX 합성 | Suno + ElevenLabs | P0 |
| VFXCompositor 구현 | Python OpenCV/Rotobrush 기반 크로마키, 매치무브 자동화 | OpenCV + FFmpeg | P1 |
| AssetDesigner 구현 | Meshy/Tripo3D API 연동, 2D→3D 변환 | Meshy API | P2 |

#### Week 4: 통합 & 안정화

| 작업 | 세부 내용 | 우선순위 |
|-----|---------|---------|
| MasterEditor 고도화 | 컬러 그레이딩 LUT 적용, 트랜지션 효과 자동 선택 | P1 |
| Orchestrator 에러 핸들링 | 각 단계 실패 시 재시도 로직, 부분 실행 지원 | P0 |
| End-to-End 테스트 | "비트 세이버" IP로 풀 파이프라인 데모 실행 | P0 |

### Phase 2: 웹 대시보드 & API 서버 (3주)
> 목표: 웹에서 프로젝트를 관리하고 파이프라인을 실행할 수 있는 풀스택 서비스

#### Week 5-6: 백엔드 API 서버

| 작업 | 세부 내용 | 기술 스택 |
|-----|---------|----------|
| REST API 서버 구축 | FastAPI 기반, 프로젝트 CRUD + 파이프라인 실행 엔드포인트 | FastAPI + SQLite/PostgreSQL |
| 비동기 작업 큐 | Celery + Redis로 장시간 파이프라인 작업 비동기 처리 | Celery + Redis |
| WebSocket 실시간 피드 | 파이프라인 진행 상황 실시간 스트리밍 | WebSocket |
| 파일 스토리지 | S3/GCS 연동, 산출물 (이미지/비디오/오디오) 클라우드 저장 | AWS S3 or GCS |

#### Week 7: 프론트엔드 완성

| 작업 | 세부 내용 |
|-----|---------|
| Dashboard ↔ API 연동 | localStorage → API 전환, 실시간 프로젝트 상태 반영 |
| "Auto-Generate" 버튼 연결 | ProjectDetail의 자동생성 버튼 → 백엔드 파이프라인 트리거 |
| 파이프라인 모니터링 UI | 7단계 진행 바, 각 단계 산출물 미리보기 |
| 갤러리 뷰 | 생성된 스토리보드 이미지, 비디오 클립 갤러리 |

### Phase 3: SaaS 런칭 준비 (3주)
> 목표: 외부 사용자가 사용할 수 있는 서비스 형태 완성

#### Week 8-9: 인프라 & 보안

| 작업 | 세부 내용 |
|-----|---------|
| 사용자 인증 | OAuth2 (Google/GitHub), JWT 토큰 기반 인증 |
| 크레딧/과금 시스템 | API 호출 비용 기반 크레딧 차감 모델 설계 |
| Rate Limiting | 사용자별 동시 실행 제한, API 비용 보호 |
| 인프라 배포 | Docker + Kubernetes, CI/CD 파이프라인 |

#### Week 10: 런칭

| 작업 | 세부 내용 |
|-----|---------|
| 랜딩 페이지 | 서비스 소개, 데모 영상, 가격 정책 |
| Beta 테스터 모집 | 초기 크리에이터 50명 대상 비공개 베타 |
| 모니터링 & 로깅 | Sentry + Datadog, 에러 트래킹 및 성능 모니터링 |

---

## 4. API 비용 분석 & 가격 모델

### 4.1 프로젝트당 예상 API 비용 (10씬 기준)

| 에이전트 | API | 단가 | 10씬 예상 비용 |
|---------|-----|------|--------------|
| ScriptWriter | Gemini 2.5 Flash | ~$0.01/1K tokens | $0.05 |
| ConceptArtist | Imagen 3 | ~$0.04/image | $0.40 |
| Generalist | Veo 3.1 (8초) | ~$0.40/초 × 8초 | $32.00 |
| SoundDesigner (BGM) | Suno API | ~$0.10/곡 | $1.00 |
| SoundDesigner (TTS) | ElevenLabs | ~$0.30/1K chars | $3.00 |
| MasterEditor | FFMPEG (로컬) | $0.00 | $0.00 |
| **합계** | | | **~$36.45** |

### 4.2 SaaS 가격 모델 (안)

| 플랜 | 월 가격 | 크레딧 | 프로젝트 수 | 타겟 |
|-----|--------|--------|-----------|------|
| Free | $0 | 50 크레딧 | 1 | 체험 |
| Creator | $29/월 | 500 크레딧 | 10 | 1인 크리에이터 |
| Studio | $99/월 | 2,000 크레딧 | 무제한 | 소규모 스튜디오 |
| Enterprise | 협의 | 무제한 | 무제한 | 제작사/에이전시 |

> 1 프로젝트(10씬) ≈ 40 크레딧 소요 기준

---

## 5. 사업 모델 (Business Model Canvas)

### 핵심 가치 제안
"AI 크루 7명이 당신의 아이디어를 완성된 영상으로 만들어 드립니다"

### 수익 모델
1. **구독형 SaaS** — 월/연 구독으로 크레딧 제공
2. **종량제(Pay-per-use)** — 프로젝트당 과금
3. **엔터프라이즈 라이선스** — 온프레미스 설치, 커스텀 파이프라인
4. **IP 마켓플레이스** — 사용자가 만든 캐릭터/세계관 템플릿 거래

### 경쟁 우위
1. **End-to-End 자동화** — 기획→영상 완성까지 원스톱 (Runway, Kling은 생성만)
2. **구조화된 프롬프트 엔진** — Pydantic 스키마 + 리서치 기반 할루시네이션 방지
3. **멀티 AI 라우팅** — Veo/Sora/Kling 등 최적 모델 자동 선택
4. **한국어 네이티브** — 국내 제작 환경에 최적화된 첫 플랫폼

---

## 6. 당장의 Next Actions (TASKS)

### 이번 주 (Week of 2026-03-19)

| # | 태스크 | 담당 | 상태 | 마감 |
|---|-------|------|------|------|
| 1 | Gemini Imagen 3 API 키 발급 & ConceptArtist 연동 | Daniel | TODO | 3/21 |
| 2 | Veo 3.1 API 접근권한 확보 (Vertex AI) | Daniel | TODO | 3/21 |
| 3 | ElevenLabs API 키 발급 & TTS 프로토타입 | Daniel | TODO | 3/23 |
| 4 | FastAPI 백엔드 서버 스캐폴딩 | Daniel | TODO | 3/25 |
| 5 | "비트 세이버" 1화 파일럿 — ScriptWriter 실행 & 결과 검증 | Daniel | TODO | 3/20 |

### 다음 주 (Week of 2026-03-26)

| # | 태스크 | 상태 | 마감 |
|---|-------|------|------|
| 6 | ConceptArtist + Generalist 실 API 연동 완료 | TODO | 3/28 |
| 7 | SoundDesigner 구현 (Suno + ElevenLabs) | TODO | 3/30 |
| 8 | 웹 대시보드 ↔ API 서버 연동 시작 | TODO | 3/31 |
| 9 | IR 피치덱 초안 작성 (10페이지) | TODO | 3/31 |

---

## 7. 기술 스택 정리

| 레이어 | 기술 | 비고 |
|--------|------|------|
| **언어** | Python 3.9+ (Backend) / TypeScript (Frontend) | |
| **AI 엔진** | Google Gemini 2.5 Flash (LLM) | 구조화 출력 + 웹 리서치 |
| **이미지 생성** | Google Imagen 3 / NanoBanana 2 | 5단 프롬프트 최적화 |
| **비디오 생성** | Google Veo 3.1 (Primary) / OpenAI Sora (Fallback) | 6단 프롬프트 + [Audio] 태그 |
| **음성 합성** | ElevenLabs (TTS) / Suno (BGM) | |
| **영상 편집** | FFMPEG + OpenCV | 로컬 처리, 무비용 |
| **프론트엔드** | React 19 + Vite 8 | 현재 구현 완료 |
| **백엔드** | FastAPI + Celery + Redis | 구축 예정 |
| **데이터베이스** | PostgreSQL | 구축 예정 |
| **인프라** | Docker + Kubernetes | 구축 예정 |
| **스토리지** | AWS S3 or Google Cloud Storage | 구축 예정 |

---

## 8. 리스크 & 대응

| 리스크 | 영향도 | 대응 전략 |
|--------|--------|----------|
| Veo 3.1 API 접근 제한 | 높음 | Sora/Kling API 폴백, 멀티 모델 라우팅 |
| API 비용 급등 | 높음 | 크레딧 시스템으로 비용 전가, 캐싱 최적화 |
| 생성 영상 품질 불안정 | 중간 | 사용자 피드백 루프, 리트라이 로직, A/B 테스트 |
| 저작권 이슈 | 중간 | IP 리서치 모듈로 기존 저작물 충돌 검증 |
| 경쟁사 진입 (Runway, Pika) | 중간 | End-to-End 차별화, 한국어 특화 |

---

> 이 문서는 마리오네트 스튜디오 프로젝트의 Living Document입니다.
> 매주 업데이트하여 진행 상황을 추적합니다.
