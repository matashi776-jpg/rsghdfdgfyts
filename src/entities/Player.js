/**
 * Player.js
 * Serhiy — the cyber-tractor-driver defender.
 * Handles positioning, shooting cooldown, and visual feedback.
 */
import GameConfig from '../core/GameConfig.js';

export default class Player {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene    = scene;
    this.alive    = true;
    this.fireTimer = 0;

    this.sprite = scene.add.image(x, y, 'sergiy')
      .setDisplaySize(48, 72)
      .setTint(0xff88ff)
      .setDepth(5);

    // Idle breathing tween
    scene.tweens.add({
      targets:  this.sprite,
      scaleY:   this.sprite.scaleY * 1.04,
      duration: 1200,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  /** Flash neon cyan when shooting. */
  flashShoot() {
    this.scene.tweens.add({
      targets:  this.sprite,
      tint:     0x00ffff,
      duration: 80,
      yoyo:     true,
      onComplete: () => { if (this.sprite) this.sprite.setTint(0xff88ff); },
    });
  }

  destroy() {
    this.alive = false;
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
