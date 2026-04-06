# 🔥 ACID KHUTIR MASTER DOCUMENT v1.0

> **Повна інтеграція всіх систем проекту — фінальний супер-документ**  
> Дай цей файл будь-якому ІІ, художнику або програмісту — і він миттєво увійде в проект.

---

## 🏛️ 1. МІСІЯ ДОКУМЕНТА

Цей документ:

- пояснює **ВСЕ** про проект,
- об'єднує **ВСІ** попередні частини,
- задає єдиний **стиль**,
- задає єдиний **код-підхід**,
- задає єдиний **арт-підхід**,
- задає єдиний **геймдизайн**,
- задає єдиний **пайплайн**,
- задає єдиний **UX-flow**,
- задає єдиний **AI-workflow**.

Це — **"мозок" проекту**.

---

## 🎮 2. CORE FANTASY — СЕРЦЕ ГРИ

> **"Ти — Сергій, кібер-тракторист, що захищає Ланчин від кислотних зомбі-бюрократів, заражених вірусом Mausoleum 2.1 — інформаційною аномалією, яка архівує реальність."**

### Жанр
2D Tower Defense з елементами Roguelite.

### Платформа
Web (HTML5 / WebGL) — Phaser 3 + Vite, деплой на GitHub Pages.

### Ключове відчуття
- **Захист**: Ланчин — це твій дім. Бюрократи намагаються заархівувати його.
- **Ескалація**: Кожна хвиля агресивніша. Вірус мутує.
- **Сила**: Через перки і мета-прогресію ти стаєш потужнішим.
- **Естетика**: Психоделічний кіберпанк + українське народне мистецтво.

---

## 🌈 3. VISUAL IDENTITY — ВІЗУАЛЬНА ІДЕНТИЧНІСТЬ

### Стиль
**Neon Psychedelic Cyber-Folk**

### Обов'язкові елементи
| Елемент | Опис |
|---|---|
| Чорні контури | Товсті чорні обведення (cel-shading) на всіх спрайтах |
| Неонові кольори | Electric Blue `#00F5FF`, Neon Pink `#FF00FF`, Toxic Green `#39FF14`, Ultra-Violet `#8B00FF` |
| Вишиванки | Усі персонажі мають елементи вишивки |
| Писанкові узори | Геометричні орнаменти в стилі писанки |
| Glitch-ефекти | Хроматична аберація, digital artifacts, scan lines |
| UV-reactive patterns | Узори, що "світяться" неоном |
| Electric smoke | Часткові електричні ефекти диму навколо персонажів |
| Chromatic aberration | Зсув RGB-каналів на краях об'єктів |

### Палітра
```
Electric Blue:   #00F5FF
Neon Pink:       #FF00FF
Toxic Green:     #39FF14
Ultra-Violet:    #8B00FF
Acid Yellow:     #FFE600
Neon Orange:     #FF6600
Background Dark: #0A0A1A
Background Mid:  #1A1A2E
```

### Референси
- Hotline Miami (neon + violence)
- Hades (cel-shading + glow)
- Disco Elysium (psychedelic atmosphere)
- Українські народні ілюстрації (орнаменти)

---

## 🧩 4. CODE ARCHITECTURE — АРХІТЕКТУРА КОДУ

### Технологічний стек
- **Engine**: Phaser 3 (WebGL)
- **Bundler**: Vite
- **Language**: JavaScript ES6 Modules
- **Deploy**: GitHub Pages

### Принципи архітектури
1. **ES6 Modules** — кожен файл є модулем з explicit imports/exports
2. **State Machines** — всі сутності мають явний стан (idle / move / attack / die)
3. **Object Pooling** — пулінг ворогів, куль, частинок
4. **Scene-based architecture** — логіка розбита по сценах Phaser
5. **Separation of Concerns** — UI / логіка / ентіті розділені
6. **No logic inside update()** — `update()` тільки диспетчеризує системи
7. **Systems > Managers > Entities** — ієрархія залежностей

