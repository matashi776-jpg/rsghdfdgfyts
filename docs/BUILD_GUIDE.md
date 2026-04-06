# BUILD GUIDE — ACID KHUTIR

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Opens a local dev server (Vite) at `http://localhost:5173`.  
Hot-module reload is enabled — save any `.js` file to refresh.

## Production Build

```bash
npm run build
```

Output goes to `dist/`. All assets are bundled relative to `./` for GitHub Pages compatibility.

## Deploy to GitHub Pages

After building, push the `dist/` folder contents to the `gh-pages` branch, or use the Actions workflow if configured.

## Asset Pipeline

Place new images in the correct subfolder under `public/assets/`:

| Category   | Folder                           |
|------------|----------------------------------|
| Player     | `public/assets/characters/player/` |
| NPC        | `public/assets/characters/npc/`    |
| Enemies    | `public/assets/enemies/`           |
| Bosses     | `public/assets/bosses/`            |
| Items      | `public/assets/items/`             |
| UI         | `public/assets/ui/`                |
| FX         | `public/assets/fx/`                |
| Locations  | `public/assets/locations/`         |
| Cutscenes  | `public/assets/cutscenes/`         |
| Comics     | `public/assets/comics/`            |
| Symbols    | `public/assets/symbols/`           |

See [ASSET_PIPELINE.md](ASSET_PIPELINE.md) for naming conventions.

## Scene Flow

```
PreloadScene → MenuScene → StoryScene → GameScene (waves 1-4) → BossScene
                                       └→ BattleScene (legacy mode)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/main.js` | Phaser config + scene list |
| `src/scenes/PreloadScene.js` | Asset loading + fallback textures |
| `src/scenes/GameScene.js` | Main Stage 1 gameplay |
| `src/scenes/BossScene.js` | Boss Vakhtersha encounter |
| `src/systems/WaveSystem.js` | Enemy wave spawning |
| `src/systems/ProjectileSystem.js` | Bullet management |
| `src/systems/FXSystem.js` | Visual effects |
| `src/systems/UISystem.js` | HUD rendering |
| `src/systems/PerkSystem.js` | Between-wave perk selection |
| `src/entities/Player.js` | Player (Serhiy) |
| `src/entities/ZombieClerk.js` | Basic enemy |
| `src/entities/Archivarius.js` | Mid-tier ranged enemy |
| `src/entities/Inspector.js` | Heavy AoE enemy |
| `src/entities/BossVakhtersha.js` | Two-phase final boss |
