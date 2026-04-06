# ENEMY_BIBLE.md — ACID KHUTIR

## 🧟 Довідник ворогів

---

## Зомбі-Клерк *(Enemy_ZombieClerk)*

| Параметр | Значення |
|----------|----------|
| Клас | `Enemy_ZombieClerk` |
| Текстура | `enemy_clerk` (→ `4.png`) |
| Розмір | 48 × 64 px |
| Тінт | Neon Purple `#AA44FF` |
| HP | `DifficultyDirector.enemyHP(wave)` |
| Швидкість | `DifficultyDirector.enemySpeed(wave)` |
| Особливість | Acid Splash AOE при смерті |

**Поведінка:**
1. Спаунується з правого краю екрану
2. Рухається вліво зі швидкістю `speed`
3. При досягненні стіни — зупиняється, атакує (DPS 0.5)
4. При смерті — `FXSystem.spawnAcidSplash()` — Toxic Green частинки

**Фрази:** *"Приходьте завтра!", "У нас обід!", "Де довідка?", "Не по регламенту!"*

---

## Архіваріус *(Enemy_Archivarius)*

| Параметр | Значення |
|----------|----------|
| Клас | `Enemy_Archivarius` |
| Текстура | `enemy_archivarius` (→ `5.png`) |
| Розмір | 56 × 72 px |
| Тінт | Toxic Green `#00FF88` |
| HP | `DifficultyDirector.enemyHP(wave) × 2.5` |
| Швидкість | `DifficultyDirector.enemySpeed(wave) × 0.7` |
| Особливість | Паперовий Щит (−80% шкоди на 1.5 с) |

**Поведінка:**
1. Повільний і міцний
2. Кожні 4–8 с активує Паперовий Щит (alpha 0.5, шкода ÷5)
3. Після щита — перепланування через `_scheduleShield()`

**Фрази:** *"Це заархівовано!", "Форма № 18-Б!", "Без печатки не можна!"*

---

## Інспектор *(Enemy_Inspector)*

| Параметр | Значення |
|----------|----------|
| Клас | `Enemy_Inspector` |
| Текстура | `enemy_inspector` (→ `6.png`) |
| Розмір | 44 × 60 px |
| Тінт | Neon Pink `#FF00AA` |
| HP | `DifficultyDirector.enemyHP(wave) × 0.7` |
| Швидкість | `DifficultyDirector.enemySpeed(wave) × 1.5` |
| Особливість | Dash (×3 швидкість на 0.6 с, кожні 3–6 с) |

**Поведінка:**
1. Швидко рухається, легко вбивається
2. Dash-атака — короткий спринт у 3× швидкість
3. Після dash — повернення до звичайного темпу + планування наступного

**Фрази:** *"ПЕРЕВІРКА!", "Штраф!", "Порушення протоколу!", "Де дозвіл?!"*

---

## Пропорції спауну (на хвилю)

| Тип | Ймовірність |
|-----|------------|
| Зомбі-Клерк | 50% |
| Інспектор | 25% |
| Архіваріус | 25% |

---

## Системні залежності

| Компонент | Роль |
|-----------|------|
| `DifficultyDirector` | HP, Speed, Gold |
| `WaveSystem` | Спаун та управління |
| `FXSystem` | Death VFX, Splash |
| `ProjectileSystem` | Collision + Damage |
| `Enemy.hpBar` | HP bar rendering |
| `Dialogue` | Speech bubbles |