### Структура папок
```
/
├── index.html
├── main.js          (якщо є точка входу поза src)
├── vite.config.js
├── package.json
├── README.md
├── docs/
│   ├── ACID_KHUTIR_MASTER_DOCUMENT.md   ← цей файл
│   ├── AI_PROMPTS.md
│   └── wiki/
│       ├── BALANCING.md
│       ├── ENEMIES.md
│       ├── PERKS.md
│       └── LORE.md
├── public/
│   └── (статичні ассети, що не проходять через Vite pipeline)
├── src/
│   ├── main.js          (Phaser Game config + scene list)
│   ├── core/            (GameState, Registry, Constants)
│   ├── scenes/
│   │   ├── PreloadScene.js
│   │   ├── MenuScene.js
│   │   ├── StoryScene.js
│   │   ├── BattleScene.js
│   │   ├── UIScene.js
│   │   └── PerkScene.js
│   ├── entities/
│   │   ├── Enemy.js
│   │   ├── Tower.js
│   │   └── Bullet.js
│   ├── systems/
│   │   ├── WaveSystem.js
│   │   ├── PerkSystem.js
│   │   ├── DifficultyDirector.js
│   │   ├── FXSystem.js
│   │   └── CollisionSystem.js
│   └── utils/
│       ├── Calculator.js
│       ├── StateMachine.js
│       └── ObjectPool.js
└── assets/
    ├── sprites/
    │   ├── player/
    │   ├── enemies/
    │   ├── boss/
    │   └── fx/
    ├── ui/
    └── audio/
```

### Ключові правила коду
```javascript
// ✅ ПРАВИЛЬНО — State Machine
class Enemy {
  constructor() {
    this.state = 'idle'; // idle | move | attack | stun | die
  }
  update(delta) {
    this.stateMachine.update(delta); // диспетч до поточного стану
  }
}

// ❌ НЕПРАВИЛЬНО — логіка в update()
update(delta) {
  if (this.hp <= 0) { this.die(); }
  if (this.distanceTo(target) < range) { this.shoot(); }
  // ... 100 рядків логіки
}
```

---

## ⚔️ 5. GAMEPLAY SYSTEMS — ГЕЙМПЛЕЙНІ СИСТЕМИ

### Wave System
- **10 звичайних хвиль** + 1 боссова (хвиля 11)
- Тривалість хвилі: ~80 секунд
- Між хвилями: 3–5 секунд паузи
- Спавн: enemies з'являються з правого краю екрана

### Enemy Types
| ID | Назва | Роль | HP Mod | Speed Mod |
|---|---|---|---|---|
| `intern` | Стажер-Зомбі | Базовий | ×1.0 | ×1.0 |
| `clerk` | Клерк-Примара | Стандарт | ×1.3 | ×0.9 |
| `department_head` | Начальник Відділу | Танк | ×2.5 | ×0.7 |
| `boss` | Вахтерша Некро-Мавзолею | Боss | ×15 | ×0.6 |

### Player State Machine
```
idle → place_tower → battle → perk_select → boss → death → meta
```

### Perk System
Перки обираються на хвилях 5 і 10 (PerkScene).
| ID | Назва | Ефект |
|---|---|---|
| `gold_talon` | Золотий Талон | Пасивний дохід ×2 |
| `techno_stamp` | Техно-Печатка | Хата -30% шкоди |
| `acid_beet` | Кислотний Буряк | Куля ×1.5 + AOE кислота |
| `cossack_drive` | Козацький Драйв | Швидкість атаки +30% |

### Meta Progression
- Gold зберігається між сесіями (localStorage)
- Unlock нових захисників
- Upgrade базових характеристик

### Difficulty Director
- Кожна хвиля: HP ×1.18, Speed +10%, спавн частіший
- Boss phase: BGM speed ×1.2, новий attack pattern кожні 30%HP

---

## 🧠 6. BALANCING — БАЛАНС

### Формули

