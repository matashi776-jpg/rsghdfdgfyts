/**
 * WaveSystem.js
 * Manages enemy wave lifecycle: spawn timers, wave transitions, boss trigger.
 */
import DifficultyDirector from '../core/DifficultyDirector.js';
import GameConfig          from '../core/GameConfig.js';
import Enemy_ZombieClerk   from '../entities/Enemy_ZombieClerk.js';
import Enemy_Archivarius   from '../entities/Enemy_Archivarius.js';
import Enemy_Inspector     from '../entities/Enemy_Inspector.js';
import Boss_Vakhtersha     from '../entities/Boss_Vakhtersha.js';

export default class WaveSystem {
  /**
   * @param {Phaser.Scene} scene   – GameScene
   * @param {object}       config  – { enemiesGroup, onWaveEnd }
   */
  constructor(scene, { enemiesGroup, onWaveEnd }) {
    this._scene        = scene;
    this._enemies      = enemiesGroup; // Phaser physics group
    this._onWaveEnd    = onWaveEnd;    // callback(wave)
    this._spawnTimer   = null;
    this._waveEndTimer = null;
    this.active        = false;
    this.bossActive    = false;
  }

  // ── Public ────────────────────────────────────────────────────────────────

  start(wave) {
    this.active = true;
    this._elapsed = 0;

    if (wave === GameConfig.BOSS_WAVE) {
      this._spawnBoss();
      return;
    }

    const interval = DifficultyDirector.spawnInterval(wave);
    this._spawnEnemies(wave);

    this._spawnTimer = this._scene.time.addEvent({
      delay:    interval,
      loop:     true,
      callback: () => this._spawnEnemies(wave),
    });

    this._waveEndTimer = this._scene.time.delayedCall(
      GameConfig.WAVE_DURATION,
      () => this._endWave(wave),
    );
  }

  stop() {
    this.active = false;
    if (this._spawnTimer)   { this._spawnTimer.remove();   this._spawnTimer   = null; }
    if (this._waveEndTimer) { this._waveEndTimer.remove(); this._waveEndTimer = null; }
  }

  /** Called by GameScene when an enemy entity signals its death. */
  onEnemyDied(enemyEntity) {
    if (enemyEntity.tier === 'boss') {
      this.bossActive = false;
      this._endWave(GameConfig.BOSS_WAVE);
    }
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  _spawnEnemies(wave) {
    if (!this.active) return;
    const count  = DifficultyDirector.enemiesPerInterval(wave);
    for (let i = 0; i < count; i++) this._spawnOne(wave);
  }

  _spawnOne(wave) {
    const { height } = this._scene.scale;
    const hp    = DifficultyDirector.enemyHP(wave);
    const speed = DifficultyDirector.enemySpeed(wave);
    const y     = Phaser.Math.Between(
      Math.floor(height * 0.18),
      Math.floor(height * 0.82),
    );

    const roll  = Math.random();
    let enemy;
    const w = GameConfig.SPAWN_WEIGHTS;
    if (roll < w.zombie_clerk) {
      enemy = new Enemy_ZombieClerk(this._scene, 1340, y, hp * GameConfig.SPAWN_HP_MULT.zombie_clerk, speed);
    } else if (roll < w.zombie_clerk + w.inspector) {
      enemy = new Enemy_Inspector(this._scene, 1340, y, hp * GameConfig.SPAWN_HP_MULT.inspector, speed);
    } else {
      enemy = new Enemy_Archivarius(this._scene, 1340, y, hp * GameConfig.SPAWN_HP_MULT.archivarius, speed);
    }

    // Register sprite into the physics group so colliders work
    this._enemies.add(enemy.sprite);
    enemy.sprite.enemyRef = enemy;
  }

  _spawnBoss() {
    const { height } = this._scene.scale;
    const boss = new Boss_Vakhtersha(this._scene, 1200, height / 2);
    this._enemies.add(boss.sprite);
    boss.sprite.enemyRef = boss;
    this.bossActive = true;

    if (this._scene.audioManager) this._scene.audioManager.setBGMRate(1.2);

    // Neon pink screen flash
    const { width } = this._scene.scale;
    const flash = this._scene.add.rectangle(width / 2, height / 2, width, height, 0xff00aa, 0).setDepth(50);
    this._scene.tweens.add({ targets: flash, fillAlpha: 0.45, duration: 200, yoyo: true, repeat: 2 });
  }

  _endWave(wave) {
    this.stop();
    if (this._onWaveEnd) this._onWaveEnd(wave);
  }
}
