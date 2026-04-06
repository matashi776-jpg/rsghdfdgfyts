/**
 * AudioManager.js
 * Dynamic audio controller — BGM transitions, SFX playback, boss mode,
 * and low-HP rate filtering.
 *
 * All methods degrade gracefully when audio assets are missing so the game
 * works even without real sound files.
 *
 * Usage (inside a Phaser.Scene):
 *   this.audio = new AudioManager(this);
 *   this.audio.setBossMode(true);
 *   this.audio.playSFX('sfx_shoot');
 */
export default class AudioManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene     = scene;
    this._bgmKey   = null;
    this._bgmSound = null;
    this._bossMode = false;
    this._lowHP    = false;
  }

  // ── BGM ───────────────────────────────────────────────────────────────────

  /**
   * Play a looping background track.
   * If the track is already playing (added by another scene), re-use it.
   */
  playBGM(key = 'bgm', volume = 0.55) {
    this._bgmKey = key;

    // Re-use an already-running instance (e.g. started in StoryScene)
    const existing = this.scene.sound.get(key);
    if (existing) {
      this._bgmSound = existing;
      if (!existing.isPlaying) existing.play({ loop: true });
      return;
    }

    if (this.scene.cache.audio.exists(key)) {
      this._bgmSound = this.scene.sound.add(key, { loop: true, volume });
      this._bgmSound.play();
    }
  }

  /**
   * Fade BGM out then stop it.
   */
  stopBGM(fadeDuration = 800) {
    const snd = this._getBGM();
    if (!snd || !snd.isPlaying) return;
    this.scene.tweens.add({
      targets:  snd,
      volume:   0,
      duration: fadeDuration,
      onComplete: () => { if (snd.isPlaying) snd.stop(); },
    });
  }

  /**
   * Accelerate the BGM for boss encounters (rate 1.25) or reset to normal.
   */
  setBossMode(active) {
    if (active === this._bossMode) return;
    this._bossMode = active;
    const snd = this._getBGM();
    if (snd) snd.setRate(active ? 1.25 : (this._lowHP ? 0.9 : 1.0));
  }

  /**
   * Slow the BGM slightly when the house HP is critically low (< 25 %).
   * This creates a subtle tension effect without a real low-pass filter.
   */
  setLowHP(active) {
    if (active === this._lowHP) return;
    this._lowHP = active;
    if (this._bossMode) return; // boss rate takes priority
    const snd = this._getBGM();
    if (snd) snd.setRate(active ? 0.9 : 1.0);
  }

  // ── SFX ───────────────────────────────────────────────────────────────────

  /**
   * Play a one-shot SFX. Silently ignored if the asset is not loaded.
   * @param {string} key   – asset key registered in PreloadScene
   * @param {object} [cfg] – Phaser.Sound.BaseSoundConfig overrides
   */
  playSFX(key, cfg = {}) {
    if (!this.scene.cache.audio.exists(key)) return;
    try {
      this.scene.sound.play(key, { volume: 0.5, ...cfg });
    } catch (_) {
      // Silently swallow errors for missing or unsupported assets
    }
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  /** @returns {Phaser.Sound.BaseSound|null} */
  _getBGM() {
    if (this._bgmSound) return this._bgmSound;
    if (this._bgmKey)   return this.scene.sound.get(this._bgmKey);
    return this.scene.sound.get('bgm') || null;
  }
}
