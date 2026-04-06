# PERFORMANCE TESTING — ACID KHUTIR

## 1. FPS Testing
- Цель: 60 FPS
- Минимум: 55 FPS
- Тест: 100 врагов на экране

## 2. Memory Testing
- Цель: < 300 MB
- Проверить утечки при:
  - смене сцен
  - спавне врагов
  - уничтожении FX

## 3. CPU Testing
- Цель: < 40% загрузки
- Проверить:
  - WaveSystem
  - ProjectileSystem
  - AnimationSystem

## 4. GPU Testing
- Цель: стабильный рендер
- Проверить:
  - прозрачность
  - glow-эффекты
  - glitch-эффекты

## 5. Stress Test
- 200 врагов
- 200 пуль
- 50 FX одновременно
