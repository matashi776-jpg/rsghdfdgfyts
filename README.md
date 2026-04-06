# ACID KHUTIR — Neon Psychedelic Cyber-Folk Defense Game

ACID KHUTIR — це 2D Neon Psychedelic Cyber-Folk гра, де ви захищаєте прикарпатський кибер-хутір від кислотних зомбі-бюрократів, заражених вірусом **Mausoleum 2.1**.

Побудовано на **Phaser 3** + **Vite**. Готово до деплою на GitHub Pages.

---

## 🎮 Особливості

- Унікальний стиль: **Neon Psychedelic Cyber-Folk** (українське народне мистецтво + cyberpunk + acid)
- 10 хвиль ворогів з динамічним балансом
- 3 типи ворогів: Зомбі-Клерк, Архіваріус, Інспектор
- Міні-бос: **Товариш Вахтерша** (2-фазний, з glitch ефектом)
- 4 перки (вибір кожні 5 хвиль)
- **Мета-прогресія** (рекорди хвиль → рівень → бонуси на старті)
- Апгрейд хати (3 рівні: Затишна Хата → Цегляний Дім → КІБЕР-ФОРТЕЦЯ)
- Динамічна музика (acid-folk BGM, rate зростає на босі)
- Глитч-ефекти, hit-stop, camera shake
- NPC Бабця (відновлення HP) та Михась (буст атаки)

---

## 🧩 Архітектура

```
src/
├── core/           — GameConfig · SaveManager · DifficultyDirector · AudioManager
├── scenes/         — BootScene · PreloadScene · MenuScene · StoryScene
│                     GameScene · BossScene · DeathScene · UIScene · PerkScene
├── entities/       — Player · Enemy · Enemy_ZombieClerk · Enemy_Archivarius
│                     Enemy_Inspector · Boss_Vakhtersha · NPCs
├── systems/        — WaveSystem · PerkSystem · MetaProgression · FXSystem
│                     ProjectileSystem · AnimationSystem · UISystem
└── utils/          — MathUtils · Random · Dialogue
```

---

## ⚙️ Запуск

```bash
npm install
npm run dev      # Dev server → http://localhost:8080
npm run build    # Production build → /dist
```

---

## 📐 Формули балансу

| Параметр | Формула |
|----------|---------|
| HP ворога | `60 + wave×15 + log(wave+1)×10` |
| Швидкість | `40 + wave×2` |
| Золото | `5 × (1 + wave×0.05)` |

---

## 🗂 Документація

| Файл | Зміст |
|------|-------|
| [LORE.md](docs/LORE.md) | Лор, персонажі, вороги, NPC |
| [GAME_DESIGN.md](docs/GAME_DESIGN.md) | Ігровий дизайн, механіки, цикл |
| [BALANCE.md](docs/BALANCE.md) | Таблиці балансу, формули |
| [ENEMY_BIBLE.md](docs/ENEMY_BIBLE.md) | Довідник ворогів |
| [BOSS_BIBLE.md](docs/BOSS_BIBLE.md) | Довідник боса |
| [ART_BIBLE.md](docs/ART_BIBLE.md) | Художній стиль, палітра |
| [STYLE_GUIDE.md](docs/STYLE_GUIDE.md) | Правила арту та коду |
| [AI_PROMPTS.md](docs/AI_PROMPTS.md) | Промпти для генерації спрайтів |
| [WORKFLOW.md](docs/WORKFLOW.md) | Коміти, PR, деплой |
| [ASSET_PIPELINE.md](docs/ASSET_PIPELINE.md) | Пайплайн ассетів |

---

## 🖼 Спрайти (placeholders → замінити фінальним артом)

| Файл | Персонаж |
|------|---------|
| `assets/sprites/1.png` | player_serhiy_idle |
| `assets/sprites/2.png` | player_serhiy_walk |
| `assets/sprites/3.png` | player_serhiy_shoot |
| `assets/sprites/4.png` | enemy_zombie_clerk |
| `assets/sprites/5.png` | enemy_archivarius |
| `assets/sprites/6.png` | enemy_inspector |
| `assets/sprites/7.png` | boss_vakhtersha |
| `assets/sprites/8.png` | npc_babtsya_healer |
| `assets/sprites/9.png` | npc_mykhas_mechanic |

Промпти для генерації — у [AI_PROMPTS.md](docs/AI_PROMPTS.md).

---

## 🌍 Лор

ACID KHUTIR — це альтернативна Прикарпатська реальність, де інформаційний вірус **Mausoleum 2.1** заражає радянські архіви, перетворюючи бюрократів на кислотних зомбі.

**Сергій** — кибер-тракторист з Ланчина. Має кибернетичну руку, плазмовий ключ, і вишиванку, що світиться як ультрафіолетовий rave.

> *"Та йди ти з тим Mausoleum 2.1 — я тут борщ варив!"*

---

## 📜 Ліцензія

MIT