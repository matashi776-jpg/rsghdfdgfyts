/**
 * Enemy_Inspector.js
 * Ходяча печать-каратель — Inspector enemy.
 * Fast, low HP. Periodically dashes toward the wall.
 */
import Enemy from './Enemy.js';

export default class Enemy_Inspector extends Enemy {
  constructor(scene, x, y, hp, speed) {
    // Inspector is quick
    super(scene, x, y, hp, speed * 1.5, 'inspector');
    this._dashCooldown = false;
    this._scheduleDash();
  }

  _scheduleDash() {
    this.scene.time.addEvent({
      delay:    Phaser.Math.Between(3000, 6000),
      callback: this._dash,
      callbackScope: this,
    });
  }

  _dash() {
    if (!this.alive || !this.sprite || !this.sprite.active) return;
    // Burst of speed toward the wall
    this.sprite.setTint(0xff0000);
    this.sprite.body.setVelocityX(-this.speed * 3);
    this.scene.time.delayedCall(600, () => {
      if (this.alive && this.sprite) {
        this.sprite.setTint(0xff00aa);
        this.sprite.body.setVelocityX(-this.speed);
      }
      this._scheduleDash();
    });
  }
}
