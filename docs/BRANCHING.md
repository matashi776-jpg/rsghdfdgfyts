# Branching Strategy — ACID KHUTIR

We follow **Git Flow**.

## Branch Overview

```
main          ← stable releases only (tagged)
develop       ← integration branch, always deployable
feature/*     ← new features and gameplay systems
hotfix/*      ← urgent fixes applied directly to main
release/*     ← pre-release stabilisation & versioning
```

## Workflow

### Starting a new feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/radioactive-beet-perk
```

### Finishing a feature
```bash
# Merge into develop via Pull Request — no direct pushes to develop
```

### Hotfix
```bash
git checkout main
git checkout -b hotfix/bullet-collision-fix
# ... fix ...
# Open PR to both main and develop
```

### Release
```bash
git checkout develop
git checkout -b release/1.2.0
# bump version, final QA
# Merge into main (tag) and back into develop
```

## Rules

- `main` and `develop` are **protected branches** — no direct pushes.
- All merges to `develop` or `main` require a Pull Request with at least one review.
- Delete feature branches after merge.
- Prefix branches: `feature/`, `hotfix/`, `release/`, `docs/`, `chore/`.
