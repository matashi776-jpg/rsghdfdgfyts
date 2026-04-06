# STYLE_GUIDE.md — ACID KHUTIR

## 🎨 Neon Psychedelic Cyber-Folk Style Guide

---

## Основна палітра

| Колір | Hex | Використання |
|-------|-----|-------------|
| Electric Blue | `#00BFFF` | Снаряди, кибер-рука, акценти UI |
| Neon Pink | `#FF00AA` | Спалахи, декор вишиванки, перки |
| Toxic Green | `#39FF14` | Кислота, сплеск, зараження |
| Ultra-Violet | `#7F00FF` | Фон, ауратінт, бос |
| Neon Cyan | `#00FFFF` | Заголовки UI, HP bar |
| Neon Yellow | `#FFDD00` | Золото, рекорди |
| Pure Black | `#000000` | Контурна лінія (обов'язково) |

---

## Правила арту

1. **Контур — Pure Black, 4–6 px** (завжди, без виключень)
2. **Cel-shading тільки** — без реалізму, без blur, без drop shadow
3. **Glow бекується в PNG** — без post-processing шейдерів
4. **Фон — прозорий** (alpha channel) для всіх спрайтів
5. **UV-реактивний орнамент** — писанкові патерни поверх одягу
6. **Glitch aura** — хроматична аберація по контурах у ворогів

---

## Правила коду

```js
// ✅ Правильно — константи з GameConfig
const damage = GameConfig.PROJECTILE_BASE_DAMAGE * modifiers.damage;

// ❌ Неправильно — магічні числа
const damage = 20 * 1.5;
```

- Весь Phaser-текст: `fontFamily: 'Arial Black, Arial'`
- Neon glow на тексті: `shadow: { color: '#00ffff', blur: 16, fill: true }`
- Глибина шарів: bg=0, enemies=4–6, projectiles=6, UI=10–21, overlays=40–60

---

## Анімаційні стандарти

| Тип | Frames | FPS |
|-----|--------|-----|
| Idle | 4 | 8 |
| Walk | 6 | 12 |
| Shoot | 3 | 16 |
| Boss walk | 4 | 4 |
| Boss slam | 6 | 12 |

---

## Іменування файлів

```
{category}_{name}_{action}_{frame:02d}.png

player_idle_01.png
enemy_clerk_walk_02.png
boss_vakhtersha_slam_01.png
fx_explosion_pink.png
ui_button.png
```

---

## Текстурний атлас

Усі спрайти упаковуються через TexturePacker:
- Вихід: `public/assets/atlas/sprites.png` + `sprites.json`
- Формат: Phaser 3 / JSON Hash
- Padding: 2 px | Algorithm: MaxRects | Max size: 4096×4096

---

## Neon Psychedelic Cyber-Folk — ключові слова для AI

```
Neon Psychedelic Cyber-Folk 2D sprite, heavy black outlines, cel-shading,
UV-reactive embroidery, glowing Ukrainian folk patterns,
acid neon colors (Electric Blue #00BFFF, Neon Pink #FF00AA,
Toxic Green #39FF14, Ultra-Violet #7F00FF),
chromatic aberration edges, electric smoke, glitch aura,
hand-drawn animation style, high contrast, readable silhouette,
centered composition, transparent background, 2048×2048.
```
