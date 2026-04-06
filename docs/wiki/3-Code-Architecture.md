# 3. Code Architecture

## 3.1 Directory Structure

```
/src
  /core          ← game-wide singletons & constants
  /scenes        ← Phaser Scene subclasses
  /entities      ← game object classes (Hero, Enemy, Projectile…)
  /systems       ← stateless managers (WaveSystem, VFXSystem, AudioSystem…)
  /utils         ← pure helper functions & math
```

## 3.2 Scenes

| Scene | Responsibility |
|---|---|
| `PreloadScene` | Load all assets, show progress bar |
| `MenuScene` | Main menu, settings, credits |
| `StoryScene` | Narrative intro before battle |
| `BattleScene` | Core gameplay loop |
| `UIScene` | Overlaid HUD (runs parallel to BattleScene) |
| `PerkScene` | Perk selection between wave sets |
| `KhutirScene` | Khata upgrade / meta screen (post-run) |

Scene communication: use Phaser's built-in `scene.get('UIScene').events.emit(...)` for cross-scene events.

## 3.3 Entities

All entities extend `Phaser.GameObjects.Sprite` and own a **State Machine**.

```
Entity
├── Hero       — player character, input-driven
├── Enemy      — base class; subclassed per enemy type
│   ├── Clerk
│   ├── Archivist
│   ├── Inspector
│   └── Deputy
├── Boss       — Vakhtersha, multi-phase
└── Projectile — pooled bullet / stamp / paper
```

Rules:
- Entities must **not** call `scene.add.*` themselves — use factory methods in the scene.
- State transitions must be logged in debug mode: `console.debug('[StateMachine]', entity.id, oldState, '→', newState)`.

## 3.4 State Machines

Each enemy runs a lightweight FSM:

```
IDLE → WALK → ATTACK → STAGGER → DEAD
            ↑_____________|
```

Implementation pattern (`/src/systems/StateMachine.js`):

```js
class StateMachine {
  constructor(owner, states) { … }
  transition(newState) { … }
  update(delta) { this.current.update(delta); }
}
```

Rules:
- States are plain objects: `{ enter(), update(delta), exit() }`.
- No game logic inside `Scene.update()` — delegate to `EnemyManager.update(delta)` and `WaveSystem.update(delta)`.

## 3.5 Object Pooling

Use `Phaser.GameObjects.Group` with `maxSize` for all frequently spawned objects.

```js
this.bulletPool = this.add.group({
  classType: Projectile,
  maxSize: 200,
  runChildUpdate: true,
});
```

Acquire: `pool.get(x, y)` — returns inactive object or `null` if pool exhausted.  
Release: call `object.setActive(false).setVisible(false)` and return to pool.

Pooled types: `Projectile`, `Enemy` (per type), particle emitters.
