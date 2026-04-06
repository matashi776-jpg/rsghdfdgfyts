# 7. Team Guidelines

## 7.1 Commit Rules

See full reference: [COMMIT_RULES.md](../COMMIT_RULES.md)

Quick cheatsheet:
```
feat(scope): add something new
fix(scope): fix a bug
refactor(scope): restructure without behaviour change
docs: update documentation
perf: performance improvement
chore: build/tooling/deps
```

## 7.2 Branching Strategy

See full reference: [BRANCHING.md](../BRANCHING.md)

```
main       ← tagged stable releases
develop    ← integration, always deployable
feature/*  ← new work
hotfix/*   ← urgent fixes
release/*  ← pre-release QA
```

Never push directly to `main` or `develop`. Always use Pull Requests.

## 7.3 PR Rules

See the [Pull Request Template](../../.github/PULL_REQUEST_TEMPLATE.md).

Every PR must include:
- Clear description of what changed and why
- Screenshots or recordings for any UI/art change
- List of affected files
- Completed checklist (no console errors, code style, no duplicate logic)

## 7.4 Asset Pipeline

### For artists

- Format: **PNG**, transparent background
- Resolution: **2048×2048** (sprites), **1920×1080** (backgrounds)
- Style: heavy black outlines, cel-shading, neon palette (see [Art Bible](./2-Art-Bible.md))
- Animations: **8–12 frames**, exported as individual PNGs, named `enemyClerk_walk_01.png` … `_12.png`
- Glow effects: **paint glow into the PNG** — do not rely on shaders alone
- Deliver to: `/assets/sprites/` (characters/enemies), `/assets/ui/` (HUD), `/assets/audio/` (music/SFX)

### For AI generators (Gemini / Midjourney / DALL·E)

Use the master prompt from [AI_PROMPTS.md](../AI_PROMPTS.md):

```
Neon Psychedelic Cyber-Folk 2D sprite, heavy black outlines, cel-shading,
UV-reactive patterns, glowing embroidery, electric smoke, chromatic aberration,
Ukrainian folk motifs, acid neon colors (Electric Blue #00FFFF, Neon Pink #FF00FF,
Toxic Green #39FF14, Ultra-Violet #7F00FF), hand-drawn animation style,
high contrast, readable silhouette. PNG 2048×2048, transparent background.
```

Always review AI-generated art against the silhouette rule: readable at 64×64 px.

### Asset naming convention

```
<category>_<subject>_<variant>_<frame>.png

Examples:
  sprite_hero_idle_01.png
  sprite_enemyClerk_walk_04.png
  ui_hpBar_fill.png
  ui_perkCard_golden.png
```
