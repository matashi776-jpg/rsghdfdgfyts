/**
 * WaveSystem.js
 * Manages enemy wave spawning for ACID KHUTIR — Stage 1
 */
export default class WaveSystem {
  constructor(scene) {
    this.scene          = scene;
    this.currentWave    = 1;
    this.maxWaves       = 4; // Waves 1-4 before boss
    this.spawnTimer     = null;
    this.waveTimer      = null;
    this.enemiesLeft    = 0;
    this.active         = false;

    this.onWaveComplete = null; // callback
    this.onAllWavesDone = null; // callback
  }

  startWave(waveNumber) {
    this.currentWave = waveNumber;
    this.active      = true;

    const totalEnemies = 5 + waveNumber * 3;
    this.enemiesLeft   = totalEnemies;

    let spawned = 0;
    this.spawnTimer = this.scene.time.addEvent({
      delay: Math.max(600, 1200 - waveNumber * 80),
      repeat: totalEnemies - 1,
      callback: () => {
        this._spawnEnemyForWave(waveNumber);
        spawned++;
        if (spawned >= totalEnemies) {
          this.spawnTimer = null;
        }
      },
    });
  }

  update(time, delta) {
    if (!this.active) return;

    // Check wave completion: no spawn timer and no living enemies
    if (!this.spawnTimer && this.scene.enemies?.getLength() === 0) {
      this.active = false;
      if (this.currentWave >= this.maxWaves) {
        this.onAllWavesDone?.();
      } else {
        this.onWaveComplete?.();
      }
    }
  }

  _spawnEnemyForWave(wave) {
    let type;
    const roll = Math.random();

    if (wave === 1) {
      // Wave 1: basic enemies only
      type = roll < 0.7 ? 'zombie_clerk' : 'retro_enforcer';
    } else if (wave === 2) {
      // Wave 2: introduce ranged herald
      if (roll < 0.45)      type = 'zombie_clerk';
      else if (roll < 0.70) type = 'archivarius';
      else if (roll < 0.90) type = 'retro_enforcer';
      else                  type = 'propaganda_herald';
    } else if (wave === 3) {
      // Wave 3: all mid-tier types
      if (roll < 0.25)      type = 'zombie_clerk';
      else if (roll < 0.45) type = 'archivarius';
      else if (roll < 0.62) type = 'retro_enforcer';
      else if (roll < 0.80) type = 'propaganda_herald';
      else                  type = 'inspector';
    } else {
      // Wave 4+: full roster including Factory Warden
      if (roll < 0.20)      type = 'zombie_clerk';
      else if (roll < 0.36) type = 'archivarius';
      else if (roll < 0.50) type = 'retro_enforcer';
      else if (roll < 0.64) type = 'propaganda_herald';
      else if (roll < 0.82) type = 'inspector';
      else                  type = 'factory_warden';
    }

    this.scene.spawnEnemy?.(type);
  }
}
