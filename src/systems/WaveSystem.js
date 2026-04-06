/**
 * WaveSystem.js  (v2)
 * Manages wave progression, enemy-spawn timing, and difficulty scaling.
 *
 * Replaces the inline _startWave / _endWave logic in BattleScene so that
 * wave state lives in a single, testable class.  BattleScene still owns the
 * actual enemy-spawn and boss-spawn methods; WaveSystem calls them via the
 * scene reference it receives.
 *
 * Wave flow
 *   start()         → begins wave 1
 *   _beginWave()    → configures timers for the current wave number
 *   end()           → stops timers; triggers PerkScene at waves 5 & 10
 *   nextWave()      → called by BattleScene.resumeFromPerk() to continue
 *
 * Events emitted on GlobalEvents:
 *   'waveChanged'  (wave: number)
 */
import { GlobalEvents } from './EventBus.js';

export default class WaveSystem {
  /**
   * @param {Phaser.Scene} scene  – reference to BattleScene
   */
  constructor(scene) {
    this.scene = scene;

    this.wave         = 1;
    this.isActive     = false;
    this._spawnTimer  = null;
    this._endTimer    = null;

    // Duration of one wave in ms (mirrors BattleScene._waveDuration)
    this.waveDuration    = 80000;
    // Spawn interval base (decreases with each wave, minimum 500 ms)
    this.spawnInterval   = 2000;
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  /** Start from wave 1 */
  start() {
    this.wave = 1;
    this._beginWave();
  }

  /** End the current wave (called by boss-kill or wave timer expiry) */
  end() {
    this.isActive          = false;
    this.scene.waveActive  = false;

    if (this._spawnTimer) { this._spawnTimer.remove(); this._spawnTimer = null; }
    if (this._endTimer)   { this._endTimer.remove();   this._endTimer   = null; }

    if (this.wave === 5 || this.wave === 10) {
      // Pause BattleScene and show perk selection
      this.scene.scene.pause();
      this.scene.scene.launch('PerkScene', {
        modifiers: this.scene.modifiers,
        wave:      this.wave,
      });
    } else {
      this.wave++;
      this._beginWave();
    }
  }

  /** Resume after PerkScene selection */
  nextWave() {
    this.wave++;
    this._beginWave();
  }

  /** Clean up all pending timers (called on game-over) */
  destroy() {
    if (this._spawnTimer) { this._spawnTimer.remove(); this._spawnTimer = null; }
    if (this._endTimer)   { this._endTimer.remove();   this._endTimer   = null; }
  }

  // ─── Private ────────────────────────────────────────────────────────────

  _beginWave() {
    this.isActive = true;

    // Sync state back to BattleScene so UIScene and other systems can read it
    this.scene.wave        = this.wave;
    this.scene.waveActive  = true;
    this.scene._waveElapsed = 0;
    this.scene._waveLabelTxt.setText(`Хвиля: ${this.wave}`);

    // Broadcast so UIScene and any other listeners can react
    GlobalEvents.emit('waveChanged', this.wave);

    if (this.wave === 10) {
      // Boss wave — no spawn timer, no end timer; BattleScene owns boss logic
      this.scene._spawnBoss();
      return;
    }

    const interval = Math.max(500, this.spawnInterval - this.wave * 100);

    this._spawnTimer = this.scene.time.addEvent({
      delay:         interval,
      loop:          true,
      callbackScope: this,
      callback:      () => {
        if (!this.scene.gameOver) this.scene._spawnEnemy();
      },
    });

    // Spawn one enemy immediately so the wave feels active right away
    this.scene._spawnEnemy();

    this._endTimer = this.scene.time.delayedCall(
      this.waveDuration,
      () => this.end(),
    );
  }
}
