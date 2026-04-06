# WORKFLOW.md — ACID KHUTIR

## Правила комітів

Формат: `type: short description`

| Тип        | Коли використовувати                            |
|------------|-------------------------------------------------|
| `feat`     | Нова фіча або механіка                         |
| `fix`      | Баг-фікс                                       |
| `refactor` | Рефакторинг без зміни поведінки                |
| `docs`     | Оновлення документації                         |
| `art`      | Новий або змінений арт-актив                   |
| `audio`    | Нові або змінені аудіо-файли                   |
| `chore`    | Технічні зміни (deps, config, CI)              |

---

## Правила PR

1. **Один PR = одна фіча** — не мікс фіч і фіксів
2. **Назва PR:** `[Type] Short description`
3. **Опис:** Що змінено + скріни якщо UI
4. **Review:** Мінімум 1 аппрувал
5. **No direct push to `main`**

---

## Пайплайн ассетів

```
Генерація (Gemini/DALL·E) → Review → Scale to in-game size
→ Remove BG → Place in public/assets/sprites/ → Update PreloadScene
```

### Папки
```
public/assets/sprites/player/    ← спрайти гравця
public/assets/sprites/enemies/   ← спрайти ворогів
public/assets/sprites/boss/      ← спрайти боса
public/assets/sprites/fx/        ← FX спрайти
public/assets/sprites/ui/        ← UI елементи
public/assets/audio/             ← музика та SFX
```

---

## Пайплайн генерації (AI)

1. Відкрий `docs/AI_PROMPTS.md`
2. Вибери потрібний промпт
3. Додай **Universal Base Prompt** на початок
4. Запусти в Gemini / DALL·E / Midjourney
5. Review результату (silhouette, colors, outlines)
6. Збережи в правильну папку з правильною назвою

---

## Пайплайн тестування

```bash
npm run dev         # Запустити dev сервер
npm run build       # Перевірити production збірку
npm run check-style # Перевірити стиль коду
npm run clean-assets # Очистити тимчасові ассети
```

---

## Процес розробки

```
Issue → Branch → Код → Build OK → PR → Review → Merge
```

1. Створи issue в GitHub
2. Гілка: `feat/wave-system` або `fix/boss-hp-bar`
3. Розробляй з `npm run dev`
4. Перевір `npm run build` перед PR
5. PR → Review → Merge в `main`
