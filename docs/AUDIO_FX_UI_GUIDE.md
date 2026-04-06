# ACID KHUTIR — AUDIO / FX / UI / PROMPTS GUIDE
## Part 8.6 — Full Reference

---

## 8.6.1 — AUDIO GUIDE

### Music Style Overview
The soundtrack blends:
- Acid-folk rave
- Trembita bass drones
- Glitch percussion
- UV-reactive synths
- Neon psy-folk motifs
- Carpathian folk instruments processed through distortion

### Level 1 Music Layers
| Layer | Name                    | Trigger       | BGM Rate |
|-------|-------------------------|---------------|----------|
| 1     | "Quiet Khutir"          | Wave 1 start  | ×0.85    |
| 2     | "Incoming Bureaucrats"  | Wave 2 start  | ×1.0     |
| 3     | "Combat Rave"           | Wave 3 start  | ×1.1     |
| 4     | "Mini-Boss Overdrive"   | Boss spawn    | ×1.25    |

**Layer 1 — "Quiet Khutir"**
- Soft trembita pads
- Low glitch crackle
- Neon Pink plucks

**Layer 2 — "Incoming Bureaucrats"**
- Acid bassline
- Electric Blue arpeggios
- Pysanka-pattern rhythmic pulses

**Layer 3 — "Combat Rave"**
- Full rave beat
- Toxic Green distortion
- Glitch snares

**Layer 4 — "Mini-Boss Overdrive"**
- Ultra-Violet synth lead
- Concrete rumble bass
- Stamp-slam percussion

### SFX Categories
**Player:**
- Plasma wrench shot
- Cyber-arm servo whirr
- Damage glitch pop

**Enemies:**
- Zombie Clerk: paper tearing + glitch
- Archivarius: magnetic tape whip
- Inspector: bureaucratic stamp slam

**Boss:**
- Concrete crack rumble
- Glitch-monitor screech
- Toxic steam hiss

**UI:**
- Neon click
- Rushnyk swipe
- Pysanka pulse

### Voice Lines (UA + EN)
See section 8.6.9.

---

## 8.6.2 — FX GUIDE

### Core FX Rules
- Neon glow (Electric Blue `#0088ff`, Neon Pink `#ff00aa`)
- Electric smoke
- Glitch aura
- Chromatic aberration
- Flat neon colors
- Thick black outlines

### FX Types

#### Bullet FX — `fx_bullet_blue`
- Colors: Electric Blue + Ultra-Violet
- Motion: long streak, slight glitch jitter
- Code key: `particle_electric_blue` trail, `particle_ultra_violet` streak

#### Hit FX — `fx_hit_01`
- Shape: pysanka burst
- Colors: Neon Pink + Toxic Green
- Code: `_spawnPysankaHitFX(x, y)`

#### Explosion FX — `fx_explosion_01`
- Shape: expanding pysanka mandala
- Colors: Neon Pink + Electric Blue
- Particles: electric smoke
- Code: `_spawnPysankaExplosionFX(x, y)`

#### Boss FX — `fx_boss_explosion_01`
- Shape: glitch storm vortex
- Colors: Ultra-Violet + Toxic Green
- Code: `_spawnBossExplosionFX(x, y)`

---

## 8.6.3 — UI GUIDE

### Style
- Heavy black outlines
- Neon Pink `#ff00aa` + Electric Blue `#0088ff` borders
- Rushnyk patterns inside panels
- Pysanka frames for counters
- Flat neon colors
- Glitch flicker on hover

### Elements

#### Start Button
- Text: **"СТАРТ"**
- Font: Arial Black (Cyber-block)
- Border: Neon Pink `#ff00aa` glow shadow
- On hover: white `#ffffff`

#### HP Bar
- Frame: Rushnyk pattern (rounded dark background + Neon Pink border)
- Fill: Toxic Green `#00ff44` (→ yellow at <50%, pink at <25%)

#### Wave Counter
- Frame: Pysanka ring
- Text: Electric Blue `#0088ff` glow

#### Perk Cards
- Neon rectangles, dark fill
- Glow: Ultra-Violet `#8800ff`
- On hover: scale ×1.07, glow intensifies

#### Boss HP Bar
- Fill: Ultra-Violet `#8800ff` pulsing
- Border: Neon Pink `#ff00aa`

---

## 8.6.4 — ANIMATION PROMPTS

### A) Сергій — Idle (12 frames)
Files: `player_serhiy_idle_01.png` → `player_serhiy_idle_12.png`

```
2D vector-art animation frame, Neon Psychedelic Cyber-Folk.
Serhiy breathing gently, glowing neon vyshyvanka pulsing softly, cyber-arm flickering Electric Blue.
Thick black outlines, bold cel-shading, flat neon colors, transparent background.
Frame number: {X}
```

### B) Сергій — Walk (12 frames)
Files: `player_serhiy_walk_01.png` → `player_serhiy_walk_12.png`

```
Serhiy stepping forward, neon embroidery trailing motion blur, cyber-arm joints glowing.
Thick outlines, cel-shading, flat neon colors, transparent background.
Frame number: {X}
```

### C) Сергій — Shoot (6 frames)
Files: `player_serhiy_shoot_01.png` → `player_serhiy_shoot_06.png`

