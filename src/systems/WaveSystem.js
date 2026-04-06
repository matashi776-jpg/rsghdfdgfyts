/**
 * WaveSystem.js
 * Controls wave progression: spawn timers, wave-end logic,
 * perk-screen transitions, and boss wave handling.
 *
 * Depends on scene properties:
 *   scene.wave, scene.waveActive, scene._waveElapsed,
 *   scene._waveDuration, scene.gameOver, scene.enemyManager,
 *   scene._waveLabelTxt, scene.modifiers
 */
export default class WaveSystem {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene          = scene;
    this._spawnTimer    = null;
    this._waveEndTimer  = null;
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Begin the current wave (uses scene.wave). */
  startWave() {
    const scene = this.scene;
    scene.waveActive   = true;
    scene._waveElapsed = 0;
    scene._waveLabelTxt.setText(`Хвиля: ${scene.wave}`);

    if (scene.wave === 10) {
      scene.enemyManager.spawnBoss();
    } else {
      const interval = Math.max(500, 2000 - scene.wave * 100);

      this._spawnTimer = scene.time.addEvent({
        delay:         interval,
        loop:          true,
        callbackScope: this,
        callback:      () => scene.enemyManager.spawnEnemy(),
      });

      // Spawn one enemy immediately so the wave doesn't start empty
      scene.enemyManager.spawnEnemy();

      this._waveEndTimer = scene.time.delayedCall(
        scene._waveDuration,
        this.endWave,
        [],
        this,
      );
    }
  }

  /** Finish the current wave and either open the perk screen or start the next. */
  endWave() {
    const scene = this.scene;
    scene.waveActive = false;
    this._clearTimers();

    if (scene.wave === 5 || scene.wave === 10) {
      scene.scene.pause();
      scene.scene.launch('PerkScene', { modifiers: scene.modifiers, wave: scene.wave });
    } else {
      scene.wave++;
      this.startWave();
    }
  }

  /** Called by PerkScene after the player picks a perk. */
  resumeFromPerk() {
    this.scene.wave++;
    this.startWave();
  }

  /** Remove all active timers (e.g., on game-over). */
  cleanup() {
    this._clearTimers();
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  _clearTimers() {
    if (this._spawnTimer)   { this._spawnTimer.remove();   this._spawnTimer   = null; }
    if (this._waveEndTimer) { this._waveEndTimer.remove(); this._waveEndTimer = null; }
  }
}
