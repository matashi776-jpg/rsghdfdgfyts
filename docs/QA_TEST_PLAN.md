# QA TEST PLAN — ACID KHUTIR

## 1. Purpose
Обеспечить стабильную работу первого игрового тура:
- корректная загрузка
- корректная работа сцен
- корректная работа врагов
- корректная работа игрока
- корректная работа UI
- корректная работа FX
- корректная работа аудио
- отсутствие критических багов

## 2. Scope
Тестируются:
- GameScene
- BossScene
- WaveSystem
- Player
- Enemies
- UI System
- FX System
- Audio System

## 3. Test Types
- Functional Testing
- Smoke Testing
- Regression Testing
- Performance Testing
- Stress Testing
- Visual Testing
- Audio Testing

## 4. Environments
Browser: Chrome, Firefox, Edge  
Resolution: 1280x720, 1920x1080  
Platform: Windows, macOS, Linux

## 5. Entry Criteria
- Все ассеты загружены
- Atlas обновлён
- Сцены подключены
- Нет блокирующих багов

## 6. Exit Criteria
- 0 критических багов
- 0 блокирующих багов
- ≤ 5 минорных багов
- FPS ≥ 55 на 1080p
