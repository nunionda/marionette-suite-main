# Marionette Studios — Development Team Plan

**Company:** Marionette Studios (MAR)
**Date:** 2026-03-29
**Author:** CTO
**Status:** Active

---

## Context: 5-Layer Organization Structure

Marionette Studios operates a 5-layer AI agent organization designed for autonomous film production:

| Layer | Role | Responsibility |
|-------|------|---------------|
| L1 — Board | CTO / Oversight | Strategic direction, budget, hiring approval |
| L2 — Executives | Head of Development | Coordinates all technical teams |
| L3 — Team Leads | Dev Team Lead | Owns sprint planning, reviews, and delivery |
| L4 — Specialists | Developers / Engineers | Build and maintain production systems |
| L5 — Support | QA / DevOps | Quality assurance and infrastructure reliability |

---

## Development Team Composition

### L2 — Executive (existing)

| Agent | Role | Paperclip Role | Reports To |
|-------|------|---------------|-----------|
| Head of Development | Technical executive, owns all engineering | `ceo` | Board (CTO) |

### L3 — Team Lead (new hire)

| Agent | Title | Paperclip Role | Capabilities | Reports To |
|-------|-------|---------------|-------------|-----------|
| Dev Team Lead | Development Team Lead | `pm` | Sprint planning, code review coordination, backlog grooming, delivery tracking, cross-team alignment | Head of Development |

### L4 — Specialists (new hires)

| Agent | Title | Paperclip Role | Capabilities | Reports To |
|-------|-------|---------------|-------------|-----------|
| Frontend Developer | Senior Frontend Developer | `engineer` | React/Next.js, UI/UX implementation, component design, state management, API integration, accessibility | Dev Team Lead |
| Backend Developer | Senior Backend Developer | `engineer` | Node.js/Python, REST/GraphQL APIs, database design, business logic, AI pipeline integration, performance optimization | Dev Team Lead |

### L5 — Support (new hires)

| Agent | Title | Paperclip Role | Capabilities | Reports To |
|-------|-------|---------------|-------------|-----------|
| DevOps Engineer | DevOps & Infrastructure Engineer | `engineer` | CI/CD pipelines, Docker/container orchestration, cloud infrastructure, monitoring, deployment automation, security hardening | Dev Team Lead |
| QA Engineer | Quality Assurance Engineer | `general` | Test plan design, automated testing, regression testing, bug triage, acceptance criteria validation, release sign-off | Dev Team Lead |

---

## Reporting Hierarchy

```
CTO (Board)
└── Head of Development (L2)
    └── Dev Team Lead (L3)
        ├── Frontend Developer (L4)
        ├── Backend Developer (L4)
        ├── DevOps Engineer (L5)
        └── QA Engineer (L5)
```

---

## Responsibilities by Role

### Dev Team Lead
- Owns daily standups and sprint ceremonies
- Reviews and merges pull requests from L4/L5
- Reports progress to Head of Development
- Escalates blockers and risks
- Maintains team velocity metrics

### Frontend Developer
- Builds and maintains `production_pipeline` web UIs
- Implements design system components
- Integrates with backend APIs
- Owns accessibility and performance on the client side

### Backend Developer
- Designs and maintains REST/GraphQL services
- Integrates AI model providers (Gemini Free, Ollama, HuggingFace)
- Owns database schemas and migrations
- Implements business logic for film production workflows

### DevOps Engineer
- Manages CI/CD for all 4 subprojects
- Provisions and monitors cloud/local infrastructure
- Automates deployment pipelines
- Ensures observability (logging, metrics, alerting)

### QA Engineer
- Writes and executes test plans for each release
- Owns regression suite and automated test coverage
- Validates AI pipeline outputs against acceptance criteria
- Signs off on releases before production deployment

---

## Constraints

- **LLM API Policy:** All agents use free-tier models only (Gemini Free → Ollama → HuggingFace → Groq Free → Anthropic Claude within credit limit). No OpenAI or DeepSeek.
- **Paperclip `requireBoardApprovalForNewAgents`:** Set to `true` — all hires require board approval.
- **Budget:** Monthly budget set to 0 per agent (cost-controlled via free model policy).

---

## Paperclip Agent IDs (post-registration)

| Agent | ID |
|-------|----|
| Head of Development | `446ee5dd-832b-44eb-b481-1326a868d1bb` |
| Dev Team Lead | `579327be-1e6a-42ac-a8b1-2409a4a52dd0` |
| Frontend Developer | `855adf1c-0017-4559-84b5-8f53011c94d0` |
| Backend Developer | `85ee4109-8fb8-4e47-95f7-1086c547c582` |
| DevOps Engineer | `e54ec358-da13-4833-89a2-afbcec1ef4e6` |
| QA Engineer | `42d4c1fb-81ef-4c80-94ac-daaced2fc682` |
