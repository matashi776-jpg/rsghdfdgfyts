# AI_PROMPTS.md — Neon Psychedelic Cyber-Folk Art Generation Prompts

> **Rule:** Always use these exact prompts when generating assets with Gemini / Midjourney / DALL·E.  
> Do **not** change the style, palette, or line-thickness between sessions.

---

## 🌈 UNIVERSAL BASE PROMPT
*(Add to every character, enemy, or item prompt)*

```
Neon Psychedelic Cyber-Folk 2D sprite, heavy black outlines, cel-shading, UV-reactive embroidery,
glowing Ukrainian folk patterns, acid neon colors (Electric Blue #00BFFF, Neon Pink #FF00AA,
Toxic Green #39FF14, Ultra-Violet #7F00FF), chromatic aberration edges, electric smoke,
glitch aura, hand-drawn animation style, high contrast, readable silhouette,
centered composition, transparent background, 2048x2048.
```

---

## 🧍 CHARACTERS

### Сергій (Hero — player_idle / player_shoot)
```
Cyber-Folk Ukrainian warrior, male, wearing glowing embroidered vyshyvanka,
holding tractor-parts energy cannon, neon blue energy core,
electric smoke around weapon, heavy black outlines, cel-shading,
acid neon colors, glitch aura, UV-reactive patterns, heroic pose,
2D sprite, transparent background.
```

---

## 🧟 ENEMIES

### Zombie Clerk (enemy_clerk)
```
Zombie Soviet bureaucrat, tall and thin, broken posture, glowing pink eyes,
neon "REJECTED" stamp on forehead, holding folder with glowing papers,
acid neon colors, chromatic aberration, glitchy silhouette,
heavy black outlines, 2D sprite, transparent background.
```

### Archivarius (enemy_archivarius)
```
Undead archivist made of stacked folders, square silhouette,
glowing red stamp eyes, papers floating around, toxic green glow,
heavy black outlines, neon cyber-folk patterns, 2D sprite, transparent background.
```

### Inspector (enemy_inspector)
```
Zombie inspector with giant glowing stamp, bureaucratic armor made of documents,
neon pink and violet glow, glitch aura, heavy black outlines,
2D sprite, transparent background.
```

### Tank Babtsia (enemy_tank)
```
Cyber-folk grandma riding a motorized cooking pot tank, firing glowing dumplings,
neon embroidery, toxic green steam, heavy black outlines,
acid neon palette, 2D sprite, transparent background.
```

---

## 👹 BOSS

### Comrade Vakhtersha (boss_vakhtersha)
```
Giant cyber-folk Soviet gatekeeper woman riding a motorized bucket-tank,
glowing glasses, neon bureaucratic symbols, toxic green boiling steam,
glitch aura, heavy black outlines, acid neon palette, 2D sprite, transparent background.
```

---

## 💥 FX

### Bullet — Electric Blue (fx_bullet_blue)
```
Electric Blue bullet, neon glow, long particle trail, chromatic aberration,
heavy black outline, 2D sprite, transparent background.
```

### Explosion — Neon Folk (fx_explosion_pink)
```
Neon explosion made of glowing folk patterns, pink and violet colors,
electric smoke, glitch aura, 2D sprite, transparent background.
```

### Poison Cloud (fx_poison_cloud)
```
Toxic green and violet poison cloud, swirling particles,
glitch distortion, neon glow, 2D sprite, transparent background.
```

---

## 🖥️ UI ELEMENTS

### Button (ui_button)
```
Neon cyber-folk UI button, glowing embroidery border, acid neon colors,
heavy black outlines, high contrast, 2D UI element, transparent background.
```

### Panel (ui_panel)
```
Cyber-folk neon panel, glowing geometric patterns, dark violet background,
neon pink and blue borders, 2D UI element, transparent background.
```

### Perk Icon (ui_icon_[PERK_NAME])
```
Neon icon representing [PERK NAME], glowing folk ornament,
acid neon palette, heavy black outlines, 2D icon, transparent background.
```
*(Replace `[PERK NAME]` with the actual perk, e.g. "Tractor Beam", "Borshch Shield".)*

---

## 📐 TECHNICAL REQUIREMENTS (all assets)

| Property        | Value                                  |
|-----------------|----------------------------------------|
| Format          | PNG                                    |
| Background      | Transparent (alpha channel)            |
| Size — large    | 2048 × 2048 px                         |
| Size — small FX | 1024 × 1024 px                         |
| Outline         | Black, 4–6 px                          |
| Glow            | Baked into PNG (no post-processing)    |
| Style           | Cel-shading only — no realism/blur     |
| Palette         | See Art Bible: Electric Blue, Neon Pink, Toxic Green, Ultra-Violet |

---

## 🗂️ FILE NAMING CONVENTION

```
player_idle_01.png
player_idle_02.png
player_shoot_01.png

enemy_clerk_walk_01.png
enemy_clerk_walk_02.png

boss_vakhtersha_phase1_01.png

fx_bullet_blue.png
fx_explosion_pink.png
fx_poison_cloud.png
```

Pattern: `{category}_{name}_{action}_{frame}.png`
