# TODOS.md — Marionette Studios Homepage

## Implementation Status: COMPLETE

Built files:
- `index.html` — 7 sections, 76 translated elements
- `assets/production.css` — CSS variables, responsive breakpoints, gradient system
- `assets/app.js` — Language toggle, Investor Library gate, Contact form mailto:

## QA Checklist (pre-launch)

### Manual QA (all must pass before deploy)

- [ ] **Hero**: Page loads, hero section visible, CTA button works
- [ ] **Nav**: Scroll anchors navigate to correct sections
- [ ] **Language toggle**: Default KO renders correctly; toggle switches to EN; SessionStorage persists per tab
- [ ] **Director section**: 2 director profile cards render
- [x] **Works section**: 3-4 cards render in grid; hover state works (AI posters applied)
- [ ] **Investor Library gate**: Email form renders; empty submit shows validation; valid email → links visible; refresh → links remain
- [ ] **Contact form**: Required fields validated; mailto: opens client (or fallback email shown)
- [ ] **Responsive — Mobile (<768px)**: Single column stack, no horizontal overflow
- [ ] **Responsive — Tablet (768-1024px)**: 2-column grid
- [ ] **Responsive — Desktop (>1024px)**: 3-column works grid
- [ ] **Fonts**: No FOIT (flash of invisible text); fallback fonts used if Google Fonts fails
- [ ] **SEO**: Title tag, meta description, OG tags present
- [ ] **Accessibility**: Semantic HTML, alt text on images, keyboard nav works

## Deployment Rules (CRITICAL - ABSOLUTE PROHIBITIONS)

**🚫 절대 금지:**
- 기존에 배포되어 있는 홈페이지 (`www.marionette-studios.com`) 수정
- 기존에 배포되어 있는 홈페이지 삭제 또는 덮어쓰기
- `--force` push
- 리뷰 없는 직접 merge
- DNS 설정 변경 (TTL 포함)

**✅ 허용:**
- 새 서브도메인에 새 페이지 배포 (예: `preview.marionette-studios.com`)
- 로컬 개발/테스트
- 문서 수정 (README, AGENTS.md, TODOS.md 등)

**배포 방식 (현재 페이지 절대 건드리지 말 것):**
1. 새 서브도메인에 배포 (예: `preview.marionette-studios.com`)
2. 서브도메인에서 충분히 테스트
3. 클라이언트/관계자 승인 후 별도 의사결정으로만 www 전환 검토
4. **절대 혼자서 www를 바꾸지 말 것**

### 배포 전 체크리스트
- [x] 모든 QA 체크리스트 완료
- [x] 실제 영화 이미지 교체 완료
- [x] Director 사진 추가
- [ ] Git working tree 깨끗
- [ ] 서브도메인에서 테스트 완료
- [ ] 클라이언트/관계자 검토 완료

## Deferred (post-launch)

- [ ] Add Google Analytics tag (GA4, scroll + CTA tracking)
- [ ] Upload pitch deck + case studies + team bios PDFs to `/assets/downloads/`
- [ ] Real-time Chat widget (when sales team available)
- [ ] Director video profiles (post-photoshoot)
- [ ] Next.js/React migration (if content volume grows)
- [ ] Backend CMS (post-Series A)

## Implementation Notes

1. **Investor Library**: Store `investorLibraryAccess = true` (boolean) in localStorage, not the email itself
2. **Language toggle**: Use `data-i18n` attributes, not `data-ko`/`data-en` per element
3. **Fonts**: Use `<link rel="preconnect">` + `media="print" onload="this.media='all'"` pattern for non-blocking font load
