# 6. Balancing

## 6.1 Damage Formula

```
damage = baseDamage × (1 + perkMultiplier) × critMultiplier
```

- `baseDamage`: hero weapon base (default: 10)
- `perkMultiplier`: sum of active perk damage bonuses (0.0–1.5 range)
- `critMultiplier`: 1.0 normally, 2.0 on critical hit (10% chance base)

## 6.2 Enemy HP Formula

Piecewise linear scaling (no exponential):

```
hp(wave) = baseHP × hpMultiplier(wave)
```

| Enemy | baseHP | Multipliers per wave block (see §4.4) |
|---|---|---|
| Clerk | 30 | ×1.0, ×1.3, ×1.7, ×2.2 |
| Archivist | 50 | ×1.0, ×1.3, ×1.7, ×2.2 |
| Inspector | 80 | ×1.0, ×1.3, ×1.7, ×2.2 |
| Deputy | 120 | ×1.0, ×1.3, ×1.7, ×2.2 |
| Vakhtersha | 2000 | fixed |

## 6.3 Speed Formula

```
speed(wave) = baseSpeed × speedMultiplier(wave)
```

| Enemy | baseSpeed (px/s) |
|---|---|
| Clerk | 80 |
| Archivist | 55 |
| Inspector | 110 |
| Deputy | 65 |

Speed multipliers per wave block: ×1.0, ×1.1, ×1.2, ×1.35 (see §4.4).

Radioactive Beet perk applies −20% to all speed values.

## 6.4 Gold Formula

```
gold(enemy) = baseGold × (1 + 0.05 × (wave - 1))
```

| Enemy | baseGold |
|---|---|
| Clerk | 5 |
| Archivist | 8 |
| Inspector | 12 |
| Deputy | 18 |
| Vakhtersha | 500 |

Total wave gold growth ≈ +10% per wave. Golden Coupon perk adds +30%.

## 6.5 Wave Tables

| Wave | Enemies | Spawn interval | Total enemy count |
|---|---|---|---|
| 1 | Clerk | 1200 ms | 5 |
| 2 | Clerk, Archivist | 1100 ms | 7 |
| 3 | Clerk, Inspector | 1000 ms | 8 |
| 4 | All basic | 900 ms | 10 |
| 5 | **Perk selection** | — | — |
| 6–9 | Mixed, increased count | 800 ms | 12–15 |
| 10 | **Perk selection** | — | — |
| 11–14 | All types, Deputy introduced | 700 ms | 15–18 |
| 15 | **Perk selection** | — | — |
| 16–19 | Dense mixed waves | 600 ms | 20–25 |
| 20 | **BOSS: Vakhtersha** | — | 1 (+minions) |

Reference balance target: a player with no perks should survive to wave 12–14 before being overwhelmed.
