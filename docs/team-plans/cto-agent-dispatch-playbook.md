# CTO Agent Dispatch Playbook — Marionette Studios

**Document type:** Operations Playbook
**Author:** CTO
**Date:** 2026-03-30
**Reference:** [Running Claude Code Dangerously (Safely)](https://blog.emilburzo.com/2026/01/running-claude-code-dangerously-safely/)

---

## Why This Exists

팀 에이전트(Backend Dev, Frontend Dev, DevOps, QA)를 `--dangerously-skip-permissions`로 실행하면 최대 자율성을 얻지만 호스트 시스템이 위험해진다. Vagrant VM을 샌드박스로 사용하면:

- 에이전트가 VM 안에서 완전한 권한으로 실행
- 프로젝트 파일은 양방향 동기화로 호스트에 반영
- VM이 깨지면 `vagrant destroy && vagrant up`으로 5분 안에 리셋
- 호스트 시스템 상태는 절대 영향받지 않음

**Threat model:** 개발 사고 방지 (실수로 인한 시스템 파손, 패키지 오염, 설정 변경). 악의적 공격 방어 목적이 아님.

---

## 아키텍처

```
CTO (호스트 macOS)
│
├── 파일 편집, 계획 수립, PR 검토 — 호스트에서 직접
│
└── 에이전트 디스패치 → Vagrant VM (Ubuntu 24.04)
        │
        ├── /agent-workspace  ←→  ~/dev/.../production_pipeline  (양방향 동기화)
        │
        ├── claude --dangerously-skip-permissions -p "Backend Dev: ..."
        ├── claude --dangerously-skip-permissions -p "Frontend Dev: ..."
        ├── claude --dangerously-skip-permissions -p "DevOps: ..."
        └── claude --dangerously-skip-permissions -p "QA: ..."
```

---

## 설치 (최초 1회)

### 1. Vagrant + VirtualBox 설치

```bash
# macOS
brew install vagrant
brew install --cask virtualbox
```

### 2. API 키 VM에 주입

```bash
# Vagrant up 전에 먼저 실행 — VM에서 ANTHROPIC_API_KEY 사용
echo "$ANTHROPIC_API_KEY" > ~/.vagrant.d/anthropic_key
```

Vagrantfile은 `/home/vagrant/.anthropic_key`에서 자동으로 키를 읽어 환경변수로 설정한다.

### 3. VM 최초 부팅 (약 5분)

```bash
cd ~/dev/claude-dev/marionette-dev/production_pipeline
vagrant up
```

완료 메시지:
```
============================================
  Marionette Studios Agent VM Ready
  Project: /agent-workspace
  Claude:  claude --dangerously-skip-permissions
============================================
```

---

## CTO 일일 워크플로우

### VM 시작

```bash
cd ~/dev/claude-dev/marionette-dev/production_pipeline

vagrant up          # 최초: ~5분 / 이후 suspend에서 재개: ~10초
vagrant ssh         # VM 진입
```

### 팀원 에이전트 디스패치

VM 안에서:

```bash
cd /agent-workspace
claude --dangerously-skip-permissions -p "<팀원 역할 + 태스크>"
```

### 세션 종료

```bash
exit                  # VM에서 나오기
vagrant suspend       # VM 상태 저장 (빠른 재개용)
```

### VM 리셋 (문제 발생 시)

```bash
vagrant destroy -f
vagrant up
```

---

## 팀원별 디스패치 템플릿

### Backend Developer

```bash
claude --dangerously-skip-permissions -p "
You are the Backend Developer on Marionette Studios dev team.
Working directory: /agent-workspace
Sprint: [S1/S2/S3/...]
Today's date: $(date +%Y-%m-%d)

Read the execution plan first:
  docs/team-plans/development-execution-plan.md

Your assigned tasks for this session:
[태스크 번호와 설명]

Constraints:
- Free LLM only: Gemini Free → Ollama → HuggingFace → Groq → Anthropic
- Bun runtime, TypeScript strict, ESM
- Run: bun run typecheck && bun run test before marking done

After completion, update TASKS.md with status.
"
```

### Frontend Developer

```bash
claude --dangerously-skip-permissions -p "
You are the Frontend Developer on Marionette Studios dev team.
Working directory: /agent-workspace
Sprint: [S1/S2/S3/...]
Today's date: $(date +%Y-%m-%d)

Read:
  docs/team-plans/development-execution-plan.md
  docs/api/contracts.md   (API 계약 — Backend Dev가 작성)

Your assigned tasks for this session:
[태스크 번호와 설명]

Constraints:
- Next.js 15 + React 19 (apps/web)
- TailwindCSS v4, no new UI libraries without CTO approval
- After UI changes: run gstack /qa if available, else bun run lint
- Follow existing glassmorphism dark theme

After completion, update TASKS.md with status.
"
```

### DevOps Engineer

```bash
claude --dangerously-skip-permissions -p "
You are the DevOps Engineer on Marionette Studios dev team.
Working directory: /agent-workspace
Sprint: [S1/S2/S3/...]
Today's date: $(date +%Y-%m-%d)

Read the execution plan:
  docs/team-plans/development-execution-plan.md

Your assigned tasks for this session:
[태스크 번호와 설명]

Constraints:
- gstack 0.11.10.0 is the Tier-1 dev tool (/qa, /ship, /canary, /review)
- Docker target: Bun-based images for apps/web, apps/api, apps/scenario-api
- GitHub Actions: Bun test runner, TypeScript strict
- No paid cloud services without CTO approval

After completion, update TASKS.md with status.
"
```

### QA Engineer

```bash
claude --dangerously-skip-permissions -p "
You are the QA Engineer on Marionette Studios dev team.
Working directory: /agent-workspace
Sprint: [S1/S2/S3/...]
Today's date: $(date +%Y-%m-%d)

Read:
  docs/team-plans/development-execution-plan.md  (QA Gate checklist)

Your assigned tasks for this session:
[태스크 번호와 설명]

Tools available:
- Playwright 1.58.2 (E2E tests)
- gstack /qa, /review, /cso, /benchmark, /canary
- bun test (unit tests)

For QA Gate sign-off: check all items in the sprint's QA Gate section.
Output a QA_GATE_REPORT.md in docs/qa/ with pass/fail for each item.

After completion, update TASKS.md with status.
"
```

### Dev Team Lead

```bash
claude --dangerously-skip-permissions -p "
You are the Dev Team Lead on Marionette Studios dev team.
Working directory: /agent-workspace
Sprint: [S1/S2/S3/...]
Today's date: $(date +%Y-%m-%d)

Read:
  docs/team-plans/development-execution-plan.md
  TASKS.md

Your job:
1. Review all open PRs (git log --oneline -20)
2. Check TASKS.md for P0 blockers
3. Update sprint progress in docs/meetings/[today]-sprint-standup.md
4. Escalate any risks to CTO via docs/meetings/

Sprint gate policy: Dev Team Lead owns QA Gate sign-off before sprint closes.
"
```

---

## 병렬 에이전트 실행

독립 태스크는 tmux로 병렬 실행:

```bash
vagrant ssh   # VM 진입 후

# tmux 세션 시작
tmux new-session -d -s agents

# Backend Dev (window 0 — 이미 열려있음)
tmux send-keys -t agents "cd /agent-workspace && claude --dangerously-skip-permissions -p 'You are Backend Dev...'" Enter

# Frontend Dev (window 1)
tmux new-window -t agents
tmux send-keys -t agents "cd /agent-workspace && claude --dangerously-skip-permissions -p 'You are Frontend Dev...'" Enter

# DevOps (window 2)
tmux new-window -t agents
tmux send-keys -t agents "cd /agent-workspace && claude --dangerously-skip-permissions -p 'You are DevOps...'" Enter

# 모니터링
tmux attach -t agents   # Ctrl+B, 숫자로 창 전환
```

**주의:** 같은 파일을 동시에 수정하면 충돌 발생. 병렬 실행 전 파일 소유권 분리 확인.

| 병렬 OK | 순차 필수 |
|--------|---------|
| Backend API ↔ Frontend UI (다른 파일) | API 계약 확정 → Frontend 시작 |
| DevOps CI ↔ QA 테스트 작성 | 기능 구현 → QA 검증 |
| 복수 독립 에이전트 구현 | Sprint Gate → 다음 Sprint 시작 |

---

## 안전 주의사항

| 항목 | 설명 |
|------|------|
| **양방향 파일 동기화** | VM 안에서 삭제한 파일은 호스트에서도 삭제됨. git 커밋 후 에이전트 실행 권장 |
| **네트워크 격리 없음** | VM은 인터넷 접근 가능. 유료 API 호출 정책 코드에 반영되어 있음 |
| **VM escape** | 이론적으로 가능하나 threat model 밖 (개발 사고 방지 목적) |
| **git 안전망** | 에이전트 세션 시작 전 항상 `git commit -m "checkpoint"` 실행 |

---

## 트러블슈팅

| 증상 | 해결 |
|------|------|
| `vagrant up` 후 CPU 100% | VirtualBox 7.2.4 버그 → `vb.customize ["modifyvm", :id, "--nested-hw-virt", "on"]` (이미 적용됨) |
| 파일 동기화 안 됨 | `vagrant reload` |
| bun not found in VM | `. ~/.bashrc` 또는 `/root/.bun/bin/bun` 직접 호출 |
| PostgreSQL 연결 실패 | `sudo systemctl start postgresql` (VM 재시작 후) |
| claude 명령어 없음 | `npm install -g @anthropic-ai/claude-code --no-audit` |
| VM 완전 고장 | `vagrant destroy -f && vagrant up` (5분) |

---

## 스프린트별 권장 VM 활용

| Sprint | 주요 에이전트 작업 | VM 필요성 |
|--------|-------------------|----------|
| S1 | OpenAI 제거, API wiring, gstack setup | **높음** — 대규모 파일 수정 |
| S2 | 3개 신규 에이전트 구현, UI 패널 | **높음** — 신규 코드 작성 |
| S3 | FFMPEG, WebSocket, E2E 전체 파이프라인 | **매우 높음** — 시스템 수준 작업 |
| S4 | Docker 빌드, CI/CD 설정, gstack /ship | **매우 높음** — 인프라 변경 |
| S5 | 인증, 베타 배포 | **높음** — 보안 민감 코드 |

---

*CTO Agent Dispatch Playbook · Marionette Studios · 2026-03-30*
