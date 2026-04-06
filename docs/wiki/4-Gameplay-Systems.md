# 4. Gameplay Systems

## 4.1 Wave System

Waves are data-driven. Each wave is defined in `/src/core/WaveData.js`:

```js
{ wave: 1, enemies: [{ type: 'Clerk', count: 5, interval: 1200 }] }
```

Wave flow:
1. `WaveSystem.startWave(n)` reads wave data, enqueues spawn events.
2. Enemies spawn at the right edge of the screen at the configured interval.
3. Wave ends when all spawned enemies are dead or have reached the Khata.
4. After waves 5, 10, 15, 20: trigger `PerkScene`.
5. After wave 20: trigger `BossPhase`.

**Difficulty scaling:** every 5 waves, enemy HP and speed are multiplied by the Difficulty Director factor (see §4.4).

## 4.2 Perk System

Perks are offered every 5 waves. The player chooses 1 of 3 randomly selected perks.

| Perk | Effect | Synergy |
|---|---|---|
| Golden Coupon | +30% gold from kills | + Iron Seal → gold on block |
| Radioactive Beet | Bullets slow enemies (−20% speed) | + Golden Coupon → bonus gold on slow-kill |
| Iron Seal | Khata blocks 1 hit per wave | + Radioactive Beet → slowed enemies deal −50% damage |

Perks are stored in `GameState.perks[]` and queried by systems at runtime.  
Maximum 3 perks total (one per perk-selection screen).

## 4.3 Meta Progression

Between runs, players earn **Hryvnia** (meta currency) based on:
- Waves survived × 10
- Boss defeated: +500
- Khata HP remaining: × 5 per point

Hryvnia unlocks permanent upgrades in `KhutirScene`:
- Khata HP +10 (max ×3)
- Starting gold +50 (max ×5)
- Extra perk slot (unlocks 4th perk choice per screen)

Meta state persisted in `localStorage` via `/src/core/SaveSystem.js`.

## 4.4 Difficulty Director

A simple piecewise-linear scaler applied per 5-wave block:

| Wave range | HP multiplier | Speed multiplier |
|---|---|---|
| 1–5 | ×1.0 | ×1.0 |
| 6–10 | ×1.3 | ×1.1 |
| 11–15 | ×1.7 | ×1.2 |
| 16–20 | ×2.2 | ×1.35 |
| Boss | ×5.0 | ×1.0 |

No exponential growth — the curve is intentionally linear to keep late waves hard but not impossible without perks.

## 4.5 Boss Phases — Comrade Vakhtersha

| Phase | Trigger | New Behaviour |
|---|---|---|
| Phase 1 | Start | Stamp artillery (predictable arcs), slow advance |
| Phase 2 | 50% HP | Desk splits → rocket boosters; attack rate ×1.5; spawns Clerk minions |
| Phase 3 | 20% HP | Full neon meltdown; chromatic aberration screen effect; random charge rushes |

Boss is immune to slow effects. Iron Seal perk blocks one stamp salvo per phase.
