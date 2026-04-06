# 2. Art Bible

## 2.1 Color Palette

| Name | Hex | Usage |
|---|---|---|
| Electric Blue | `#00FFFF` | Hero energy effects, Khata shields |
| Neon Pink | `#FF00FF` | Enemy corruption, boss attacks |
| Toxic Green | `#39FF14` | Radioactive beet perk, poison effects |
| Ultra-Violet | `#7F00FF` | Mausoleum aura, void effects |
| Deep Black | `#0A0A0A` | Outlines, background void |
| Folk Gold | `#FFD700` | Golden Coupon perk, UI highlights |
| Soviet Red | `#CC0000` | Enemy badges, warning UI |
| Acid Yellow | `#FFFF00` | Explosion cores, critical hits |

Background gradient: `#0A0A1A` → `#1A0A2E` (deep neon night)

## 2.2 Character Design

### Serhiy (Hero)
- Stocky build, embroidered vyshyvanka with circuit-board patterns
- Cyber-enhanced tractor cab as lower body / mobility platform
- Energy cannon: glowing blue barrel with folk motif engravings
- Expressions: stoic determination, brief grin on kill streaks

### Khata (Base Structure)
Three upgrade states, each adding tech layered over folk architecture:
1. **Traditional** — wood, thatch, sunflower garden, warm lantern glow
2. **Reinforced** — iron plating, sandbags, neon warning strips
3. **Cyber-Sich** — holographic banners, plasma dome, rotary defence turret

## 2.3 Enemy Design

All enemies wear Soviet-era administrative uniforms corrupted by neon acid:

| Enemy | Silhouette Feature | Attack Style |
|---|---|---|
| Zombie Clerk | Hunched, briefcase tentacles | Melee swipe |
| Zombie Archivist | Tall, paper-roll flail | Ranged paper throw |
| Zombie Inspector | Peaked cap, glowing badge | Charge rush |
| Zombie Deputy | Double-breasted suit, extra arms | Area stamp |

Design rules:
- Every enemy must have a readable silhouette at 64×64 px.
- Corruption shown through cracks in uniform leaking neon light.
- Death animation: dissolve into floating stamps/papers + neon burst.

## 2.4 Boss Design — Comrade Vakhtersha

- Massive metal desk as lower body (tank treads hidden underneath)
- Upper body: enormous Soviet matron in full uniform
- Weapons: rubber stamp artillery, paper-barrier walls, bell-summon minions
- Phase 2 (50% HP): desk splits, reveals rocket boosters; attacks speed up
- Phase 3 (20% HP): full neon meltdown, chromatic aberration on entire screen

## 2.5 UI Style Guide

- Font: blocky pixel-style with Ukrainian letter support
- HUD elements: dark translucent panels (`rgba(0,0,0,0.7)`) with neon borders
- Wave counter: top-centre, large, pulsing on new wave
- HP bar: Khata silhouette fills/drains left-to-right with Soviet Red → Electric Blue gradient
- Perk cards: portrait + name + description + synergy hint, neon card border matching perk colour
- All UI assets: PNG, no anti-aliasing on outlines
