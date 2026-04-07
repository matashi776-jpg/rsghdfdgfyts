# Neon Psychedelic Cyber‑Folk 2.0 — Art Direction & Asset Guide

## Purpose

This document is the single source of truth for art direction, prompt templates, asset naming, and generation rules for the visual canon **Neon Psychedelic Cyber‑Folk 2.0**. Use it to produce consistent 2D vector assets (characters, portraits, props, FX, UI) that follow the project canon.

---

## General Style Rules

| Rule | Value |
|---|---|
| Format | 2D vector art only |
| Linework | Extremely thick black outlines |
| Color | Flat neon colors; no gradients |
| Shading | Bold cel‑shading |
| Contrast | Ultra‑high contrast |
| Background | Pure black for main PNG outputs |
| Effects | Rimlight, glitch halo, neon pollen, chromatic aberration, electric smoke, sacred mist — never as skin color |
| Skin tones | Natural Slavic tones only — no blue or avatar‑style skin |
| Cultural constraints | Only Ukrainian ethnic motifs and ancient Slavic pagan symbolism; no Soviet, industrial, or modern political references |

---

## Symbol System and Weapon Canon

Use variation and unique assignment per character. Do not repeat a primary symbol across characters unless explicitly requested.

| Character | Filename | Primary Symbol | Primary Weapon / Artifact | Male Crown Material | Accent Colors |
|---|---|---|---|---|---|
| Serhiy | player_serhiy_full.png | World Spiral | Spiral light‑staff | dark iron filigree + turquoise gems | gold; turquoise |
| Mykhas | npc_mykhas_full.png | Pysanka Core | Light‑carving chisel (egg segment head) | hammered copper circlet + violet crystals | violet; lime |
| Babtsya | npc_babtsya_full.png | Tree of Life | Living root staff with neon leaves | woven root crown + amber beads | emerald; rose |
| Olena | player_olena_full.png | Solar Wheel Kolovrat | Radiant crescent‑sickle (sun arc) | brass sun‑arc circlet + rose glass | orange; pink |
| Keeper Fields | npc_keeper_fields.png | Rune of Earth | Stone totem‑amulet staff | wooden circlet + amber inlay | moss green; warm yellow |
| Forest Spirit | npc_forest_spirit.png | Rune of Air | Light‑amulet projecting gust ribbons | crystalline wind circlet | pale blue; white |
| Alina | npc_alina_helper_full.png | Star‑Flower | Firefly‑spirit companion with pysanka core | small decorative headband (child) | warm yellow; soft pink |

---

## Crown Rules

- **Male characters:** no flower crowns. Use thin, aesthetic crowns made of iron, copper, wood, amber, obsidian, or crystal. Forms: spirals, runes, branches, sun‑rays, air currents. Keep crowns delicate and non‑bulky.
- **Female characters:** may use flower crowns or magical circlets (crystal, sun, moon, runic).
- **Children:** light decorative elements only (ribbons, small charms).

---

## File Naming and Export Rules

- **Naming:** `type_name_variant.png` (example: `player_serhiy_full.png`)
- **Versioning:** append `_v2`, `_alt1` for major revisions
- **Export sizes:** full characters 2048×2048 PNG; portraits 1024×1024 PNG; keep vector masters

### Folder Structure

```
/assets
  /characters
  /portraits
  /props
  /fx
  /ui
/README.md
/prompts.md
/manifest.csv
```

---

## Generation Safeguard

Do not start image generation until the project lead sends **two separate messages** with the exact text `Generate images`. Wait for the second confirmation before any image generation begins. After generation of each asset, verify: skin tone, crown type, symbol uniqueness, absence of Soviet motifs.

---

## Character Prompt Template

```
Create a full-body 2D vector-art character in the Neon Psychedelic Cyber-Folk 2.0 style.
Character: [Name] — [short role description].
Appearance: natural Slavic skin tone, [main clothing description], embroidery with [primary symbol] motifs in [primary accent colors]; practical accessories.
Head: thin mystic crown made of [material] with [gem/inlay], shaped like [shape].
Symbol: [primary symbol] motif placed on [chest/back/prop].
Weapon: [weapon description], emits [energy colors] and [particle effects].
Effects: [aura colors], glitch halo, neon pollen, chromatic edge glow.
Art rules: extremely thick black outlines, bold cel-shading, flat neon colors, ultra-high contrast, pure black background.
Filename: [filename].png
```

---

## Prop and FX Prompt Template

```
Create a 2D vector-art [prop/fx] in the Neon Psychedelic Cyber-Folk 2.0 style.
Object: [name and short description].
Design: [shape, symbol integration, materials].
Colors: [primary neon colors].
Effects: [glow, particles, glitch, chromatic].
Art rules: thick black outlines, flat neon colors, bold cel-shading, pure black background.
Filename: [filename].png
```

---

## Finalized Character Prompts

See [`prompts.md`](./prompts.md) for all ready‑to‑use prompts per character.

---

## Portraits, FX, and UI Next Steps

- **Portraits:** create headshot prompts with four expressions: neutral, smile, thinking, surprised. Use same art rules and filename pattern `portrait_[name]_[expression].png`.
- **FX:** create idle/attack/impact variants per weapon. Use consistent naming `fx_[weapon]_[state].png`.
- **UI:** produce neon folk UI elements (buttons, icons) that reuse symbol motifs and accent colors.

---

## Manifest CSV

See [`manifest.csv`](./manifest.csv) for the full asset manifest.

Columns: `filename,character,symbol,weapon,crown,primary_colors,notes`