# WORKFLOW.md — ACID KHUTIR

## 🔄 Правила роботи з репозиторієм

---

## 📝 Правила комітів (Conventional Commits)

```
<type>(<scope>): <description>

feat(GameScene): add boss phase 2 glitch effect
fix(WaveSystem): prevent double wave-end trigger
docs(LORE): expand Archivarius backstory
art(sprites): add enemy_clerk_walk_01-04.png
balance(DifficultyDirector): reduce enemy HP scaling
refactor(FXSystem): extract particle config to constants
chore(package): bump phaser to 3.70.0
```

### Типи
| Тип | Використання |
|-----|-------------|
| `feat` | Нова функціональність |
| `fix` | Виправлення помилки |
| `docs` | Тільки документація |
| `art` | Додавання/оновлення ассетів |
| `balance` | Зміни балансу (формули, константи) |
| `refactor` | Переструктурування без зміни поведінки |
| `chore` | Налаштування, залежності |

---

## 🔀 Правила PR (Pull Request)

- **Назва PR** — відповідає типу і scope коміту
- **Опис PR** — What/Why/How + скріншот або відеозапис якщо UI-зміни
- **Reviewers** — мінімум 1 технічний + 1 дизайнерський
- **Merge strategy** — Squash and merge (для feature branches)

### Гілки
```
main         — production (тільки через PR)
develop      — інтеграційна
feature/...  — нові функції (від develop)
fix/...      — баги
art/...      — спрайти та ассети
docs/...     — документація
balance/...  — зміни балансу
```

---

## 🎨 Пайплайн ассетів

```
1. Генерація промпту (AI_PROMPTS.md)
2. AI генерація (Gemini / Midjourney / DALL·E)
3. Очистка лінарту (Photoshop / Krita)
4. Кольоровий прохід (палітра з ART_BIBLE.md)
5. Glow прохід (вручну, не шейдером)
6. Експорт PNG (2048×2048, прозорий фон)
7. npm run clean-assets (валідація)
8. TexturePacker → atlas/sprites.png + sprites.json
9. Коміт: art(sprites): add <name>
```

---

## 🤖 Пайплайн AI-генерації

1. Відкрий `docs/AI_PROMPTS.md`
2. Знайди потрібний промпт (персонаж / ворог / FX)
3. Додай **Universal Base Prompt** на початок
4. Запусти генерацію
5. Вибери найкращий варіант
6. Художник очищає + покращує (Stages 3–5 з ASSET_PIPELINE.md)
7. `npm run check-style` для перевірки

---

## 🧪 Пайплайн тестування

### Ручне тестування
- [ ] Хвилі 1–4: гравець виживає без апгрейду
- [ ] Хвиля 5: perk selection з'являється і застосовується
- [ ] Апгрейд хати Lv2 і Lv3: HP і візуал оновлюються
- [ ] Хвиля 10: бос спаунується, BossScene cinematic працює
- [ ] Бос Фаза 2: глитч при ≤50% HP
- [ ] Смерть: DeathScene показує правильний wave і record
- [ ] Рестарт: meta bonuses застосовуються
- [ ] NPC Бабця: відновлення HP коштує 100 ₴
- [ ] NPC Михась: boost активується, закінчується через 10 с

### Автоматичні скрипти
```bash
npm run clean-assets   # Валідація ассетів
npm run check-style    # Перевірка palette/outline
npm run build          # Production build (Vite)
npm run dev            # Dev server (localhost:8080)
```

---

## 🚀 Deploy (GitHub Pages)

```bash
npm run build
# Результат: /dist
# GitHub Pages: налаштуй source = /dist або gh-pages branch
```

vite.config.js:
```js
export default defineConfig({
  base: './',   // ← обов'язково для GitHub Pages
});
```

---

## 📁 Структура файлів

```
/ACID-KHUTIR
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js
│   ├── core/           — GameConfig, SaveManager, DifficultyDirector, AudioManager
│   ├── scenes/         — BootScene, PreloadScene, MenuScene, StoryScene,
│   │                     GameScene, BossScene, DeathScene, UIScene, PerkScene
│   ├── entities/       — Player, Enemy, Enemy_ZombieClerk, Enemy_Archivarius,
│   │                     Enemy_Inspector, Boss_Vakhtersha, NPCs
│   ├── systems/        — WaveSystem, PerkSystem, MetaProgression, FXSystem,
│   │                     ProjectileSystem, AnimationSystem, UISystem
│   └── utils/          — MathUtils, Random, Dialogue, Calculator
├── public/assets/
│   ├── sprites/        — 1.png–9.png (placeholders → replace with final art)
│   └── atlas/          — sprites.png + sprites.json (TexturePacker output)
└── docs/               — LORE, GAME_DESIGN, STYLE_GUIDE, ART_BIBLE,
                          ENEMY_BIBLE, BOSS_BIBLE, BALANCE, WORKFLOW, AI_PROMPTS
```
