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
      type = 'zombie_clerk';
    } else if (wave === 2) {
      type = roll < 0.6 ? 'zombie_clerk' : 'archivarius';
    } else {
      if (roll < 0.4)      type = 'zombie_clerk';
      else if (roll < 0.7) type = 'archivarius';
      else                 type = 'inspector';
    }

    this.scene.spawnEnemy?.(type);
  }
}
