/**
 * AudioManager.js
 * Thin wrapper around Phaser's sound manager.
 * Centralises BGM control so any scene can start/stop/duck music.
 */
export default class AudioManager {
  /**
   * @param {Phaser.Scene} scene – owning scene (for sound access)
   */
  constructor(scene) {
    this._scene = scene;
  }

  // ── BGM ───────────────────────────────────────────────────────────────────

  /** Start the background music if not already playing. */
  playBGM(key = 'bgm', volume = 0.55) {
    if (!this._scene.sound.get(key)) {
      this._scene.sound.add(key, { loop: true, volume }).play();
    }
  }

  /** Stop the background music. */
  stopBGM(key = 'bgm') {
    const bgm = this._scene.sound.get(key);
    if (bgm) bgm.stop();
  }

  /** Change playback rate (e.g. boss arrival tension effect). */
  setBGMRate(rate, key = 'bgm') {
    const bgm = this._scene.sound.get(key);
    if (bgm) bgm.setRate(rate);
  }

  /** Smoothly duck volume over `duration` ms then restore it. */
  duck(targetVol = 0.15, duration = 400, restoreVol = 0.55, key = 'bgm') {
    const bgm = this._scene.sound.get(key);
    if (!bgm) return;
    this._scene.tweens.add({
      targets: bgm,
      volume: targetVol,
      duration,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this._scene.tweens.add({
          targets: bgm,
          volume: restoreVol,
          duration: duration * 2,
          ease: 'Sine.easeIn',
        });
      },
    });
  }

  // ── SFX ───────────────────────────────────────────────────────────────────

  /** Play a one-shot sound effect. */
  playSFX(key, volume = 1) {
    if (this._scene.cache.audio.exists(key)) {
      this._scene.sound.play(key, { volume });
    }
  }
}