```
Serhiy firing plasma wrench-cannon, Electric Blue muzzle flash mid-frame, glitch distortion.
Thick outlines, cel-shading, flat neon colors, transparent background.
Frame number: {X}
```

### D) Зомбі-клерк — Walk (8 frames)
Files: `enemy_zombie_clerk_walk_01.png` → `enemy_zombie_clerk_walk_08.png`

```
Zombie Clerk walking stiffly, Toxic Green slime dripping, neon papers fluttering.
Thick outlines, cel-shading, flat neon colors, transparent background.
Frame number: {X}
```

### E) Архіваріус — Attack (6 frames)
Files: `enemy_archivarius_attack_01.png` → `enemy_archivarius_attack_06.png`

```
Archivarius swinging magnetic tape tentacle, LED server eyes glowing Electric Blue.
Thick outlines, cel-shading, flat neon colors, transparent background.
Frame number: {X}
```

### F) Інспектор — Stamp Slam (6 frames)
Files: `enemy_inspector_slam_01.png` → `enemy_inspector_slam_06.png`

```
Inspector raising giant glowing bureaucratic stamp, Neon Pink aura intensifying.
Thick outlines, cel-shading, flat neon colors, transparent background.
Frame number: {X}
```

### G) Міні-Вахтьорша — Phase 1 (8 frames)
Files: `boss_vakhtersha_phase1_01.png` → `boss_vakhtersha_phase1_08.png`

```
Mini-Vakhtersha preparing stamp slam, glitch-monitor face flickering, Toxic Green steam rising.
Thick outlines, cel-shading, flat neon colors, transparent background.
Frame number: {X}
```

### H) Міні-Вахтьорша — Phase 2 (8 frames)
Files: `boss_vakhtersha_phase2_01.png` → `boss_vakhtersha_phase2_08.png`

```
Mini-Vakhtersha entering glitch overdrive, Ultra-Violet cracks glowing, concrete vibrating.
Thick outlines, cel-shading, flat neon colors, transparent background.
Frame number: {X}
```

---

## 8.6.5 — NPC PROMPTS

### `npc_babtsya_healer_idle.png`
```
Babtsya Healer standing with pysanka staff, rushnyk shawl glowing Neon Pink, Ultra-Violet smoke swirling.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

### `npc_mykhas_mechanic_idle.png`
```
Young mechanic Mykhas with neon hoodie, floating wrench-drone glowing Electric Blue, Toxic Green goggles.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

## 8.6.6 — ITEM PROMPTS

### `item_radioactive_beet.png`
```
Neon Toxic Green glowing beet, pysanka patterns carved into surface, glitch aura, electric smoke.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

### `item_golden_coupon.png`
```
Golden bureaucratic coupon glowing Neon Pink, embossed rushnyk patterns, glitch shimmer.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

### `item_iron_seal.png`
```
Heavy iron seal with glowing Ukrainian ornament, Ultra-Violet aura, electric smoke.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

## 8.6.7 — CUTSCENE PROMPTS

### `cutscene_intro_01.png`
```
Serhiy standing on cyber-hut hill, neon storm behind him, glitch lightning striking server towers.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

### `cutscene_boss_entrance.png`
```
Mini-Vakhtersha emerging from glitch rift, concrete arms unfolding, Toxic Green steam rising.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

## 8.6.8 — COMIC PANEL PROMPTS

### `comic_panel_01.png`
```
Comic-style panel, Neon Psychedelic Cyber-Folk.
Serhiy shouting at zombie clerks, speech bubble in Prykarpattia dialect.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

## 8.6.9 — LOCALIZATION

### System Messages

| Key         | UA (Прикарпатська)                              | EN (dark comedy)                                    |
|-------------|------------------------------------------------|-----------------------------------------------------|
| `youDied`   | Та ти впав, Сергію… як мішок бараболі.          | You died, Serhiy… like a sack of potatoes.          |
| `hutBurned` | Хата згоріла, як минулорічний сніг.             | The hut burned down like last year's tax records.   |
| `victory`   | Перемога! Та файно!                             | Victory! Miracles do happen.                        |

### NPC Dialogue

**Бабця-знахарка (Babtsya Healer)**
- UA: `Та йди сюди, я тебе вичухаю, як кота на Спаса!`
- EN: `Come here, I'll fix you up like a cat on a holy day.`

**Михась (Mykhas)**
- UA: `Та я то всьо на коліні скручу!`
- EN: `I can fix it with duct tape and trauma.`

---

## 8.6.10 — LEVEL 1 SPEC

```
Arena:    Cyber-Khutir
Size:     1280×720
Background: background_khutir_01.png

Wave 1:  6 Zombie Clerks
Wave 2:  8 Zombie Clerks + 2 Archivarius
Wave 3:  10 Zombie Clerks + 3 Archivarius + 1 Inspector

Mini-Boss: Mini-Vakhtersha (HP 600)

NPC:     Babtsya Healer (heals 20 HP once, triggers at <50% hut HP)

Victory:  Boss defeated
Failure:  Hut destroyed

Music:   Layer 1 → Layer 2 → Layer 3 → Boss Layer
```