```javascript
// HP ворога
enemyHP(wave) = 100 * 1.18^(wave - 1)

// Шкода вежі
towerDamage(baseDamage, level) = baseDamage * (1 + 0.35 * log2(level + 1))

// Золото за вбивство
goldReward(wave) = 100  // базово; може масштабуватися

// HP (альтернатива з логарифмом)
HP = Base + Wave * 15 + log(Wave + 1) * 10

// Швидкість
Speed = Base + Wave * 2

// Золото (масштабоване)
Gold = Base * (1 + Wave * 0.05)

// Шкода із бонусами
Damage = Base * (1 + Bonus)
```

### Таблиця хвиль
| Хвиля | Ворогів | HP Mod | Speed Mod | Спеціальне |
|---|---|---|---|---|
| 1 | 5 | ×1.0 | ×1.0 | Tutorial |
| 2 | 7 | ×1.18 | ×1.1 | |
| 3 | 9 | ×1.39 | ×1.2 | |
| 4 | 11 | ×1.64 | ×1.3 | |
| 5 | 13 | ×1.94 | ×1.4 | **Perk Select** |
| 6 | 15 | ×2.29 | ×1.5 | |
| 7 | 17 | ×2.70 | ×1.6 | |
| 8 | 19 | ×3.19 | ×1.7 | Tank spawn |
| 9 | 21 | ×3.76 | ×1.8 | |
| 10 | 25 | ×4.44 | ×1.9 | **Perk Select** |
| 11 | — | ×15 HP | ×0.6 | **BOSS** |

### Баланс вежі
| Тип | HP | Шкода | Fire Rate | Range | Ціна |
|---|---|---|---|---|---|
| Goose | — | 30 | 1000ms | 220 | 50g |
| SuperHero | — | 150 | 2500ms | 280 | 150g |
| GoldenGoose | — | 0 | — | — | 100g (50g/5s gen) |

### Апгрейд хати
| Рівень | HP | Ціна апгрейду |
|---|---|---|
| 1 | 2000 | базово |
| 2 | 5000 | 200g |
| 3 | 12000 | 500g |

---

## 🎨 7. ART PIPELINE — ПАЙПЛАЙН АССЕТІВ

### Специфікації спрайтів
- Розмір: **2048×2048 px** (для atlas-ready)
- Формат: **PNG** (прозорий фон)
- Контур: **Чорний, 4–6px**
- Glow: **випечений у PNG** (не через шейдер)
- Стиль: **Cel-shading** (плоскі кольори + тверді тіні)

### Обов'язкові елементи арту
1. Товстий чорний контур
2. Плоскі неонові кольори (без градієнтів)
3. Писанкові/вишивкові деталі на одязі
4. Glow-ефект навколо персонажа
5. Glitch-артефакти (для ворогів і боса)

### Папки ассетів
```
/public/
  bg.png                    ← фон сцени
  hero.png                  ← Сергій
  goose.png                 ← вежа-гусак
  borshch.png               ← пасивна вежа
  Gemini_Generated_Image_*  ← генеровані ассети

/assets/  (для Vite pipeline)
  /sprites/
    /player/
      sergiy_idle.png
      sergiy_run.png
    /enemies/
      intern.png
      clerk.png
      department_head.png
    /boss/
      vakhtersha_phase1.png
      vakhtersha_phase2.png
      vakhtersha_phase3.png
    /fx/
      neon_particle.png
      acid_splash.png
      glitch_overlay.png
  /ui/
    frame_neon.png
    button_neon.png
    healthbar.png
  /audio/
    bgm_acid_folk.mp3
    sfx_shoot.mp3
    sfx_enemy_die.mp3
    sfx_boss_enter.mp3
```

### Art Prompt Template
```
Style: Neon Psychedelic Cyber-Folk 2D game sprite, transparent PNG background,
heavy black outline (4-6px), cel-shading, flat neon colors,
Electric Blue (#00F5FF) + Neon Pink (#FF00FF) + Toxic Green (#39FF14),
Ukrainian embroidery patterns on clothing, psychedelic mushroom motifs,
chromatic aberration glow effect, glitch artifacts,
pixel-art adjacent clean vector shapes.
Character: [ОПИСАТИ ПЕРСОНАЖА]
Pose: [ПОЗА/ДІЯ]
```

