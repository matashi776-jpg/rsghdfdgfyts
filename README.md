# ACID KHUTIR — Neon Psychedelic Cyber-Folk Defense Game

ACID KHUTIR — це 2D Neon Psychedelic Cyber-Folk гра, де ви захищаєте прикарпатський кибер-хутір від кислотних зомбі-бюрократів, заражених вірусом Mausoleum 2.1.

## 🎮 Особливості
- Унікальний стиль: Neon Psychedelic Cyber-Folk
- 1 повністю іграбельний рівень
- Хвилі ворогів (Wave System)
- Міні-бос (Vakhtersha Mausoleum Protocol 2.1)
- Перки (Perk System)
- Мета-прогресія (Meta Progression)
- Динамічна музика (acid-folk)
- Глитч-ефекти, hit-stop, camera shake

## 🧩 Архітектура

```
/src
  /core       — GameConfig, SaveManager, DifficultyDirector, AudioManager
  /scenes     — BootScene, PreloadScene, MenuScene, GameScene, BossScene, DeathScene
  /entities   — Player, Enemies, Boss, NPCs
  /systems    — WaveSystem, PerkSystem, MetaProgression, FXSystem, ProjectileSystem, AnimationSystem, UISystem
  /utils      — MathUtils, Random, Dialogue
```

## 🚀 Запуск

```bash
npm install
npm run dev
```

## 🏗️ Збірка

```bash
npm run build
```

## 🌍 Лор
ACID KHUTIR — альтернативна Прикарпатська реальність. Інформаційний вірус Mausoleum 2.1 заражає радянські архіви, перетворюючи бюрократів на кислотних зомбі. Сергій, кибер-тракторист з Ланчина, захищає хутір.

## 📄 Документація
- [Lore](docs/LORE.md)
- [Game Design](docs/GAME_DESIGN.md)
- [Balance](docs/BALANCE.md)
- [Enemy Bible](docs/ENEMY_BIBLE.md)
- [Boss Bible](docs/BOSS_BIBLE.md)
- [Art Bible](docs/ART_BIBLE.md)
- [Style Guide](docs/STYLE_GUIDE.md)
- [AI Prompts](docs/AI_PROMPTS.md)
- [Workflow](docs/WORKFLOW.md)
