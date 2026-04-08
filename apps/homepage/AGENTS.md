# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.


## Project Overview
Static HTML/CSS homepage for a movie production company. Korean-language content, dark mode aesthetic with gold accents.

## Setup

```bash
python3 -m http.server 8000
# Then open http://localhost:8000/
```

## Structure

```
index.html          # Main page (Korean)
assets/
  production.css    # Styles
```

## Sections

- Hero: Large typography + "작품 보기" button
- 회사 소개 (About)
- 대표 작품 (3 portfolio cards with gradient posters)
- 팀 (Team)
- 문의 (Contact form)
- Footer

## Styling Conventions

- Background: `#0a0a0a` (near-black)
- Fonts: Times/Georgia feel for headers, system fonts for body
- Poster placeholders use `gradient-a`, `gradient-b`, `gradient-c` classes
- Responsive grid layout for cards
- Film-strip decorative element in hero

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

## Language Rule (헌법)

**한국어/영어만 사용. 중국어, 일본어 등 다른 언어 금지.**

- 모든 코드, 문서, 주석은 한국어 또는 영어로만 작성
- 한자, 히라가나, 카타카나, 중국어 문자 사용 금지
- 폰트는 Pretendard 사용 (한국어 최적화)

## Next Steps

- [ ] Replace gradient posters with actual images
- [ ] Add director photos
- [ ] Deploy to subdomain for testing
- [ ] Switch www to new page after verification
