# ASSET PIPELINE — Оборона Ланчина (Lanchyn vs Savok)
## Neon Psychedelic Cyber-Folk Edition

---

## 1. OVERVIEW

Every asset must pass through **6 stages** before it enters the game:

| # | Stage            | Tool                         | Output               |
|---|------------------|------------------------------|----------------------|
| 1 | Concept Prompt   | Gemini / Midjourney / DALL·E | Rough concept image  |
| 2 | Refinement Prompt| Same AI, refined prompt      | Polished concept     |
| 3 | Clean Lineart    | Photoshop / Krita            | Black outlines PNG   |
| 4 | Color Pass       | Photoshop / Krita            | Neon colors applied  |
| 5 | Glow Pass        | Photoshop / Krita            | Glow baked into PNG  |
| 6 | Export           | TexturePacker                | PNG + atlas JSON     |

---

## 2. FOLDER STRUCTURE

```
/public
  /assets
    /sprites
      /player        ← player_idle_01.png, player_shoot_01.png …
      /enemies       ← enemy_clerk_walk_01.png …
      /boss          ← boss_vakhtersha_phase1_01.png …
      /fx            ← fx_bullet_blue.png, fx_explosion_pink.png …
      /ui            ← ui_button.png, ui_panel.png, ui_icon_*.png …
      /raw           ← drop generated PNGs here before atlas packing
    /atlas
      sprites.png    ← packed texture atlas (auto-generated)
      sprites.json   ← atlas descriptor (auto-generated)
/docs
  AI_PROMPTS.md      ← AI generation prompts (this project's style)
  ASSET_PIPELINE.md  ← this file
/tools
  cleanAssets.js     ← validates + deduplicates raw assets
  checkStyle.js      ← checks outline/glow/palette compliance
```

---

## 3. FILE NAMING CONVENTION

Pattern: `{category}_{name}_{action}_{frame:02d}.png`

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

ui_button.png
ui_panel.png
ui_icon_tractor_beam.png
```

---

## 4. TEXTURE ATLAS PIPELINE (TexturePacker)

1. Generate PNGs (AI + artist clean-up)
2. Drop raw PNGs into `/public/assets/sprites/raw/`
3. Run `npm run clean-assets` — removes duplicates, validates sizes
4. Open **TexturePacker**, set source folder to `raw/`, output to `atlas/`
5. Settings:
   - Max size: 4096 × 4096
   - Algorithm: MaxRects
   - Padding: 2 px
   - Trim: Yes
   - Output: `sprites.png` + `sprites.json` (Phaser 3 / JSON Hash format)
6. Copy outputs to `/public/assets/atlas/`
7. Rebuild with `npm run build`

---

## 5. ASSET STANDARDS

| Property        | Standard                               |
|-----------------|----------------------------------------|
| Format          | PNG (32-bit with alpha)                |
| Background      | **Transparent**                        |
| Size — large    | 2048 × 2048 px                         |
| Size — small FX | 1024 × 1024 px                         |
| Outline         | Black, **4–6 px**                      |
| Glow            | **Baked into PNG** — never via shader  |
| Style           | **Cel-shading only** (no realism, no blur) |
| Animations      | **8–12 frames** per action             |
| Palette         | Electric Blue `#00BFFF`, Neon Pink `#FF00AA`, Toxic Green `#39FF14`, Ultra-Violet `#7F00FF` |

---

## 6. TEAM GUIDELINES

### 🎨 Artists
- Follow the **Art Bible** palette exactly — no custom colors.
- Draw glow **manually** in the painting layer — do not use Photoshop Outer Glow layer effect.
- **No motion blur**, no drop shadows, no realistic shading.
- Use only **cel-shading** (flat fills + hard edge shadows).
- All outlines must be **pure black** (#000000), 4–6 px.

### 🤖 AI Generator Operators
- Use only prompts from `/docs/AI_PROMPTS.md`.
- Do **not** alter style keywords, palette keywords, or line-thickness keywords.
- After generation, pass every image through the artist clean-up step (stages 3–5 above).
- Run `npm run check-style` before moving an asset to `raw/`.

### 🧑‍💻 Programmers
- Load **all** sprites through the texture atlas (`sprites.png` / `sprites.json`).
- Never load individual PNG files directly (except UI elements still in progress).
- All FX (explosions, bullets, poison) must use **Object Pooling**.
- All sprite animations must use **8–12 frames**.
- Use Phaser 3 `this.load.atlas()` for the packed atlas.

---

## 7. AUTOMATION SCRIPTS (npm)

| Script                  | Command                    | Description                               |
|-------------------------|----------------------------|-------------------------------------------|
| `npm run clean-assets`  | `node tools/cleanAssets.js`| Validate sizes, remove duplicates         |
| `npm run check-style`   | `node tools/checkStyle.js` | Check outline/glow/palette compliance     |
| `npm run dev`           | `vite`                     | Development server                        |
| `npm run build`         | `vite build`               | Production build (GitHub Pages)           |

---

## 8. GITHUB COPILOT DIRECTIVE

```
You are acting as a Senior Art Pipeline Director.
Analyze and improve the following:

1. Asset pipeline
2. Folder structure
3. Naming conventions
4. Art generation prompts
5. UI generation prompts
6. Automation scripts
7. Artist and AI guidelines

Your tasks:
- Ensure consistent Neon Psychedelic Cyber-Folk style
- Improve workflow efficiency
- Suggest additional automation
- Never shorten explanations
- If you reach a limit, ask permission to continue exactly where you stopped
```
