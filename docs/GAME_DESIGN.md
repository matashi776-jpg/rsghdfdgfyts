# GAME_DESIGN.md — ACID KHUTIR

## 🎮 Жанр

- **2D Defense** (lane-based, fixed position)
- **Roguelike progression** (meta-рівні, перки між хвилями)
- **Bullet-hell elements** (кілька видів снарядів, АOE)

---

## 🎯 Ціль

Захистити хату від хвиль ворогів. Хутір має смугу HP — коли закінчується, гра завершена.

---

## 🔄 Ігровий цикл

```
BootScene → PreloadScene → MenuScene → StoryScene
    → GameScene (Хвиля 1–9) → PerkScene (хв. 5, 10) → GameScene (продовж.)
    → BossScene (хв. 10) → GameScene (бос) → DeathScene (програш)
                                                       ↓
                                               MetaProgression.recordRun()
                                               → MenuScene / рестарт
```

---

## ⚔️ Механіки

### Стрільба
5 захисників (Сергій) автоматично стріляють у найближчого ворога.
- Снаряд летить з кутом до цілі
- При влученні — `ProjectileSystem.onHit()` → шкода × `modifiers.damage`
- При пергу «Кислотний Буряк»: AOE-вибух навколо влучення

### Хвилі
| Параметр | Формула |
|----------|---------|
| HP ворога | `60 + wave×15 + log(wave+1)×10` |
| Швидкість | `40 + wave×2` |
| Золото | `5 × (1 + wave×0.05)` |
| Інтервал спауну | `max(500, 2000 − wave×100)` ms |
| Ворогів за інтервал | `1 + floor(wave/3)` |

### Економіка
- **Старт:** 50 ₴
- **Пасивний прибуток:** 10 ₴ кожні 2 с (помножений `modifiers.passiveIncome`)
- **Нагорода за ворога:** `5 × (1 + wave×0.05)` ₴
- **Апгрейд хати:**
  - Рівень 1 → 2: 200 ₴ (HP 2000 → 5000, тінт Cyan)
  - Рівень 2 → 3: 500 ₴ (HP 5000 → 12000, тінт Pink, +attackSpeed)

### Бос (Хвиля 10)
- HP = 15 000
- Фаза 2 при ≤50% HP: швидкість ×2, BGM rate 1.2×, глитч ефект

### Перки (хвилі 5 та 10)
| ID | Назва | Ефект |
|----|-------|-------|
| `golden_talon` | Золотий Талон | passiveIncome ×2 |
| `techno_pechatka` | Техно-Печатка | wallDefense ×(1/0.7) |
| `acid_buryak` | Кислотний Буряк | damage ×1.5, AOE splash |
| `cossack_drive` | Козацький Драйв | attackSpeed −0.3 |

### Мета-прогресія
- За кожен пробіг — `MetaProgression.recordRun(wave)` → оновлює рекорд
- Кожні 5 хвиль рекорду → meta level +1
- Meta level → `+5% damage`, `+10% passiveIncome` на старті наступного пробігу

---

## 🏗 Апгрейд хати

| Рівень | Назва | HP | Колір | Бонус |
|--------|-------|----|-------|-------|
| 1 | Затишна Хата | 2 000 | Neon Pink | — |
| 2 | Цегляний Дім | 5 000 | Cyan | — |
| 3 | КІБЕР-ФОРТЕЦЯ | 12 000 | Hot Pink | attackSpeed +30% |

---

## 🎵 Аудіо

- **BGM:** acid-folk loop (файл `bgm.mp3`)
- **Boss arrival:** `bgm.setRate(1.2)`
- **Death/duck:** `AudioManager.duck()` — плавне зниження гучності

---

## ♾️ Складність

`DifficultyDirector` забезпечує плавне масштабування без стрибків.
Усі формули централізовані — зміна однієї константи в `GameConfig.js` вплине на всю гру.
