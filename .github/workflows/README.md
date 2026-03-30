# GitHub Actions Workflows

## Workflows

### ci.yml — Continuous Integration

Runs on every push to `main` and on pull requests targeting `main`.

Three parallel jobs:
- **TypeScript Typecheck** — `bun run typecheck`
- **Tests** — `bun run test`
- **Lint** — `bun run lint`

All jobs use `ubuntu-latest` with Bun (not Node/npm).

## Running Locally Before Pushing

Run the same checks CI will run:

```bash
# All three checks (same as CI)
bun run typecheck && bun run test && bun run lint

# Or individually
bun run typecheck    # Type checking
bun run test         # All tests
bun run lint         # ESLint
```

The `lint:claude` script is an alias for `lint` — use either.

## Adding New Workflows

- Use `oven-sh/setup-bun@v2` for Bun setup
- Use `bun install --frozen-lockfile` to respect the lockfile
- Keep jobs parallel when independent (typecheck, test, lint don't depend on each other)
