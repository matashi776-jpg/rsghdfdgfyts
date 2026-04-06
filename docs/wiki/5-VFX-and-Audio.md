# 5. VFX & Audio

## 5.1 VFX System

All visual effects are managed by `/src/systems/VFXSystem.js`.

Public API:

```js
VFXSystem.hitEffect(x, y, color)     // brief spark burst on hit
VFXSystem.deathBurst(x, y, type)     // enemy death explosion
VFXSystem.glitchFlash(intensity)     // full-screen glitch overlay
VFXSystem.hitStop(duration)          // freeze game for N ms
VFXSystem.cameraShake(magnitude)     // Phaser camera shake wrapper
VFXSystem.neonTrail(object, color)   // motion trail on fast projectiles
```

Implementation notes:
- Particle emitters are pooled — pre-created at scene init, reused per effect.
- `hitStop` pauses physics via `scene.physics.pause()` and resumes after `duration` ms.
- Glitch flash uses a full-screen rectangle tween at low alpha.

## 5.2 Shader Guide

Phaser 3 WebGL pipeline shaders (optional, progressive enhancement):

| Shader | Effect | When to apply |
|---|---|---|
| Chromatic Aberration | RGB channel separation | Boss Phase 3, death of major enemy |
| Scanlines | CRT scanline overlay | Menu scene only |
| Bloom | Glow around neon objects | Always-on, low intensity |
| Distortion | Wave distortion | Mausoleum virus proximity |

Shader fallback: if WebGL is unavailable, all shader effects are skipped gracefully.

## 5.3 Camera Effects

Managed through `VFXSystem.cameraShake(magnitude)` which wraps:

```js
scene.cameras.main.shake(duration, intensity);
```

| Trigger | Magnitude | Duration |
|---|---|---|
| Bullet hits Khata | 0.004 | 150 ms |
| Enemy death cluster (5+) | 0.006 | 200 ms |
| Boss stamp salvo | 0.010 | 300 ms |
| Boss phase transition | 0.020 | 500 ms |

Camera shake must be capped: if 3+ shakes are queued, only the strongest plays.

## 5.4 Audio Style Guide

Genre: **Acid Folk** — Ukrainian folk instruments processed through lo-fi electronic filters.

| Track | Usage |
|---|---|
| `menu_theme.ogg` | Menu scene, gentle bandura loop |
| `battle_ambient.ogg` | Waves 1–10, mid-tempo |
| `battle_intense.ogg` | Waves 11–20, fast, distorted |
| `boss_theme.ogg` | Vakhtersha encounter |
| `perk_jingle.ogg` | Perk selection screen |
| `victory.ogg` | Run complete |
| `defeat.ogg` | Khata destroyed |

SFX categories (all in `/assets/audio/sfx/`): `shoot_*, hit_*, death_*, ui_*, boss_*`.

Audio rules:
- All audio managed by `/src/systems/AudioSystem.js`.
- Music crossfades over 1 second on scene transitions.
- SFX volume independent of music volume (separate mixer channels).
- All audio files: OGG (primary) + MP3 (fallback).
