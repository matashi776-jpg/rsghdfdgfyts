/**
 * WaveSystem.js
 * Manages the 3-wave + mini-boss structure for Level 1 (ACID KHUTIR).
 *
 * Wave 1:  6 Zombie Clerks
 * Wave 2:  8 Zombie Clerks + 2 Archivarius
 * Wave 3: 10 Zombie Clerks + 3 Archivarius + 1 Inspector
 * Mini-Boss: Mini-Vakhtersha (HP 600, 2 phases)
 */

// Enemy definitions matching ENEMY_BIBLE.md
const ENEMY_DEFS = {
  zombie_clerk: { hp: 60,  speed: 40,  damage: 10, w: 28, h: 40, color: 0x44aa44 },
  archivarius:  { hp: 120, speed: 30,  damage: 15, w: 36, h: 52, color: 0x0055ff },
  inspector:    { hp: 180, speed: 25,  damage: 25, w: 44, h: 60, color: 0xff4400 },
  mini_vakhtersha: { hp: 600, speed: 20, damage: 35, w: 80, h: 100, color: 0x880088 },
};

// Wave definitions — each entry is { type, count }
const WAVE_DEFS = [
  [{ type: 'zombie_clerk', count: 6 }],
  [{ type: 'zombie_clerk', count: 8 }, { type: 'archivarius', count: 2 }],
  [{ type: 'zombie_clerk', count: 10 }, { type: 'archivarius', count: 3 }, { type: 'inspector', count: 1 }],
];

export default class WaveSystem {
  /**
   * @param {Phaser.Scene} scene  — must expose enemiesGroup (Phaser physics group)
   */
  constructor(scene) {
    this.scene = scene;
    this._waveIndex = 0;      // 0-based index into WAVE_DEFS; 3 = mini-boss
    this._active = false;
    this._spawnQueue = [];
    this._spawnTimer = null;
    this._enemies = [];
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  start() {
    this._spawnWave(this._waveIndex);
  }

  update(time, delta) {
    // Move each enemy toward the house (left edge)
    for (const e of this._enemies) {
      if (!e.alive) continue;
      if (e.sprite && e.sprite.active) {
        e.sprite.setVelocityX(-e.speed);
      }
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  _spawnWave(index) {
    this._active = true;
    this._enemies = [];

    const { width, height } = this.scene.scale;

    if (index < WAVE_DEFS.length) {
      // Normal wave
      this._spawnQueue = [];
      for (const entry of WAVE_DEFS[index]) {
        for (let i = 0; i < entry.count; i++) {
          this._spawnQueue.push(entry.type);
        }
      }
      // Shuffle so types are interleaved
      Phaser.Utils.Array.Shuffle(this._spawnQueue);

      this.scene.events.emit('waveStart', index + 1);
      this._scheduleNextSpawn();
    } else {
      // Mini-boss wave
      this.scene.events.emit('bossStart');
      this._spawnEnemy('mini_vakhtersha', width + 60, height / 2);
    }
  }

  _scheduleNextSpawn() {
    if (this._spawnQueue.length === 0) return;
    const type = this._spawnQueue.shift();
    const { width, height } = this.scene.scale;
    const y = Phaser.Math.Between(height * 0.25, height * 0.75);

    this._spawnEnemy(type, width + 60, y);

    if (this._spawnQueue.length > 0) {
      this._spawnTimer = this.scene.time.delayedCall(1200, () => this._scheduleNextSpawn());
    }
  }

  _spawnEnemy(type, x, y) {
    const def = ENEMY_DEFS[type];
    if (!def) return;

    const texKey = `akh_enemy_${type}`;
    if (!this.scene.textures.exists(texKey)) {
      this._generateEnemyTexture(texKey, def);
    }

    const group = this.scene.enemiesGroup;
    const sprite = group
      ? group.create(x, y, texKey)
      : this.scene.physics.add.sprite(x, y, texKey);

    sprite.body.allowGravity = false;
    sprite.setDepth(6);

    const enemy = {
      type,
      hp: def.hp,
      maxHP: def.hp,
      speed: def.speed,
      damage: def.damage,
      alive: true,
      sprite,
    };

    sprite.enemyRef = enemy;
    sprite.hp = def.hp;
    sprite.maxHP = def.hp;

    this._enemies.push(enemy);

    // Register death handler
    sprite.on('destroy', () => { enemy.alive = false; });

    // Notify the scene so it can wire colliders
    if (this.scene.onEnemySpawned) {
      this.scene.onEnemySpawned(enemy);
    }

    return enemy;
  }

  _generateEnemyTexture(key, def) {
    const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(def.color, 1);
    gfx.fillRect(0, 0, def.w, def.h);
    // Neon-pink eyes
    gfx.fillStyle(0xff00ff, 1);
    gfx.fillRect(Math.floor(def.w * 0.2), Math.floor(def.h * 0.15), Math.floor(def.w * 0.2), Math.floor(def.h * 0.12));
    gfx.fillRect(Math.floor(def.w * 0.6), Math.floor(def.h * 0.15), Math.floor(def.w * 0.2), Math.floor(def.h * 0.12));
    gfx.generateTexture(key, def.w, def.h);
    gfx.destroy();
  }

  // Called by GameScene when an enemy dies
  onEnemyDied(enemy) {
    enemy.alive = false;
    const remaining = this._enemies.filter(e => e.alive);

    if (remaining.length === 0 && !this._spawnQueue.length) {
      this._advanceWave();
    }
  }

  _advanceWave() {
    this._waveIndex++;
    if (this._waveIndex <= WAVE_DEFS.length) {
      // Small delay between waves
      this.scene.time.delayedCall(3000, () => this._spawnWave(this._waveIndex));
    }
    // If index > WAVE_DEFS.length, the mini-boss is already dead → victory handled by GameScene
  }
}
