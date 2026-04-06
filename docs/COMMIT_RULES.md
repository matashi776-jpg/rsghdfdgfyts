# Commit Rules — ACID KHUTIR

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Format

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

## Types

| Type | When to use |
|---|---|
| `feat` | New feature or gameplay element |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behaviour change |
| `style` | Formatting, whitespace, no logic change |
| `docs` | Documentation only |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build system, dependencies, CI config |
| `revert` | Reverts a previous commit |

## Scopes

Common scopes: `battle`, `enemy`, `vfx`, `audio`, `ui`, `perk`, `boss`, `meta`, `wave`, `core`

## Examples

```
feat(perk): add Radioactive Beet perk with area-slow effect
fix(enemy): correct bullet collision on stagger state
refactor(enemy): extract EnemyManager into standalone module
style(battle): format BattleScene.js to project standard
docs(wiki): update Art Bible color palette section
perf(pool): increase ObjectPool reuse for bullet group
```

## Rules

- Summary line ≤ 72 characters, present tense, lowercase.
- Body explains *why*, not *what*.
- Reference issue numbers in footer: `Closes #12`.
