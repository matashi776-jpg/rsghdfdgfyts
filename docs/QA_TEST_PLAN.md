# QA TEST PLAN — ACID KHUTIR Stage 1

## 1. Smoke Tests

| # | Test | Expected |
|---|------|----------|
| S1 | Open `npm run dev` in browser | Game loads, loading bar fills, MenuScene appears |
| S2 | Click "РОЗПОЧАТИ КАМПАНІЮ" | Fades to StoryScene |
| S3 | Launch GameScene directly via console (`game.scene.start('GameScene')`) | Background renders, player spawns |
| S4 | Launch BossScene directly | Boss arena renders, Vakhtersha spawns |

## 2. Asset Loading

| # | Test | Expected |
|---|------|----------|
| A1 | All PNG files present in `public/assets/` | No `loaderror` in console |
| A2 | Remove one asset file | Console warning; fallback neon texture renders in its place |
| A3 | Check all animation frames | Player idle/walk/shoot animations play without gaps |
| A4 | Boss phase1/phase2 frames | Phase 1 plays on spawn; phase 2 plays after 50% HP |

## 3. Player

| # | Test | Expected |
|---|------|----------|
| P1 | WASD / Arrow key movement | Player moves in 8 directions, collides with world bounds |
| P2 | Auto-fire | Bullets spawn toward nearest enemy at correct fire rate |
| P3 | Take damage | HP bar decreases; brief red tint |
| P4 | HP reaches 0 | Game-over overlay appears |
| P5 | Shield perk active | Player takes no damage for 10 s |

## 4. Enemies

| # | Test | Expected |
|---|------|----------|
| E1 | Wave 1 spawns | Only ZombieClerk enemies appear |
| E2 | Wave 2 spawns | ZombieClerk + Archivarius mix |
| E3 | Wave 3+ spawns | ZombieClerk + Archivarius + Inspector mix |
| E4 | Zombie clerk contact | Player HP reduced by 15 per contact |
| E5 | Archivarius ranged | Throws paper projectile toward player |
| E6 | Inspector slam | AoE slam at ≤ 180 px; camera shake |
| E7 | Enemy death | Score increases; FX explosion spawns |

## 5. Wave System

| # | Test | Expected |
|---|------|----------|
| W1 | All enemies in wave dead | Wave-complete banner appears |
| W2 | Wave 4 complete | Boss scene transition begins |
| W3 | Between-wave | Perk selection overlay appears; physics paused |

## 6. Perk System

| # | Test | Expected |
|---|------|----------|
| PK1 | Perk card displayed | 3 random perks shown with labels |
| PK2 | Select "+25% Урон" | `projectileSystem.damage` increases by 25% |
| PK3 | Select "Відновити 30% HP" | Player HP increases (capped at maxHp) |
| PK4 | After selection | Overlay removed; next wave starts |

## 7. Boss Scene

| # | Test | Expected |
|---|------|----------|
| B1 | Boss intro text | "ВАХТЕРША НАДХОДИТЬ!" appears briefly |
| B2 | Phase 1 attack | Single-projectile pattern |
| B3 | HP < 50% | Phase 2 triggers; triple-shot pattern; glitch storm FX |
| B4 | Boss defeated | Victory overlay with score |
| B5 | Player HP reaches 0 | Game-over overlay |

## 8. UI / HUD

| # | Test | Expected |
|---|------|----------|
| U1 | HP bar | Updates in real time; turns empty at 0 |
| U2 | Wave label | Shows correct wave number |
| U3 | Score counter | Increments on every kill |
| U4 | Game-over "ГРАТИ ЗНОВУ" button | Restarts to MenuScene |
| U5 | Victory "У МЕНЮ" button | Returns to MenuScene |

## 9. Build

| # | Test | Expected |
|---|------|----------|
| BU1 | `npm run build` | Exits 0; `dist/` populated |
| BU2 | Serve `dist/` statically | Game runs identical to dev server |

## 10. Regression

After any code change, re-run S1–S4 and W1–W3.
