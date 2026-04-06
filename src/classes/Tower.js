/**
 * Tower.js
 * Represents a placed Battle Goose defender.
 */
import Calculator from '../utils/Calculator.js';

export default class Tower {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} lane  – 0|1|2
   */
  constructor(scene, x, y, lane) {
    this.scene = scene;
    this.lane = lane;
    this.level = 1;
    this.baseDamage = 30;
    this.fireRate = 2000; // ms between shots
    this.range = 220;     // px
    this.alive = true;
    this._boosted = false;
    this._originalFireRate = this.fireRate;

    this.sprite = scene.physics.add.sprite(x, y, 'goose');
    this.sprite.setScale(0.15);
    this.sprite.body.allowGravity = false;
    this.sprite.setImmovable(true);
    this.sprite.setDepth(6);
    this.sprite.towerRef = this;

    // Drop shadow – oval beneath the goose, stays fixed (tower doesn't move)
    this._shadow = scene.add.ellipse(x, y + 12, 28, 8, 0x000000, 0.38).setDepth(5);

    // Breathing idle tween: symmetric ±2% scale
    scene.tweens.add({
      targets: this.sprite,
      scaleX: 0.15 * 1.02,
      scaleY: 0.15 * 1.02,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Timer for shooting
    this._shootTimer = scene.time.addEvent({
      delay: this.fireRate,
      callback: this._tryShoot,
      callbackScope: this,
      loop: true,
    });
  }

  get damage() {
    return Calculator.towerDamage(this.baseDamage, this.level);
  }

  _tryShoot() {
    if (!this.alive || !this.scene) return;

    // Find nearest enemy in lane within range
    const enemies = this.scene.enemies || [];
    let target = null;
    let minDist = Infinity;

    for (const enemy of enemies) {
      if (!enemy.alive || !enemy.sprite || !enemy.sprite.active) continue;
      // Same lane check: enemy Y close to tower Y
      if (Math.abs(enemy.sprite.y - this.sprite.y) > 60) continue;
      const dist = this.sprite.x - enemy.sprite.x; // enemy comes from right
      if (dist > 0 && dist < this.range && dist < minDist) {
        minDist = dist;
        target = enemy;
      }
    }

    if (target) {
      this._shoot(target);
    }
  }

  _shoot(target) {
    if (this.scene.fireProjectile) {
      this.scene.fireProjectile(this, target);
    }
  }

  /**
   * Temporarily double the fire rate.
   * @param {number} duration ms
   */
  boost(duration) {
    if (this._boosted) return;
    this._boosted = true;
    this._shootTimer.delay = this.fireRate / 2;
    this._shootTimer.reset({
      delay: this.fireRate / 2,
      callback: this._tryShoot,
      callbackScope: this,
      loop: true,
    });
    this.scene.time.delayedCall(duration, () => {
      if (!this.alive) return;
      this._boosted = false;
      this._shootTimer.reset({
        delay: this.fireRate,
        callback: this._tryShoot,
        callbackScope: this,
        loop: true,
      });
    });
  }

  destroy() {
    this.alive = false;
    if (this._shootTimer) {
      this._shootTimer.destroy();
    }
    if (this._shadow) {
      this._shadow.destroy();
      this._shadow = null;
    }
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }
}
