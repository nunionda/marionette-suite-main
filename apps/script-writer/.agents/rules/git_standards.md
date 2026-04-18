# Rule: Git & Documentation Standards

시나리오 프로젝트의 모든 단계(Phase)가 완료될 때마다 아래의 표준 규칙을 준수하여 깃 저장 및 문서화를 진행합니다.

## 1. 디렉토리 구조 (Folder Structure)
에이전트 작업 결과물 및 계획은 다음 표준 폴더에 관리합니다.
- `docs/plans/`: 각 페이즈 시작 전 작성하는 상세 설계 및 기획안.
- `docs/results/`: 페이즈 완료 후 도출된 최종 아티팩트 및 리포트.
- `docs/sessions/`: 에이전트와의 주요 의사결정 로그 및 터미널 출력 요약.

## 2. 깃 커밋 규칙 (Git Convention)
- **Commit Message Format**: `<type>(<phase>): <description>`
  - `type`: `feat` (신규 기능/내용), `chore` (관리), `docs` (문서), `refactor` (리팩토링)
  - `phase`: `phase-1`, `phase-2` 등
  - *예시*: `feat(phase-1): complete initial planning and relationship diagram`

## 3. 자동화 스크립트 도구
- 모든 에이전트는 페이즈 종료 시 `./scripts/sync-phase.sh`를 호출하여 원자적 커밋을 수행합니다.
- 커밋 전, `docs/results/`에 해당 페이즈의 요약본(Summary)이 존재하는지 확인합니다.
