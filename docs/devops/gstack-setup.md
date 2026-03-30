# gstack Setup

## Status: Installed

- **Version**: 0.11.9.0
- **Install type**: Symlinked Claude Code skill
- **Source path**: `/Users/daniel/dev/antigravity-dev/gstack`
- **Skills path**: `~/.claude/skills/gstack` → source
- **Health**: Operational (all skill symlinks resolve correctly)
- **Verified**: 2026-03-30

## Available Skills (28)

| Skill | Description |
|-------|-------------|
| autoplan | Auto-review pipeline |
| benchmark | Performance regression detection |
| browse | Headless browser for QA/dogfooding |
| canary | Post-deploy canary monitoring |
| careful | Safety guardrails for destructive commands |
| codex | OpenAI Codex CLI wrapper |
| cso | Chief Security Officer audit mode |
| design-consultation | Design system consultation |
| design-review | Visual QA review |
| document-release | Post-ship documentation update |
| freeze | Restrict edits to a directory |
| gstack-upgrade | Upgrade gstack to latest |
| guard | Full safety mode (careful + freeze) |
| investigate | Systematic debugging |
| land-and-deploy | Merge + deploy workflow |
| office-hours | YC Office Hours mode |
| plan-ceo-review | CEO/founder plan review |
| plan-design-review | Designer plan review |
| plan-eng-review | Eng manager plan review |
| qa | QA test + fix bugs |
| qa-only | Report-only QA testing |
| retro | Weekly engineering retrospective |
| review | Pre-landing PR review |
| setup-browser-cookies | Import browser cookies |
| setup-deploy | Configure deployment settings |
| ship | Ship workflow (test, review, bump, push, PR) |
| unfreeze | Clear freeze boundary |

## Usage

gstack skills are invoked as Claude Code slash commands:

```
/browse       # Launch headless browser
/review       # Pre-landing PR review
/ship         # Full ship workflow
/retro        # Weekly retrospective
```

## Relevant Skills for This Project

| Skill | Purpose in Production Pipeline |
|-------|-------------------------------|
| /qa | QA test the scenario web dashboard and API |
| /review | Pre-landing PR review for pipeline changes |
| /ship | Full ship workflow (test, review, bump, push, PR) |
| /canary | Post-deploy monitoring after shipping |
| /cso | Security audit for API keys, provider secrets |
| /benchmark | Performance regression detection for API endpoints |

## Notes

- gstack is not a standalone CLI binary — it operates as a Claude Code skill pack
- Skills are loaded via symlinks from `~/.claude/skills/` pointing into the gstack source
- To upgrade: `/gstack-upgrade`