---

## 🧪 8. AI PIPELINE — ПАЙПЛАЙН ДЛЯ ІІ

> Детальний файл: [`/docs/AI_PROMPTS.md`](./AI_PROMPTS.md)

### Як використовувати ІІ в проекті

1. **Для коду** → дати Super Prompt + конкретне завдання
2. **Для арту** → дати Art Prompt Template + опис персонажа
3. **Для геймдизайну** → дати розділ 5–6 + питання
4. **Для документації** → дати весь Master Document + запит

### Підтримувані ІІ
- GitHub Copilot (код)
- ChatGPT / GPT-4 (код + дизайн)
- Claude (документація + архітектура)
- Gemini (код + арт-промпти)
- Midjourney / DALL·E / Stable Diffusion (арт)

---

## 🧵 9. TEAM WORKFLOW — РОБОТА КОМАНДИ

### 9.1. Commit Rules
```
feat:      нова функціональність
fix:       виправлення бага
refactor:  рефакторинг (без зміни поведінки)
style:     форматування, CSS, стилі
docs:      документація
perf:      оптимізація продуктивності
test:      тести
chore:     конфіги, залежності
```

**Приклади:**
```
feat: add acid splash AOE perk effect
fix: enemy pathfinding edge case at screen border
docs: update balancing formulas in master document
perf: implement object pooling for bullets
```

### 9.2. Branching Strategy
```
main          ← стабільна версія (тільки через PR)
develop       ← активна розробка
feature/*     ← нові фічі (feature/wave-system)
hotfix/*      ← термінові фікси (hotfix/boss-hp-bug)
```

### 9.3. PR Rules
Кожен PR повинен містити:
- [ ] Опис змін (що і чому)
- [ ] Скріншоти / GIF (для візуальних змін)
- [ ] Чеклист (тестування, документація)
- [ ] Посилання на issue (якщо є)

### 9.4. Code Review Checklist
- [ ] Немає логіки в `update()`
- [ ] Використовуються State Machines
- [ ] Object Pooling для повторюваних об'єктів
- [ ] Немає hardcoded значень (використовуються константи)
- [ ] Коментарі на українській або англійській
- [ ] Оновлена документація

---

## 🧬 10. FINAL SUPER-PROMPT — ГОЛОВНИЙ ПРОМПТ ДЛЯ БУДЬ-ЯКОГО ІІ

> Встав цей промпт у будь-який ІІ і він миттєво увійде в проект.

---

