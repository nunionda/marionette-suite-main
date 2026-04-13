# Design System — Marionette Suite

## Product Context
- **What this is:** AI 영화 프로덕션 파이프라인. 시나리오 분석부터 최종 비디오 생성까지 24노드 워크플로우.
- **Who it's for:** 영화 감독, 크리에이터, 프로듀서. AI 에이전트를 "디지털 크루"로 오케스트레이션하는 사람.
- **Space/industry:** 영화 프로덕션 도구 (Peers: ShotGrid, Frame.io, ftrack, DaVinci Resolve) + AI 생성 도구 (Runway, Pika)
- **Project type:** Web app (pipeline dashboard + gallery + writing room)

## Aesthetic Direction
- **Direction:** Cinematic Industrial — 시네마틱 럭셔리 + 산업용 정밀도. 영화 스튜디오 컨트롤룸의 어두운 고급스러움과 파이프라인 노드의 기술적 정확성이 결합.
- **Decoration level:** Intentional — film grain 오버레이(3% opacity), 미묘한 노이즈 텍스처, 패널 경계에 약한 방사형 그라디언트.
- **Mood:** "감독의 지휘석". 작품의 모든 것을 한눈에 조망하면서 정밀하게 제어하는 느낌. 고급스럽지만 허세가 아닌, 실제로 작동하는 도구.
- **Reference sites:** Frame.io (restrained dark), Pika (gold accent, bold serif), DaVinci Resolve (industrial density)

## Typography
- **Display/Hero:** Instrument Serif — 시나리오/영화 포스터의 시네마틱 권위감. 프로젝트명, 섹션 타이틀, 페이지 헤더에만 사용. 과도 사용 금지.
- **Body:** Outfit — 깔끔하고 현대적, 기하학적 정밀감. 모든 UI 레이블, 본문, 네비게이션, 버튼에 사용.
- **UI/Labels:** Outfit (same as body, weight 500-600 for labels)
- **Data/Tables:** Geist Mono — 파이프라인 상태, 노드 ID, 에이전트 서브, 타임코드, 기술 메트릭. tabular-nums 지원.
- **Code:** Geist Mono
- **Loading:** Google Fonts CDN
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  ```
- **Scale:**
  - 3xl: 3.5rem (hero only)
  - 2xl: 2rem (section titles)
  - xl: 1.3rem (panel titles, card headings)
  - lg: 1rem (sub-headings)
  - md: 0.8rem (body, buttons)
  - sm: 0.7rem (UI labels, descriptions)
  - xs: 0.6rem (meta labels, mono data)
  - 2xs: 0.55rem (agent sub-names, timestamps)

## Color

### Approach: Restrained
워몰골드 `#C8A855` 1개 액센트 + 뉴트럴 그레이. 색은 귀하고 의미 있을 때만 사용.

### Palette
| Token | Hex | CSS Variable | Usage |
|-------|-----|-------------|-------|
| Background | `#08080c` | `--bg-floor` | 최하층 배경. blue-black. |
| Surface | `#111118` | `--bg-surface` | 패널, 카드, 사이드바 |
| Elevated | `#191920` | `--bg-elevated` | 호버 상태, 팝오버, 모달 |
| Hover | `#1f1f28` | `--bg-hover` | 인터랙티브 요소 호버 |
| Border | `#1e1e2a` | `--border` | 기본 경계선 |
| Border Hover | `#2e2e3e` | `--border-hover` | 호버 시 경계선 |
| Border Focus | `#C8A855` | `--border-focus` | 포커스/활성 경계선 (gold) |
| **Gold** | `#C8A855` | `--gold` | 브랜드, CTA, 활성 상태, 섹션 라벨 |
| Gold Dim | `#9A7F3A` | `--gold-dim` | 비활성 골드, 보조 장식 |
| Gold Glow | `rgba(200,168,85,0.12)` | `--gold-glow` | 버튼 호버 glow, 활성 노드 |
| Gold Subtle | `rgba(200,168,85,0.06)` | `--gold-subtle` | 활성 배경, 선택 상태 |
| Text Primary | `#e8e4dc` | `--text` | 본문, 제목 (warm white) |
| Text Bright | `#f5f2eb` | `--text-bright` | 강조 텍스트 |
| Text Muted | `#6b6860` | `--text-muted` | 보조 텍스트, 설명 |
| Text Dim | `#4a4640` | `--text-dim` | 비활성 텍스트, 힌트 |

### Status Colors (semantic, 이것만 추가 색상)
| Status | Hex | Usage |
|--------|-----|-------|
| Success | `#27AE60` | 완료, 정상 |
| Warning | `#E2A035` | 진행 중, 주의 |
| Error | `#C0392B` | 실패, 오류 |
| Info | `#5B8AC4` | 대기, 정보 |

