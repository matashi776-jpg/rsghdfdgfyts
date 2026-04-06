# Asset Prompts — Оборона Ланчина Part 8.5
**Style guide for all sprites:** 2D vector-art, Neon Psychedelic Cyber-Folk.  
Thick black outlines · bold cel-shading · flat neon colors · **transparent background (PNG)**.

---

## 8.5.1 — Animation Frames

All frames are individual PNG files, transparent background.  
Place finished files in `public/assets/sprites/<folder>/`.

### A) Сергій — Idle (12 frames) → `public/assets/sprites/player/`
Files: `player_serhiy_idle_01.png` → `player_serhiy_idle_12.png`
```
2D vector-art animation frame, Neon Psychedelic Cyber-Folk.
Serhiy breathing gently, glowing vyshyvanka pulsing softly,
cyber-arm flickering Electric Blue.
Thick black outlines, bold cel-shading, flat neon colors, transparent background.
```
*(Repeat prompt for frames 02–12, incrementing the file number only.)*

---

### B) Сергій — Walk (12 frames) → `public/assets/sprites/player/`
Files: `player_serhiy_walk_01.png` → `player_serhiy_walk_12.png`
```
2D vector-art animation frame.
Serhiy stepping forward, neon embroidery trailing motion blur,
cyber-arm joints glowing Electric Blue.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

### C) Сергій — Shoot (6 frames) → `public/assets/sprites/player/`
Files: `player_serhiy_shoot_01.png` → `player_serhiy_shoot_06.png`
```
Serhiy firing plasma wrench-cannon, Electric Blue muzzle flash mid-frame,
glitch distortion around the barrel.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

### D) Зомбі-клерк — Walk (8 frames) → `public/assets/sprites/enemies/`
Files: `enemy_zombie_clerk_walk_01.png` → `enemy_zombie_clerk_walk_08.png`
```
Zombie Clerk walking stiffly, Toxic Green slime dripping,
neon bureaucratic papers fluttering off its body.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

### E) Архіваріус — Attack (6 frames) → `public/assets/sprites/enemies/`
Files: `enemy_archivarius_attack_01.png` → `enemy_archivarius_attack_06.png`
```
Archivarius swinging a magnetic tape tentacle overhead,
LED eyes glowing Electric Blue, Soviet-era filing cabinet torso.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

### F) Інспектор — Stamp Slam (6 frames) → `public/assets/sprites/enemies/`
Files: `enemy_inspector_slam_01.png` → `enemy_inspector_slam_06.png`
```
Inspector raising a giant glowing bureaucratic stamp above its head,
Neon Pink bureaucratic aura intensifying with each frame.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

### G) Міні-Вахтёрша — Phase 1 (8 frames) → `public/assets/sprites/boss/`
Files: `boss_vakhtersha_phase1_01.png` → `boss_vakhtersha_phase1_08.png`
```
Mini-Vakhtersha preparing stamp slam, glitch-monitor face flickering,
Toxic Green steam rising from concrete arms.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

### H) Міні-Вахтёрша — Phase 2 (8 frames) → `public/assets/sprites/boss/`
Files: `boss_vakhtersha_phase2_01.png` → `boss_vakhtersha_phase2_08.png`
```
Mini-Vakhtersha entering glitch overdrive, Ultra-Violet cracks spreading
across concrete body, screen face fully corrupted, ground vibrating.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

## 8.5.2 — NPC Sprites → `public/assets/sprites/npcs/`

### Бабця-знахарка — Idle
File: `npc_babtsya_healer_idle.png`
```
2D vector-art NPC sprite.
Babtsya Healer standing upright holding a pysanka-decorated staff,
rushnyk shawl glowing Neon Pink, kind but knowing smile.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

### Михась-механік — Idle
File: `npc_mykhas_mechanic_idle.png`
```
Young mechanic Mykhas in a neon-striped hoodie, holding a wrench,
a small floating drone glowing Electric Blue hovering beside him.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

## 8.5.3 — Item Sprites → `public/assets/sprites/items/`

### Радіоактивний буряк
File: `item_radioactive_beet.png`
```
Neon Toxic Green glowing beet, pysanka ornamental patterns carved into
its surface, faint glitch aura radiating outward.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

### Золотий талон
File: `item_golden_coupon.png`
```
Golden bureaucratic coupon glowing Neon Pink, embossed rushnyk patterns
along the border, faint electric smoke curling from corners.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

### Залізна печатка
File: `item_iron_seal.png`
```
Heavy iron official seal engraved with glowing Ukrainian folk ornament,
Ultra-Violet aura pulsing from the carved grooves.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

## 8.5.4 — Cutscene Images → `public/assets/cutscenes/`

### Intro
File: `cutscene_intro_01.png`
```
Serhiy standing on a glowing cyber-hut hill at dusk, neon storm behind him,
glitch lightning striking distant server towers.
Wide cinematic 16:9 composition.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

### Boss Entrance
File: `cutscene_boss_entrance.png`
```
Mini-Vakhtersha emerging from a glitch rift in mid-air, concrete arms
unfolding like wings, Toxic Green steam billowing.
Wide cinematic 16:9 composition.
Thick outlines, cel-shading, flat neon colors, transparent background.
```

---

## 8.5.5 — Comic Panels → `public/assets/comics/`

### Panel 01
File: `comic_panel_01.png`
```
Comic-style panel, Neon Psychedelic Cyber-Folk art style.
Serhiy shouting at a crowd of zombie-clerks advancing on the hut.
Large speech bubble in Prykarpattia dialect (leave blank space for text overlay).
Bold halftone dots in background, thick outlines, cel-shading, flat neon colors,
transparent background.
```

---

## File Naming Summary

| Category | Path | Count |
|---|---|---|
| Serhiy Idle | `public/assets/sprites/player/player_serhiy_idle_01–12.png` | 12 |
| Serhiy Walk | `public/assets/sprites/player/player_serhiy_walk_01–12.png` | 12 |
| Serhiy Shoot | `public/assets/sprites/player/player_serhiy_shoot_01–06.png` | 6 |
| Zombie Clerk Walk | `public/assets/sprites/enemies/enemy_zombie_clerk_walk_01–08.png` | 8 |
| Archivarius Attack | `public/assets/sprites/enemies/enemy_archivarius_attack_01–06.png` | 6 |
| Inspector Slam | `public/assets/sprites/enemies/enemy_inspector_slam_01–06.png` | 6 |
| Boss Phase 1 | `public/assets/sprites/boss/boss_vakhtersha_phase1_01–08.png` | 8 |
| Boss Phase 2 | `public/assets/sprites/boss/boss_vakhtersha_phase2_01–08.png` | 8 |
| NPC Babtsya | `public/assets/sprites/npcs/npc_babtsya_healer_idle.png` | 1 |
| NPC Mykhas | `public/assets/sprites/npcs/npc_mykhas_mechanic_idle.png` | 1 |
| Item: Beet | `public/assets/sprites/items/item_radioactive_beet.png` | 1 |
| Item: Coupon | `public/assets/sprites/items/item_golden_coupon.png` | 1 |
| Item: Seal | `public/assets/sprites/items/item_iron_seal.png` | 1 |
| Cutscene Intro | `public/assets/cutscenes/cutscene_intro_01.png` | 1 |
| Cutscene Boss | `public/assets/cutscenes/cutscene_boss_entrance.png` | 1 |
| Comic Panel | `public/assets/comics/comic_panel_01.png` | 1 |
| **Total** | | **66** |
