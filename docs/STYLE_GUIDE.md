# STYLE GUIDE — ACID KHUTIR

## Мова
- Ігровий текст: **Українська** (Прикарпатська говірка для Сергія)
- Код: **English** (файли, змінні, коментарі)
- Документація: **Українська** (з англійськими термінами там де потрібно)

---

## Код — JavaScript

### Іменування
- **Classes:** PascalCase — `WaveSystem`, `Boss_Vakhtersha`
- **Files:** Same as class — `WaveSystem.js`, `Boss_Vakhtersha.js`
- **Constants:** UPPER_SNAKE — `SPAWN_INTERVAL`, `ELECTRIC_BLUE`
- **Variables/Functions:** camelCase — `enemyHP()`, `goldReward`
- **Private methods:** prefix `_` — `_spawnBoss()`, `_drawHPBar()`

### Файл-структура
```
src/core/         GameConfig, SaveManager, DifficultyDirector, AudioManager
src/scenes/       All Phaser scenes
src/entities/     Player, Enemy classes
src/systems/      Game systems (Wave, Perks, FX, etc.)
src/utils/        Math, Random, Dialogue helpers
```

### Коміти
```
feat: add BossScene glitch transition
fix: enemy HP bar not clearing on death
refactor: extract WaveSystem from BattleScene
docs: update LORE.md with Archivarius entry
art: add boss_vakhtersha phase 2 sprite
```

---

## Активи

### Спрайти
Pattern: `{category}_{name}_{action}_{frame}.png`  
Example: `enemy_clerk_walk_01.png`

### Аудіо
Pattern: `{category}_{name}.mp3`  
Example: `bgm_acid_folk.mp3`, `sfx_shoot.mp3`

---

## PR правила
1. Один PR = одна фіча або один фікс
2. Всі тести мають проходити
3. Без прямого пушу в `main`
4. Code review від мінімум 1 людини