### Design/Video Track 구분
Purple/cyan 별도 색상을 쓰지 않음. 대신:
- Design Track: gold accent 100% opacity
- Video Track: gold accent 60% opacity + weight 차이
- 활성 노드: `--gold-subtle` 배경 + `--gold` 보더

### Dark mode
이 시스템은 dark-only. 라이트 모드 불필요 (프로덕션 도구의 업계 표준).

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable (파이프라인 노드는 compact, 갤러리는 spacious)
- **Scale:**

| Token | Value | CSS Variable |
|-------|-------|-------------|
| 2xs | 2px | `--sp-2xs` |
| xs | 4px | `--sp-xs` |
| sm | 8px | `--sp-sm` |
| md | 16px | `--sp-md` |
| lg | 24px | `--sp-lg` |
| xl | 32px | `--sp-xl` |
| 2xl | 48px | `--sp-2xl` |
| 3xl | 64px | `--sp-3xl` |

## Layout
- **Approach:** Hybrid — 파이프라인/데이터에는 엄격한 그리드, 갤러리/레퍼런스에는 에디토리얼 레이아웃.
- **Grid:** 파이프라인 뷰는 2-column (Design Track / Video Track), 갤러리는 3-column responsive.
- **Max content width:** 1400px (대시보드), 1200px (갤러리/레퍼런스)
- **Border radius:**
  - sm: 4px (뱃지, 작은 버튼, 인풋)
  - md: 8px (카드, 패널, 메인 버튼)
  - lg: 12px (모달, 목업 프레임)

## Motion
- **Approach:** Intentional — 기능적 트랜지션에 집중. 장식적 애니메이션 없음.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out for enters)
- **Duration:**
  - micro: 100ms (호버 색상 변화)
  - short: 200ms (버튼 상태, 보더 변화)
  - medium: 300ms (패널 슬라이드인, 탭 전환)
  - long: 500ms (모달 열기, 페이지 레벨 전환)

## Anti-Slop Rules
1. **No cyan or purple accents** — 골드만 사용. 기존 `hsl(190, 100%, 50%)` / `hsl(280, 100%, 65%)` 제거.
2. **No generic gradients** — 리니어 그라디언트는 미묘한 방사형(vignette) 또는 경계선 장식에만.
3. **No centered everything** — 좌측 정렬 기본. 히어로 섹션만 센터 허용.
4. **No inline hex codes** — 반드시 CSS 변수 사용. `color: '#8b5cf6'` 같은 하드코딩 금지.
5. **No Inter/Roboto/Arial** — Outfit을 UI 폰트로, Instrument Serif를 디스플레이로.
6. **No 3-column icon grids** — 갤러리 카드는 OK, 기능 소개 그리드는 금지.
7. **Film grain 오버레이 유지** — `body::after`로 3% opacity noise texture.

## Component Patterns

### Buttons
- **Primary:** `background: var(--gold), color: var(--bg-floor)`. 호버 시 glow.
- **Secondary:** `border: 1px solid var(--border), color: var(--text)`. 호버 시 `border-color: var(--gold)`.
- **Ghost:** `background: transparent, color: var(--text-muted)`. 호버 시 `color: var(--gold)`.

### Pipeline Nodes
- Default: `border: 1px solid var(--border), background: rgba(255,255,255,0.01)`
- Hover: `border-color: var(--border-hover), background: var(--bg-hover)`
- Active/Selected: `border-color: var(--gold), background: var(--gold-subtle)`
- Complete: green `✅` icon, no background change
- Empty: gray `⬜` icon

### Status Badges
- `padding: 4px 10px, border-radius: 4px, font-size: 0.6rem, font-weight: 600`
- Background: status color at 10% opacity
- Border: status color at 25% opacity
- Text: status color at 100%

### Section Labels
- `font-family: var(--font-mono), font-size: 0.6rem, letter-spacing: 2px, color: var(--gold), text-transform: uppercase`

### Panel Titles (NodeExecutionPanel, ArtBibleViewer, etc.)
- `font-family: var(--font-display), font-size: 1.3rem, color: var(--text-bright)`

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-13 | Complete design system redesign | 3-4개 디자인 시스템이 혼재 (DESIGN.md vs Theme.css vs gallery vs inline styles). 통합 필요. |
| 2026-04-13 | Instrument Serif for display | 프로덕션 도구에서 serif를 쓰는 곳이 없음. 즉각적 차별화. 과도 사용 위험은 display 전용으로 제한. |
| 2026-04-13 | Gold-only accent | 단일 액센트로 럭셔리함 + 영화 업계(Oscar, 크레딧) 연상. Track 구분은 opacity/weight로. |
| 2026-04-13 | Competitive research: Frame.io, ftrack, Runway, Pika, DaVinci Resolve | 카테고리 베이스라인 확인. 모두 dark mode, 모두 sans-serif. Pika만 bold serif + gold. |