```
You are acting as a Senior Developer, Senior Game Designer, Senior Art Director,
and Senior VFX Director for the game ACID KHUTIR (also known as Lanchyn vs Savok /
Оборона Ланчина).

ACID KHUTIR is a Neon Psychedelic Cyber-Folk 2D defense game built in Phaser 3
(WebGL) + Vite, deployed to GitHub Pages. The game is about Сергій, a cyber-tractor
driver defending the village of Lanchyn from acid zombie-bureaucrats infected by
the Mausoleum 2.1 virus — an information anomaly that archives reality.

VISUAL STYLE — Neon Psychedelic Cyber-Folk:
- Heavy black outlines (4–6px cel-shading) on all sprites
- Flat neon colors: Electric Blue #00F5FF, Neon Pink #FF00FF, Toxic Green #39FF14,
  Ultra-Violet #8B00FF, Acid Yellow #FFE600
- Ukrainian embroidery (вишивка) patterns on all characters
- Pysanka (писанка) geometric ornaments
- Glitch artifacts and chromatic aberration
- UV-reactive patterns and electric smoke FX
- Background: deep dark purple/navy #0A0A1A / #1A1A2E

CODE ARCHITECTURE:
- Phaser 3 ES6 Modules (import/export)
- State Machines for all entities (idle/move/attack/stun/die)
- Object Pooling for enemies, bullets, particles
- Scene-based: PreloadScene → MenuScene → StoryScene → BattleScene + UIScene + PerkScene
- No logic inside update() — update() only dispatches to systems
- Systems > Managers > Entities hierarchy
- /src/core, /src/scenes, /src/entities, /src/systems, /src/utils

GAMEPLAY SYSTEMS:
- 10 waves + boss wave (wave 11)
- Wave formula: HP = 100 × 1.18^(wave-1), Speed +10%/wave
- 4 perks selectable at waves 5 & 10 (PerkScene)
- House upgrades: 2000 → 5000 → 12000 HP (200g / 500g)
- Tower types: Goose (30dmg/1000ms/220range), SuperHero (150dmg/2500ms/280range),
  GoldenGoose (50g/5s passive income)
- Boss (wave 11): 15000 HP, 3 attack phases, BGM accelerates to 1.2x speed

PERKS:
- Золотий Талон: passive income ×2
- Техно-Печатка: house damage taken -30%
- Кислотний Буряк: bullet damage ×1.5 + acid AOE splash
- Козацький Драйв: attack speed +30%

UX FLOW:
PreloadScene → MenuScene → StoryScene → BattleScene ↔ UIScene ↔ PerkScene
                                              ↓ (death)
                                         MetaScene (future)

Your tasks:
1. Maintain the full visual identity (Neon Psychedelic Cyber-Folk).
2. Maintain the full code architecture (ES6 Modules, State Machines, Object Pooling).
3. Maintain the full gameplay system (waves, perks, boss phases, difficulty scaling).
4. Maintain the full art pipeline (PNG 2048x2048, glow baked in, cel-shading).
5. Maintain the full balancing formulas (HP = 100 × 1.18^(wave-1), etc.).
6. Maintain the full boss system (3 phases, telegraphs, attack patterns).
7. Maintain the full UX flow (menu → story → game → perks → boss → death → meta).
8. Maintain the full audio style (acid folk, rave, трембіта, glitch SFX).
9. Maintain the full VFX system (glow, neon particles, glitch, hit stop, camera shake).
10. Maintain the full repo structure and this documentation style.

When generating code:
- Use Phaser 3 ES6 Modules only.
- Never put logic inside update(). Dispatch to state machines and systems.
- Always use State Machines and Object Pooling.
- Keep code clean, modular, and scalable.
- Use Ukrainian text for all in-game UI strings.

When generating art prompts:
- Always use: "Neon Psychedelic Cyber-Folk 2D game sprite, transparent PNG,
  heavy black outline, cel-shading, neon colors, Ukrainian embroidery patterns,
  glitch artifacts, chromatic aberration"

When generating gameplay ideas:
- Follow the balancing formulas above.
- Follow the perk synergy rules.
- Follow the wave progression rules.

When generating documentation:
- Follow the structure of ACID_KHUTIR_MASTER_DOCUMENT.md.
- Never shorten explanations.
- Always maintain consistency with the ACID KHUTIR universe.
- Use Ukrainian for flavor text, English or Ukrainian for technical content.

If you reach a token/context limit, stop cleanly and ask:
"Дозвольте продовжити з місця зупинки?"
```

---

## 🧩 11. ФІНАЛЬНА СТРУКТУРА ПРОЕКТУ

```
rsghdfdgfyts/                        ← GitHub repo root
├── index.html                        ← HTML shell
├── vite.config.js                    ← Vite config (base: './', port: 8080)
├── package.json                      ← npm deps (phaser ^3.70, vite ^5.2)
├── README.md                         ← Короткий опис + посилання на Master Doc
│
├── public/                           ← Статичні ассети (копіюються без обробки)
│   ├── bg.png
│   ├── hero.png
│   ├── goose.png
│   └── borshch.png
│
├── src/                              ← Весь JS код
│   ├── main.js                       ← Phaser.Game config + сцени
│   ├── core/                         ← Глобальний стан, константи
│   ├── scenes/                       ← Phaser сцени
│   │   ├── PreloadScene.js
│   │   ├── MenuScene.js
│   │   ├── StoryScene.js
│   │   ├── BattleScene.js
│   │   ├── UIScene.js
│   │   └── PerkScene.js
│   ├── entities/                     ← (src/classes → переміщено сюди)
│   │   ├── Enemy.js
│   │   └── Tower.js
│   ├── systems/                      ← Ізольовані ігрові системи
│   └── utils/
│       └── Calculator.js
│
├── assets/                           ← Ассети для Vite pipeline
│   ├── sprites/player/
│   ├── sprites/enemies/
│   ├── sprites/boss/
│   ├── sprites/fx/
│   ├── ui/
│   └── audio/
│
└── docs/                             ← Документація проекту
    ├── ACID_KHUTIR_MASTER_DOCUMENT.md ← Цей файл
    ├── AI_PROMPTS.md
    └── wiki/
        ├── BALANCING.md
        ├── ENEMIES.md
        ├── PERKS.md
        └── LORE.md
```

