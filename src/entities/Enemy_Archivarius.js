/**
 * Enemy_Archivarius.js
 * Human-filing-cabinet hybrid — mid-tier enemy.
 * High HP, slow speed. Has a chance to temporarily stun projectiles (shield phase).
 */
import Enemy from './Enemy.js';

export default class Enemy_Archivarius extends Enemy {
  constructor(scene, x, y, hp, speed) {
    // Archivarius is slow and tanky
    super(scene, x, y, hp, Math.max(20, speed * 0.7), 'archivarius');
    this._shieldActive   = false;
    this._shieldCooldown = false;
    this._scheduleShield();
  }

  /** Periodically activate a brief document-shield. */
  _scheduleShield() {
    this.scene.time.addEvent({
      delay:    Phaser.Math.Between(4000, 8000),
      callback: this._activateShield,
      callbackScope: this,
      loop:     false,
    });
  }

  _activateShield() {
    if (!this.alive) return;
    this._shieldActive = true;
    if (this.sprite) this.sprite.setAlpha(0.5);
    this.scene.time.delayedCall(1500, () => {
      this._shieldActive = false;
      if (this.sprite) this.sprite.setAlpha(1);
      this._scheduleShield();
    });
  }

  takeDamage(amount) {
    if (this._shieldActive) {
      // Reduce damage by 80% during shield phase
      super.takeDamage(Math.max(1, Math.floor(amount * 0.2)));
    } else {
      super.takeDamage(amount);
    }
  }
}
