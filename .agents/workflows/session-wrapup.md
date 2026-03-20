---
description: Run this workflow at the end of a coding session to sync documentation and commit changes.
---
# Session Wrap-up Workflow

This workflow automates the process of saving the session's resulting work into feature documents, updating the README, and committing to git.

1. **Summarize Features:** Review the work done in the current session. Create a new markdown file in the `docs/features/` directory (e.g., `docs/features/parser-enhancement.md`) documenting the architectural updates, feature capabilities, and any new APIs or structures introduced.
2. **Update README:** Read the files in `docs/features/` and automatically update the `README.md` file's `## Features` section to include links and short descriptions for each feature document.
// turbo
3. `git add docs/features/ README.md`
// turbo
4. `git commit -m "docs: auto-sync feature documentation and update README"`

### Git Flow Branch Strategy
5. **Branch Verification:** Ensure that your current session's work was committed to an appropriate branch according to standard Git Flow:
   - `main`: Production-ready code only.
   - `develop`: Main development branch containing the latest stable features.
   - `feature/<name>`: For new features or updates (e.g., `feature/pdf-parser`).
   - `hotfix/<name>`: For urgent production fixes.
6. **Merge to Develop:** If the feature is completed, run the appropriate git commands to merge the `feature/` branch into the `develop` branch.
// turbo
7. `git push origin develop` (or the current active branch if remote is configured)
