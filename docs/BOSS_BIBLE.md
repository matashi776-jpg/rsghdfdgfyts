# BOSS_BIBLE.md — ACID KHUTIR

## 👹 Товариш Вахтерша — Mausoleum Protocol 2.1

---

## Концепт

> Бетонний моноліт + багаторука жінка + глитч-монітор замість обличчя.  
> Намисто з дискет. Печатки замість долонь.  
> Символ тоталітарної бюрократичної системи, переродженої в кибер-демона.

---

## Технічні параметри

| Параметр | Значення |
|----------|----------|
| Клас | `Boss_Vakhtersha` |
| Текстура | `boss_vakhtersha` (→ `7.png`) |
| Розмір | 120 × 140 px |
| Тінт (Ф1) | Neon Magenta `#FF00FF` |
| Тінт (Ф2) | Red `#FF0000` |
| HP | 15 000 |
| Швидкість Ф1 | 15 px/с |
| Швидкість Ф2 | 30 px/с (×2 при ≤50% HP) |
| DPS до стіни | 2.0 |

---

## Фази

### Фаза 1 (HP > 50%)
- Повільний марш вліво
- Slam-атака кожні 4 с:
  - `cameras.main.shake(400, 0.012)` — camera shake
  - `FXSystem.spawnSlamWave()` — горизонтальна хвиля частинок

### Фаза 2 (HP ≤ 50%)
- Швидкість ×2
- `audioManager.setBGMRate(1.2)` — BGM напруга
- `FXSystem.triggerGlitch()` кожні 300 мс — монітор-обличчя глитчить
- Тінт змінюється на червоний

---

## AI Prompt для спрайту (→ `7.png`)

```
Brutalist concrete monolith fused with multi-armed Soviet woman,
glitch-monitor replacing face, glowing floppy-disk necklace,
bureaucratic stamps as hands, neon red eyes, cracked concrete texture,
Electric Blue and Neon Pink energy cracks, toxic green aura,
thick black outlines, cel-shading, flat neon colors,
Neon Psychedelic Cyber-Folk style, transparent background, 2048x2048.
```

---

## Звукові події

| Подія | Дія |
|-------|-----|
| Поява | Screen flash neon pink + `setBGMRate(1.2)` |
| Slam | Camera shake 400ms |
| Фаза 2 | Glitch flash кожні 300ms |
| Смерть | `setBGMRate(1.0)` + `spawnDeathExplosion()` |

---

## Діалоги

- *"Mausoleum Protocol 2.1 — ACTIVATED!"*
- *"ВАШІ ДОКУМЕНТИ ЗАСТАРІЛИ!"*
- *"ВИ НЕ ПРОЙДЕТЕ ЧЕРЕЗ МОЮ ХАТУ!"*

---

## Системні залежності

| Компонент | Роль |
|-----------|------|
| `Boss_Vakhtersha` | Entity (extends Enemy) |
| `WaveSystem` | Спаун на хвилі 10 |
| `FXSystem` | Slam wave, Glitch, Death explosion |
| `AudioManager` | BGM rate control |
| `BossScene` | Cinematic intro |
| `GameScene._bossTitleTxt` | HUD "КІБЕР-БОС: ТОВАРИШ ВАХТЕРША" |
