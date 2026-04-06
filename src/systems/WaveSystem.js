/**
 * WaveSystem.js
 * Manages enemy wave spawning for ACID KHUTIR.
 */
import DifficultyDirector from '../core/DifficultyDirector.js';
import Enemy_ZombieClerk from '../entities/Enemy_ZombieClerk.js';
import Enemy_Archivarius from '../entities/Enemy_Archivarius.js';
import Enemy_Inspector from '../entities/Enemy_Inspector.js';
import Boss_Vakhtersha from '../entities/Boss_Vakhtersha.js';

export default class WaveSystem {
  constructor(scene) {
    this.scene = scene;
    this.wave = 0;
    this.enemies = [];
    this._spawnTimer = null;
    this._active = false;
  }

  start() {
    this._active = true;
    this._nextWave();
  }

  stop() {
    this._active = false;
    if (this._spawnTimer) {
      this._spawnTimer.remove();
      this._spawnTimer = null;
    }
  }

  _nextWave() {
    if (!this._active) return;
    this.wave++;
    if (this.scene.onWaveStart) this.scene.onWaveStart(this.wave);

    if (DifficultyDirector.isBossWave(this.wave)) {
      this._spawnBoss();
    } else {
      this._spawnRegularWave();
    }
  }

  _spawnBoss() {
    const { height } = this.scene.scale;
    const boss = new Boss_Vakhtersha(this.scene, this.scene.scale.width + 80, height / 2, this.wave);
    this.enemies.push(boss);
    if (this.scene.onBossSpawn) this.scene.onBossSpawn(boss);
  }

  _spawnRegularWave() {
    const count = DifficultyDirector.waveEnemyCount(this.wave);
    const { height } = this.scene.scale;
    let spawned = 0;

    this._spawnTimer = this.scene.time.addEvent({
      delay: 1200,
      repeat: count - 1,
      callback: () => {
        const y = Phaser.Math.Between(100, height - 100);
        const x = this.scene.scale.width + 60;
        const r = Math.random();
        let enemy;
        if (r < 0.55) {
          enemy = new Enemy_ZombieClerk(this.scene, x, y, this.wave);
        } else if (r < 0.80) {
          enemy = new Enemy_Inspector(this.scene, x, y, this.wave);
        } else {
          enemy = new Enemy_Archivarius(this.scene, x, y, this.wave);
        }
        this.enemies.push(enemy);
        spawned++;
        if (spawned >= count) {
          this._awaitWaveClear();
        }
      },
    });
  }

  _awaitWaveClear() {
    const check = this.scene.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.enemies = this.enemies.filter(e => e.alive);
        if (this.enemies.length === 0) {
          check.remove();
          if (this.scene.onWaveComplete) this.scene.onWaveComplete(this.wave);
          this.scene.time.delayedCall(2000, () => this._nextWave());
        }
      },
    });
  }

  update() {
    this.enemies.forEach(e => e.update());
  }

  destroy() {
    this.stop();
    this.enemies.forEach(e => e.destroy());
    this.enemies = [];
  }
}
