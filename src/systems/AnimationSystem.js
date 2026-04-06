/**
 * AnimationSystem.js
 * Registers Phaser animations for ACID KHUTIR sprites.
 */
export default class AnimationSystem {
  constructor(scene) {
    this.scene = scene;
  }

  createAll() {
    this._registerIfFramesExist('player_idle', [
      { key: 'player_idle', frame: 0 },
    ], 6, -1);

    this._registerIfFramesExist('player_walk', [
      { key: 'player_walk', frame: 0 },
    ], 8, -1);

    this._registerIfFramesExist('player_shoot', [
      { key: 'player_shoot', frame: 0 },
    ], 10, 0);
  }

  _registerIfFramesExist(key, frames, frameRate, repeat) {
    if (this.scene.anims.exists(key)) return;
    const validFrames = frames.filter(f => this.scene.textures.exists(f.key));
    if (validFrames.length === 0) return;
    this.scene.anims.create({ key, frames: validFrames, frameRate, repeat });
  }

  play(sprite, key, ignoreIfPlaying = true) {
    if (this.scene.anims.exists(key)) {
      sprite.play(key, ignoreIfPlaying);
    }
  }
}