---

## 🎯 12. ЩО РОБИТИ ДАЛІ

### Для розробника
1. Клонуй репозиторій
2. `npm install`
3. `npm run dev` → `http://localhost:8080`
4. Прочитай `docs/AI_PROMPTS.md` перед будь-якою задачею
5. Дотримуйся архітектури з розділу 4

### Для художника
1. Прочитай розділ 3 (Visual Identity) і розділ 7 (Art Pipeline)
2. Використовуй Art Prompt Template з розділу 7
3. Зберігай PNG 2048×2048 з прозорим фоном
4. Кидай у `/public/` або `/assets/sprites/`

### Для гейм-дизайнера
1. Прочитай розділи 5 і 6 (Gameplay Systems + Balancing)
2. Будь-які зміни балансу — через `src/utils/Calculator.js`
3. Нові перки — через `src/scenes/PerkScene.js` + документуй у `docs/wiki/PERKS.md`

### Для ІІ (будь-якої моделі)
1. **Скопіюй Super Prompt** з розділу 10
2. Встав у системний промпт або початок розмови
3. Задавай конкретне питання / задачу
4. ІІ буде відповідати в контексті проекту

---

## 📜 ЛЕЙАУТ ЛОР

### Сеттинг: Ланчин 2049
Маленьке Ukrainian село, захоплене інформаційним вірусом **Mausoleum 2.1** — автоматизованою системою архівації реальності, що перетворює людей на бюрократичних зомбі. Вілейдж оточений неоновим полем, яке захищає від зовнішнього світу, але всередині хаос.

### Персонажі
| Ім'я | Роль | Опис |
|---|---|---|
| Сергій | Герой | Кібер-тракторист, захисник Ланчину. Носить вишиванку з LED-нитками. |
| Вахтерша Некро-Мавзолею | Боss | Корумпований архів-дух у тілі радянської вахтерки. Атакує штампами та архівними папками. |
| Стажер-Зомбі | Ворог Tier 1 | Свіжоінфікований клерк. Слабкий, але швидкий. |
| Клерк-Примара | Ворог Tier 2 | Стандартний бюрократ. Несе печатки. |
| Начальник Відділу | Ворог Tier 3 | Товстий танк у костюмі. Повільний, дуже міцний. |

### Лор-фрази ворогів (при спавні)
```javascript
const ENEMY_PHRASES = [
  "Ваші документи прострочені!",
  "Архівуємо реальність...",
  "Форма 27Б-6 не заповнена!",
  "Підпишіть у трьох примірниках!",
  "Оплатіть держмито!",
  "Це не моя компетенція!",
];
```

---

## 🔗 ПОСИЛАННЯ

- **Репозиторій**: [github.com/matashi776-jpg/rsghdfdgfyts](https://github.com/matashi776-jpg/rsghdfdgfyts)
- **GitHub Pages**: `https://matashi776-jpg.github.io/rsghdfdgfyts/`
- **AI Prompts**: [`docs/AI_PROMPTS.md`](./AI_PROMPTS.md)
- **Phaser 3 Docs**: [photonstorm.github.io/phaser3-docs](https://photonstorm.github.io/phaser3-docs/)

---

*ACID KHUTIR MASTER DOCUMENT v1.0 — Слава Ланчину! 🌻⚡*
