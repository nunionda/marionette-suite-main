# Storyboard Concept Maker — Design Spec

## Context

할리우드 TOP 3 스토리보드 아티스트(Saul Bass, Akira Kurosawa, J. Todd Anderson)의 고유 스타일을 생성형 이미지 AI로 재현하는 도구. marionette-dev 생태계의 일부로, 시나리오 시각화, 컨셉 아트 탐색, 프리프로덕션 문서 생성을 목적으로 한다.

## Architecture

```
[입력] → [Scene Parser] → [Style Selector] → [Prompt Engine] → [Image Generator] → [Post-Processor] → [Sheet Composer] → [출력]
```

### 모듈 구성

| 모듈 | 역할 |
|------|------|
| **Scene Parser** | 텍스트 입력 또는 시나리오 JSON 파일을 파싱하여 구조화된 씬 데이터 생성 |
| **Style Selector** | 아티스트 선택 + 목표 파라미터 설정, Style Template 로드 |
| **Prompt Engine** | 스타일 템플릿 + 씬 데이터를 조합하여 이미지 생성 프롬프트 구성 |
| **Image Generator** | Fallback 체인(Gemini → HuggingFace → Ollama)으로 이미지 생성, style reference 이미지 지원 |
| **Post-Processor** | 스타일별 후처리 필터 적용 (PIL/OpenCV) |
| **Sheet Composer** | 스토리보드 시트 조합, PDF/이미지 출력 |

## Artist Style Templates

### 1. Saul Bass — 미니멀리즘/그래픽

| 파라미터 | 값 |
|---------|-----|
| medium | ink on paper |
| color_mode | black & white |
| line_type | geometric, structured |
| line_weight | bold, high contrast |
| composition | minimal, Bauhaus-influenced |
| detail_level | conceptual |
| post_processing | 고대비 변환, 임계값 이진화, 노이즈 제거 |
| prompt_keywords | "stark black-and-white, geometric abstraction, Bauhaus composition, high contrast ink, negative space, graphic design aesthetic" |

### 2. Akira Kurosawa — 회화적/인상주의

| 파라미터 | 값 |
|---------|-----|
| medium | watercolor, gouache, crayon |
| color_mode | full color |
| line_type | expressive, loose brushstrokes |
| line_weight | varied, flowing |
| composition | painterly, atmospheric |
| detail_level | atmospheric |
| post_processing | 수채화 필터, 브러시 텍스처 오버레이, 채도 조정 |
| prompt_keywords | "hand-painted watercolor, impressionistic, expressive brushwork, rich color palette, Van Gogh-inspired, atmospheric, painterly textures" |

### 3. J. Todd Anderson — 코믹북/내러티브

| 파라미터 | 값 |
|---------|-----|
| medium | Sharpie marker, ink on bond paper |
| color_mode | grayscale |
| line_type | comic book, dynamic |
| line_weight | clean with variation |
| composition | dynamic poses, movement notation |
| detail_level | mixed (rough → refined) |
| post_processing | 잉크선 강화, 그레이스케일 변환, 코믹 해칭 효과 |
| prompt_keywords | "comic book storyboard, Sharpie marker ink, caricature style, dynamic poses, clean line work, graphic novel aesthetic, movement arrows" |

## Image Generation — Fallback Chain

정책에 따라 무료 모델 우선 사용:

1. **Google Gemini Free** (500 req/day, 10 req/min) — 기본 생성기
2. **HuggingFace Free Inference** (FLUX.1, SD 모델) — Gemini 실패 시
3. **Ollama Local** (Z-Image Turbo 등) — 오프라인/무제한 사용 시
4. **Anthropic Claude** (남은 크레딧 허용) — 텍스트 프롬프트 최적화에만 사용

### 이미지 생성 방식 3가지 통합

| 방식 | 설명 | 적용 |
|------|------|------|
| **A. 프롬프트 템플릿** | 스타일 키워드 + 씬 설명 조합 | 기본 생성 방식 |
| **B. 스타일 레퍼런스** | 참조 이미지를 함께 전달 (img2img) | HuggingFace/Ollama에서 지원 시 |
| **C. 후처리** | PIL/OpenCV로 스타일 보정 | 모든 생성 결과에 적용 |

## Data Flow

### 입력 형식

**텍스트 직접 입력:**
```
"주인공이 어두운 골목에서 그림자를 발견한다"
```

**시나리오 JSON 파일:**
```json
{
  "project": "My Film",
  "scenes": [
    {
      "scene_id": "SC001",
      "description": "주인공이 어두운 골목에서 그림자를 발견한다",
      "camera_angle": "low angle",
      "mood": "suspense",
      "characters": ["주인공"],
      "location": "dark alley"
    }
  ],
  "style": "saul_bass",
  "style_overrides": {},
  "output_format": "pdf"
}
```

### 출력물

1. **개별 프레임** — 각 씬별 PNG 이미지
2. **스토리보드 시트** — 그리드 레이아웃 (2x3 또는 3x3), 샷 번호/설명/카메라 앵글 포함
3. **PDF 문서** — 프리프로덕션 문서 형태
4. **스타일 비교 시트** — 동일 씬을 3명 아티스트 스타일로 나란히 비교

## CLI Interface

```bash
# 텍스트 직접 입력으로 특정 스타일 생성
python main.py generate --scene "주인공이 절벽 위에 서있다" --style kurosawa

# 시나리오 파일 + 전체 스타일 + PDF 출력
python main.py generate --script scenario.json --style all --output pdf

# 동일 씬 3가지 스타일 비교
python main.py compare --scene "추격씬" --output comparison.png
```

## Tech Stack

- **언어:** Python 3.11+
- **이미지 생성:** google-generativeai, huggingface_hub, ollama
- **이미지 처리:** Pillow (PIL), OpenCV
- **PDF 생성:** reportlab 또는 fpdf2
- **CLI:** argparse 또는 click
- **설정 관리:** YAML 기반 스타일 프로필

## Project Structure

```
storyboard-concept-maker/
├── main.py                    # CLI 엔트리포인트
├── requirements.txt
├── config/
│   └── styles.yaml            # 아티스트 스타일 프로필 정의
├── src/
│   ├── __init__.py
│   ├── scene_parser.py        # 씬 파싱 모듈
│   ├── style_selector.py      # 스타일 선택/템플릿 로드
│   ├── prompt_engine.py       # 프롬프트 조합 엔진
│   ├── image_generator.py     # Fallback 체인 이미지 생성
│   ├── post_processor.py      # 스타일별 후처리
│   └── sheet_composer.py      # 스토리보드 시트/PDF 조합
├── styles/
│   └── references/            # 스타일 참조 이미지 (선택적)
├── output/                    # 생성 결과물
└── docs/
    └── superpowers/
        └── specs/
```

## Verification

1. **단위 테스트:** 각 모듈별 입출력 검증
2. **통합 테스트:** 텍스트 입력 → 이미지 생성 → 시트 출력 전체 파이프라인
3. **스타일 검증:** 3명 아티스트 동일 씬 비교 생성하여 스타일 차이 확인
4. **Fallback 검증:** API 실패 시 다음 프로바이더로 정상 전환 확인
5. **CLI 검증:** generate, compare 명령 정상 동작 확인
