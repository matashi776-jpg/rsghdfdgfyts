/**
 * AudioManager.js
 * Manages BGM and SFX for ACID KHUTIR.
 */
export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this._bgm = null;
    this._sfx = {};
    this._muted = false;
  }

  playBGM(key, config = { loop: true, volume: 0.5 }) {
    if (this._bgm) this._bgm.stop();
    if (!this.scene.cache.audio.exists(key)) return;
    this._bgm = this.scene.sound.add(key, config);
    if (!this._muted) this._bgm.play();
  }

  stopBGM() {
    if (this._bgm) {
      this._bgm.stop();
      this._bgm = null;
    }
  }

  playSFX(key, config = { volume: 0.7 }) {
    if (this._muted) return;
    if (!this.scene.cache.audio.exists(key)) return;
    this.scene.sound.play(key, config);
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this._bgm) {
      this._muted ? this._bgm.pause() : this._bgm.resume();
    }
    return this._muted;
  }

  get muted() { return this._muted; }
}
