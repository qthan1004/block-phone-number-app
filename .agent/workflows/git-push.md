---
description: Git commit and push workflow with auto-approve for all commands
---

// turbo-all

# Git Commit & Push

1. Check for changes first
```bash
git status --short
```
**If output is empty (nothing to commit) → tell the user "Nothing to commit" and STOP. Do NOT proceed.**

2. Stage, commit, and push
```bash
git add <files>
git commit -m "<type>(<scope>): <subject>"
git push
```

## Commit Convention Reference
- `feat(<scope>)`: new feature (minor bump)
- `fix(<scope>)`: bug fix (patch bump)  
- `refactor(<scope>)`: code change, no feat/fix
- `style`: formatting, whitespace
- `chore`: build, tooling, deps
- `docs`: documentation
- `test`: tests
