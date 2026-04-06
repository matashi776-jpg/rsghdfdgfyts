# AI Prompts for ACID KHUTIR

## Art Generation (Gemini / Midjourney / DALL·E)

Use the following master prompt for all sprite and UI art generation:

```
Neon Psychedelic Cyber-Folk 2D sprite, heavy black outlines, cel-shading,
UV-reactive patterns, glowing embroidery, electric smoke, chromatic aberration,
Ukrainian folk motifs, acid neon colors (Electric Blue #00FFFF, Neon Pink #FF00FF,
Toxic Green #39FF14, Ultra-Violet #7F00FF), hand-drawn animation style,
high contrast, readable silhouette. PNG 2048×2048, transparent background.
```

### Asset-specific variants

| Asset | Additional descriptor |
|---|---|
| Hero (Serhiy) | cyber-tractor driver, energy cannon, vyshyvanka circuit pattern |
| Zombie Clerk | soviet bureaucrat, decaying suit, glowing stamps, paperwork tentacles |
| Zombie Inspector | peaked cap, toxic badge, clipboard weapon |
| Boss Vakhtersha | massive desk-fortress, neon rubber stamp artillery |
| Khata (Traditional) | thatched roof, sunflower motifs, warm glow |
| Khata (Reinforced) | iron shutters, barbed wire, neon runes |
| Khata (Cyber-Sich) | plasma shields, holographic battlements, satellite dish |

---

## Code Generation (Copilot / GPT)

- Use **Phaser 3** with **ES6 Modules**.
- Follow the architecture defined in `/src/` — scenes, entities, systems, utils.
- **Never** write game logic directly inside `update()`. Use State Machines and delegated manager classes.
- **Always** use Object Pooling (`Phaser.GameObjects.Group` with `maxSize`) for bullets, particles, and enemies.
- Enemy behaviour must be driven by a State Machine with states: `IDLE → WALK → ATTACK → STAGGER → DEAD`.
- VFX must be encapsulated in `/src/systems/VFXSystem.js`.
- Audio must be controlled through `/src/systems/AudioSystem.js`.
- Follow Conventional Commits (see `/docs/COMMIT_RULES.md`).

---

## Balancing (AI-assisted tuning)

- Use the formulas from [`/docs/wiki/6-Balancing.md`](./wiki/6-Balancing.md).
- **Never** use exponential HP growth — use the piecewise linear formula.
- Enemy gold rewards must satisfy: `total_gold(wave) ≈ 1.1 × total_gold(wave-1)`.
- Perk synergy effects must not exceed ×2.5 total DPS multiplier.
- Test balance against the reference run: survive 20 waves without purchasing any perk.
